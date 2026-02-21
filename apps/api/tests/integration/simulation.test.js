
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import Factories from '../../src/lib/factories.js';
import AuthHelper from '../utils/authHelper.js';
import { seedAdmin } from '../../prisma/seed.js';

describe('Simulation Endpoint Tests', () => {
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  beforeEach(async () => {
    await Factories.debugCleanDB();

    // Setup feasible scenario
    await Factories.createConfiguracion({
      maxGuardiasTotales: 5,
      medicosPorDia: 1,
    });

    const periodos = await Factories.createPeriodoWithFeriados();
    const medicos = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. Sim 1' }),
      Factories.createMedico({ nombre: 'Dr. Sim 2' }),
    ]);

    // Full availability
    for (const m of medicos) {
      for (const f of periodos.feriados) {
        await Factories.createDisponibilidad(m.id, f.fecha);
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /asignaciones/simular should return feasible result without saving to DB', async () => {
    // 1. Run simulation
    const res = await request(app)
      .post('/asignaciones/simular')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        excluirMedicos: [],
        config: { maxGuardiasTotales: 5 },
      });

    // 2. Verify response
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('resultado');
    expect(res.body.resultado).toHaveProperty('factible', true);
    expect(res.body.resultado.asignaciones.length).toBeGreaterThan(0);

    // 3. Verify parameters echo
    expect(res.body).toHaveProperty('parametros');
    expect(res.body.parametros.config.maxGuardiasTotales).toBe(5);

    // 4. Verify NO persistence (Database should be empty of assignments)
    const dbAssignments = await prisma.asignacion.findMany();
    expect(dbAssignments.length).toBe(0);
  });

  test('POST /asignaciones/simular with doctor exclusion should affect feasibility', async () => {
    // Exclude all doctors
    const medicos = await prisma.medico.findMany();
    const ids = medicos.map((m) => m.id);

    const res = await request(app)
      .post('/asignaciones/simular')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        excluirMedicos: ids,
        config: { maxGuardiasTotales: 5 },
      });

    // Should be infeasible or error message
    expect(res.statusCode).toEqual(200);
    // Service returns { factible: false, message: ... } if no doctors
    if (res.body.resultado) {
      expect(res.body.resultado.factible).toBe(false);
    } else {
      expect(res.body.factible).toBe(false);
      expect(res.body).toHaveProperty('message');
    }
  });

  test('POST /asignaciones/simular should fail 400 with invalid input', async () => {
    const res = await request(app)
      .post('/asignaciones/simular')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        excluirMedicos: ['invalid_id'], // Should be array of numbers
        config: { maxGuardiasTotales: 'five' }, // Should be number
      });

    expect(res.statusCode).toEqual(400); // Bad Request validation error
  });

  test('POST /asignaciones/simular should accept period selection and hypothetical doctors', async () => {
    const periodos = await prisma.periodo.findMany({ select: { id: true } });

    const res = await request(app)
      .post('/asignaciones/simular')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        periodosIds: [periodos[0].id],
        excluirMedicos: [],
        medicosHipoteticos: [{ nombre: 'Dra. Escenario' }],
        config: { maxGuardiasTotales: 6 },
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('resultado');
    expect(res.body).toHaveProperty('parametros');
    expect(res.body.parametros.medicosHipoteticos).toBe(1);
    expect(res.body.parametros.periodosConsiderados).toBe(1);
  });
});
