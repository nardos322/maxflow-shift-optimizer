
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import Factories from '../../src/lib/factories.js';
import AuthHelper from '../utils/authHelper.js';
import { seedAdmin } from '../../prisma/seed.js';

describe('Fairness Report Endpoint Tests', () => {
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  beforeEach(async () => {
    await Factories.debugCleanDB();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /reportes/equidad should return empty metrics when no data', async () => {
    // No doctors or assignments
    const res = await request(app)
      .get('/reportes/equidad')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      'message',
      'No hay médicos activos para analizar.'
    );
  });

  test('GET /reportes/equidad should return correct metrics for balanced scenarios', async () => {
    // 1. Setup 2 doctors
    const m1 = await Factories.createMedico({ nombre: 'Dr. A' });
    const m2 = await Factories.createMedico({ nombre: 'Dr. B' });

    // 2. Setup 1 period
    const periodo = await Factories.createPeriodo({ nombre: 'Test Period' });

    // 3. Assign 1 shift to each (Perfectly balanced)
    await Factories.createAsignacion(m1.id, periodo.id, new Date('2026-01-01'));
    await Factories.createAsignacion(m2.id, periodo.id, new Date('2026-01-02'));

    const res = await request(app)
      .get('/reportes/equidad')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.estadisticasGlobales.totalGuardias).toBe(2);
    expect(res.body.estadisticasGlobales.medicosActivos).toBe(2);
    expect(res.body.estadisticasGlobales.promedioPorMedico).toBe(1);
    expect(res.body.estadisticasGlobales.desviacionEstandar).toBe(0); // Perfect balance
    expect(res.body.detallePorMedico).toHaveLength(2);
  });

  test('GET /reportes/equidad should reflect unbalance', async () => {
    // 1. Setup 2 doctors
    const m1 = await Factories.createMedico({ nombre: 'Dr. A' });
    await Factories.createMedico({ nombre: 'Dr. B' }); // 0 shifts

    const periodo = await Factories.createPeriodo({ nombre: 'Test Period' });

    // 2. Assign 2 shifts to Dr. A
    await Factories.createAsignacion(m1.id, periodo.id, new Date('2026-01-01'));
    await Factories.createAsignacion(m1.id, periodo.id, new Date('2026-01-02'));

    const res = await request(app)
      .get('/reportes/equidad')
      .set('Authorization', `Bearer ${adminToken}`);

    if (res.statusCode !== 200) {
      console.error('Error Response:', JSON.stringify(res.body, null, 2));
    }

    expect(res.statusCode).toEqual(200);

    // Debug
    // console.log('Unbalanced Response:', JSON.stringify(res.body, null, 2));

    expect(res.body.estadisticasGlobales.promedioPorMedico).toBe(1);
    expect(res.body.estadisticasGlobales.desviacionEstandar).toBe(1);

    // Verify sorting (most shifts first)
    expect(res.body.detallePorMedico).toHaveLength(2);
    expect(res.body.detallePorMedico[0].nombre).toBe('Dr. A');
    expect(res.body.detallePorMedico[1].nombre).toBe('Dr. B');
  });

  test('GET /reportes/faltantes should return uncovered future shifts with reason', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDay = new Date(today);
    futureDay.setDate(futureDay.getDate() + 3);

    await Factories.createConfiguracion({
      maxGuardiasTotales: 5,
      medicosPorDia: 2,
    });

    const periodo = await Factories.createPeriodoWithFeriados([futureDay]);
    const medico = await Factories.createMedico({ nombre: 'Dr. Cobertura' });
    await Factories.createAsignacion(medico.id, periodo.id, futureDay);

    const res = await request(app)
      .get('/reportes/faltantes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].faltantes).toBe(1);
    expect(res.body[0].medicosRequeridos).toBe(2);
    expect(res.body[0].medicosAsignados).toBe(1);
    expect(res.body[0].motivo).toContain('Faltan 1 médico');
  });

  test('GET /reportes/equidad should calculate coverage using only future demand', async () => {
    await Factories.createConfiguracion({
      maxGuardiasTotales: 5,
      medicosPorDia: 1,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastDay = new Date(today);
    pastDay.setDate(pastDay.getDate() - 2);
    const futureDay = new Date(today);
    futureDay.setDate(futureDay.getDate() + 2);

    const periodo = await Factories.createPeriodoWithFeriados([pastDay, futureDay]);
    const medico = await Factories.createMedico({ nombre: 'Dr. Futuro' });

    await Factories.createAsignacion(medico.id, periodo.id, futureDay);

    const res = await request(app)
      .get('/reportes/equidad')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.estadisticasGlobales.totalTurnosRequeridos).toBe(1);
    expect(res.body.estadisticasGlobales.turnosSinCobertura).toBe(0);
    expect(res.body.estadisticasGlobales.coberturaPorcentaje).toBe(100);
  });
});
