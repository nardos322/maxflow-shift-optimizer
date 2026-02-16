jest.setTimeout(30000);

const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');
const Factories = require('../../src/lib/factories');
const AuthHelper = require('../utils/authHelper');
const { seedAdmin } = require('../../prisma/seed');

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
});
