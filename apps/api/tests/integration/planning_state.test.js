import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import Factories from '../../src/lib/factories.js';
import AuthHelper from '../utils/authHelper.js';

describe('Planning state behavior', () => {
  let adminToken;

  beforeAll(async () => {
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

  test('after solver, medico should not see already planned feriados in /periodos', async () => {
    const futureDay = new Date();
    futureDay.setDate(futureDay.getDate() + 3);
    futureDay.setHours(0, 0, 0, 0);

    const periodo = await Factories.createPeriodoWithFeriados([futureDay]);
    const medicos = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. A' }),
      Factories.createMedico({ nombre: 'Dr. B' }),
    ]);

    for (const medico of medicos) {
      await Factories.createDisponibilidad(medico.id, futureDay);
    }

    const solveRes = await request(app)
      .post('/asignaciones/resolver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(solveRes.statusCode).toBe(200);
    expect(solveRes.body.status).toBe('FEASIBLE');

    const feriadoDb = await prisma.feriado.findFirst({
      where: { periodoId: periodo.id },
    });
    expect(feriadoDb.estadoPlanificacion).toBe('PLANIFICADO');

    const { user: medicoUser, token: medicoToken } =
      await AuthHelper.createUserAndGetToken('MEDICO', {
        email: `nuevo-medico-${Date.now()}@test.com`,
      });

    await Factories.createMedico({
      nombre: 'Dr. Nuevo',
      email: medicoUser.email,
      userId: medicoUser.id,
    });

    const periodosMedicoRes = await request(app)
      .get('/periodos')
      .set('Authorization', `Bearer ${medicoToken}`);

    expect(periodosMedicoRes.statusCode).toBe(200);
    expect(Array.isArray(periodosMedicoRes.body)).toBe(true);
    expect(periodosMedicoRes.body).toHaveLength(0);
  });

  test('medico cannot add disponibilidad for feriado already planned', async () => {
    const futureDay = new Date();
    futureDay.setDate(futureDay.getDate() + 4);
    futureDay.setHours(0, 0, 0, 0);

    const periodo = await Factories.createPeriodoWithFeriados([futureDay]);

    const { user: medUser, token: medToken } =
      await AuthHelper.createUserAndGetToken('MEDICO', {
        email: `planificado-medico-${Date.now()}@test.com`,
      });

    const medico = await Factories.createMedico({
      nombre: 'Dra. Estado',
      email: medUser.email,
      userId: medUser.id,
    });

    await prisma.feriado.updateMany({
      where: { periodoId: periodo.id },
      data: { estadoPlanificacion: 'PLANIFICADO' },
    });

    const res = await request(app)
      .post(`/medicos/${medico.id}/disponibilidad`)
      .set('Authorization', `Bearer ${medToken}`)
      .send({ fechas: [futureDay.toISOString()] });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Fechas no disponibles para edición');
  });
});
