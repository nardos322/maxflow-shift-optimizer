import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import Factories from '../../src/lib/factories.js';
import AuthHelper from '../utils/authHelper.js';
import { seedAdmin } from '../../prisma/seed.js';


describe('Integration: Shift Repair', () => {
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  beforeEach(async () => {
    await Factories.debugCleanDB();
    await Factories.createConfiguracion({
      maxGuardiasTotales: 5,
      medicosPorDia: 1,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should redistribute shifts from a removed doctor to others', async () => {
    // 1. Setup: 3 Medicos
    const [drA, drB, drC] = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. A', email: 'a@test.com' }),
      Factories.createMedico({ nombre: 'Dr. B', email: 'b@test.com' }),
      Factories.createMedico({ nombre: 'Dr. C', email: 'c@test.com' }),
    ]);

    const fechaBase = new Date();
    fechaBase.setDate(fechaBase.getDate() + 5);
    const dias = [
      new Date(fechaBase),
      new Date(fechaBase.getTime() + 86400000),
      new Date(fechaBase.getTime() + 86400000 * 2),
    ];

    const periodo = await Factories.createPeriodoWithFeriados(dias);

    // Disponibilidad: Todos pueden todo
    for (const m of [drA, drB, drC]) {
      for (const f of periodo.feriados) {
        await Factories.createDisponibilidad(m.id, f.fecha);
      }
    }

    // Asignaciones Iniciales
    const baseVersion = await prisma.planVersion.create({
      data: {
        tipo: 'BASE',
        estado: 'PUBLICADO',
        usuario: 'admin@test.com',
      },
    });

    await Factories.createAsignacion(drA.id, periodo.id, dias[0]); // Se va
    await Factories.createAsignacion(drB.id, periodo.id, dias[1]);
    await Factories.createAsignacion(drC.id, periodo.id, dias[2]);

    await prisma.asignacion.updateMany({
      data: { planVersionId: baseVersion.id },
    });

    // 2. Ejecutar Reparación (Sacar a Dr. A)
    const res = await request(app)
      .post('/asignaciones/reparar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ medicoId: drA.id, darDeBaja: true });

    expect(res.status).toBe(200);
    expect(['OPTIMAL', 'FEASIBLE']).toContain(res.body.status);
    expect(res.body.reasignaciones).toBeGreaterThan(0);
    expect(res.body.planVersion).toBeDefined();
    expect(res.body.planVersion.tipo).toBe('REPAIR');
    expect(res.body.planVersion.sourcePlanVersionId).toBe(baseVersion.id);

    // 3. Verificar estado final en DB
    const asignacionesFinales = await prisma.asignacion.findMany({
      orderBy: { fecha: 'asc' },
      include: { medico: true },
    });

    // El Dr. A NO debe tener asignaciones
    const asignacionesDrA = asignacionesFinales.filter(
      (a) => a.medicoId === drA.id
    );
    expect(asignacionesDrA.length).toBe(0);

    // El Dia 1 (que era de A) debe estar cubierto por B o C
    // console.log('DEBUG: Asignaciones finales:', asignacionesFinales.map(a => ({ f: a.fecha, m: a.medicoId })));
    const asignacionDia1 = asignacionesFinales.find(
      (a) =>
        a.fecha.toISOString().split('T')[0] ===
        dias[0].toISOString().split('T')[0]
    );
    expect(asignacionDia1).toBeDefined();
    expect([drB.id, drC.id]).toContain(asignacionDia1.medicoId);

    // El Dr. A debe estar inactivo
    const drAUpdated = await prisma.medico.findUnique({
      where: { id: drA.id },
    });
    expect(drAUpdated.activo).toBe(false);
  });

  it('should return error if constraints make repair impossible', async () => {
    await Factories.createConfiguracion({ maxGuardiasTotales: 1 });

    const [drA, drB] = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. A', email: 'a@test.com' }),
      Factories.createMedico({ nombre: 'Dr. B', email: 'b@test.com' }),
    ]);

    const dias = [new Date(), new Date(Date.now() + 86400000)];
    const periodo = await Factories.createPeriodoWithFeriados(dias);

    // Disponibilidad full
    for (const m of [drA, drB]) {
      for (const f of periodo.feriados) {
        await Factories.createDisponibilidad(m.id, f.fecha);
      }
    }

    await Factories.createAsignacion(drA.id, periodo.id, dias[0]);
    await Factories.createAsignacion(drB.id, periodo.id, dias[1]);

    const res = await request(app)
      .post('/asignaciones/reparar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ medicoId: drA.id });

    expect(res.status).toBe(200);
    expect(['OPTIMAL', 'FEASIBLE']).not.toContain(res.body.status);

    // Debe devolver explicación (minCut)
    expect(res.body.minCut).toBeDefined();
  });

  it('should only repair assignments inside provided window', async () => {
    const [drA, drB] = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. Window A', email: 'window-a@test.com' }),
      Factories.createMedico({ nombre: 'Dr. Window B', email: 'window-b@test.com' }),
    ]);

    const base = new Date();
    base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() + 8);

    const diaDentro = new Date(base);
    const diaFuera = new Date(base.getTime() + 86400000);

    const periodo = await Factories.createPeriodoWithFeriados([diaDentro, diaFuera]);

    for (const medico of [drA, drB]) {
      for (const feriado of periodo.feriados) {
        await Factories.createDisponibilidad(medico.id, feriado.fecha);
      }
    }

    await Factories.createAsignacion(drA.id, periodo.id, diaDentro);
    await Factories.createAsignacion(drA.id, periodo.id, diaFuera);

    const res = await request(app)
      .post('/asignaciones/reparar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        medicoId: drA.id,
        ventanaInicio: diaDentro.toISOString(),
        ventanaFin: diaDentro.toISOString(),
      });

    expect(res.status).toBe(200);
    expect(['OPTIMAL', 'FEASIBLE']).toContain(res.body.status);

    const asignacionDentro = await prisma.asignacion.findFirst({
      where: { fecha: diaDentro },
    });
    expect(asignacionDentro).toBeDefined();
    expect(asignacionDentro.medicoId).toBe(drB.id);

    const asignacionFuera = await prisma.asignacion.findFirst({
      where: { fecha: diaFuera },
    });
    expect(asignacionFuera).toBeDefined();
    expect(asignacionFuera.medicoId).toBe(drA.id);
  });

  it('should not repair when requested window is fully frozen', async () => {
    await Factories.createConfiguracion({
      maxGuardiasTotales: 5,
      medicosPorDia: 1,
      freezeDays: 30,
    });

    const [drA, drB] = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. Freeze A', email: 'freeze-a@test.com' }),
      Factories.createMedico({ nombre: 'Dr. Freeze B', email: 'freeze-b@test.com' }),
    ]);

    const diaCercano = new Date();
    diaCercano.setDate(diaCercano.getDate() + 2);
    diaCercano.setHours(0, 0, 0, 0);

    const periodo = await Factories.createPeriodoWithFeriados([diaCercano]);
    await Factories.createDisponibilidad(drA.id, diaCercano);
    await Factories.createDisponibilidad(drB.id, diaCercano);
    await Factories.createAsignacion(drA.id, periodo.id, diaCercano);

    const res = await request(app)
      .post('/asignaciones/reparar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        medicoId: drA.id,
        ventanaInicio: diaCercano.toISOString(),
        ventanaFin: diaCercano.toISOString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.message).toContain('período congelado');

    const asignacion = await prisma.asignacion.findFirst({
      where: { fecha: diaCercano },
    });
    expect(asignacion).toBeDefined();
    expect(asignacion.medicoId).toBe(drA.id);
  });

  it('should return a diff between two plan versions', async () => {
    const [drA, drB] = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. Diff A', email: 'diff-a@test.com' }),
      Factories.createMedico({ nombre: 'Dr. Diff B', email: 'diff-b@test.com' }),
    ]);

    const dia = new Date();
    dia.setDate(dia.getDate() + 9);
    dia.setHours(0, 0, 0, 0);

    const periodo = await Factories.createPeriodoWithFeriados([dia]);
    await Factories.createDisponibilidad(drA.id, dia);
    await Factories.createDisponibilidad(drB.id, dia);

    const baseVersion = await prisma.planVersion.create({
      data: {
        tipo: 'BASE',
        estado: 'PUBLICADO',
        usuario: 'admin@test.com',
      },
    });

    const baseAsignacion = await Factories.createAsignacion(drA.id, periodo.id, dia);
    await prisma.asignacion.update({
      where: { id: baseAsignacion.id },
      data: { planVersionId: baseVersion.id },
    });

    const repairRes = await request(app)
      .post('/asignaciones/reparar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ medicoId: drA.id });

    expect(repairRes.status).toBe(200);
    expect(repairRes.body.status).toBe('FEASIBLE');
    const repairVersionId = repairRes.body.planVersion.id;

    const diffRes = await request(app)
      .get('/asignaciones/diff')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        fromVersionId: baseVersion.id,
        toVersionId: repairVersionId,
      });

    expect(diffRes.status).toBe(200);
    expect(diffRes.body).toHaveProperty('resumen');
    expect(diffRes.body.resumen.cambiosNetos).toBeGreaterThan(0);
    expect(Array.isArray(diffRes.body.agregadas)).toBe(true);
    expect(Array.isArray(diffRes.body.removidas)).toBe(true);
  });

  it('should preview repair impact without changing assignments', async () => {
    const [drA, drB] = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. Prev A', email: 'prev-a@test.com' }),
      Factories.createMedico({ nombre: 'Dr. Prev B', email: 'prev-b@test.com' }),
    ]);

    const dia = new Date();
    dia.setDate(dia.getDate() + 6);
    dia.setHours(0, 0, 0, 0);

    const periodo = await Factories.createPeriodoWithFeriados([dia]);
    await Factories.createDisponibilidad(drA.id, dia);
    await Factories.createDisponibilidad(drB.id, dia);
    await Factories.createAsignacion(drA.id, periodo.id, dia);

    const preRes = await request(app)
      .post('/asignaciones/reparaciones/previsualizar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        medicoId: drA.id,
        ventanaInicio: dia.toISOString(),
        ventanaFin: dia.toISOString(),
      });

    expect(preRes.status).toBe(200);
    expect(preRes.body.status).toBe('FEASIBLE');
    expect(preRes.body).toHaveProperty('resumenImpacto');
    expect(preRes.body.resumenImpacto.guardiasRemovidas).toBe(1);
    expect(preRes.body.resumenImpacto.guardiasReasignadas).toBeGreaterThan(0);

    const afterPreview = await prisma.asignacion.findFirst({
      where: { fecha: dia },
    });
    expect(afterPreview.medicoId).toBe(drA.id);

    const candidateCount = await prisma.planVersion.count({
      where: { tipo: 'REPAIR_CANDIDATE' },
    });
    expect(candidateCount).toBe(0);
  });

  it('should create repair candidate without applying, then publish to apply snapshot', async () => {
    const [drA, drB] = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. Cand A', email: 'cand-a@test.com' }),
      Factories.createMedico({ nombre: 'Dr. Cand B', email: 'cand-b@test.com' }),
    ]);

    const dia = new Date();
    dia.setDate(dia.getDate() + 7);
    dia.setHours(0, 0, 0, 0);

    const periodo = await Factories.createPeriodoWithFeriados([dia]);
    await Factories.createDisponibilidad(drA.id, dia);
    await Factories.createDisponibilidad(drB.id, dia);

    const baseVersion = await prisma.planVersion.create({
      data: {
        tipo: 'BASE',
        estado: 'PUBLICADO',
        usuario: 'admin@test.com',
      },
    });

    const asignacionBase = await Factories.createAsignacion(drA.id, periodo.id, dia);
    await prisma.asignacion.update({
      where: { id: asignacionBase.id },
      data: { planVersionId: baseVersion.id },
    });

    const candidataRes = await request(app)
      .post('/asignaciones/reparaciones/candidatas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        medicoId: drA.id,
        ventanaInicio: dia.toISOString(),
        ventanaFin: dia.toISOString(),
      });

    expect(candidataRes.status).toBe(200);
    expect(candidataRes.body.status).toBe('FEASIBLE');
    expect(candidataRes.body.planVersion.tipo).toBe('REPAIR_CANDIDATE');
    const candidataId = candidataRes.body.planVersion.id;

    const antesPublicar = await prisma.asignacion.findFirst({
      where: { fecha: dia },
    });
    expect(antesPublicar.medicoId).toBe(drA.id);

    const publishRes = await request(app)
      .post(`/asignaciones/versiones/${candidataId}/publicar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.id).toBe(candidataId);
    expect(publishRes.body.estado).toBe('PUBLICADO');

    const despuesPublicar = await prisma.asignacion.findFirst({
      where: { fecha: dia },
    });
    expect(despuesPublicar.medicoId).toBe(drB.id);
    expect(despuesPublicar.planVersionId).toBe(candidataId);
  });
});
