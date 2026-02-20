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
    await Factories.createAsignacion(drA.id, periodo.id, dias[0]); // Se va
    await Factories.createAsignacion(drB.id, periodo.id, dias[1]);
    await Factories.createAsignacion(drC.id, periodo.id, dias[2]);

    // 2. Ejecutar Reparación (Sacar a Dr. A)
    const res = await request(app)
      .post('/asignaciones/reparar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ medicoId: drA.id, darDeBaja: true });

    expect(res.status).toBe(200);
    expect(['OPTIMAL', 'FEASIBLE']).toContain(res.body.status);
    expect(res.body.reasignaciones).toBeGreaterThan(0);

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
});
