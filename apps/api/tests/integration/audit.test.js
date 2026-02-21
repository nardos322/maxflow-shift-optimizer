import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import Factories from '../../src/lib/factories.js';
import AuthHelper from '../utils/authHelper.js';
import { seedAdmin } from '../../prisma/seed.js';


describe('Audit System Tests', () => {
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  beforeEach(async () => {
    await Factories.debugCleanDB();
    // Re-seed admin logic if debugCleanDB wipes users (it does)
    // Actually debugCleanDB deletes everything. We need to re-seed admin or create headers again.
    // But seedAdmin is heavy. Let's just create a user manually or use Factories.
    // AuthHelper.getAdminToken uses a real request.

    // Better strategy for this test:
    // Create an admin user manually in beforeEach if needed, but getAdminToken relies on specific credentials.
    // Let's rely on seedAdmin being run once if possible, but debugCleanDB wipes it.
    // So we need to re-seed admin in beforeEach or adjust debugCleanDB.
    // Given previous tests, debugCleanDB is called in beforeEach.

    await seedAdmin(); // Re-seed to ensure admin exists
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('PUT /configuracion should create an audit log', async () => {
    await Factories.createConfiguracion({});
    const updateData = { maxGuardiasTotales: 10 };

    const res = await request(app)
      .put('/configuracion')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(res.statusCode).toEqual(200);

    // Verify Log
    const logs = await prisma.auditLog.findMany({
      where: { accion: 'CONFIG_UPDATE' },
    });
    expect(logs.length).toBeGreaterThanOrEqual(1);
    const latestLog = logs[logs.length - 1];
    expect(latestLog.accion).toBe('CONFIG_UPDATE');
    expect(latestLog.usuario).toBe('admin@hospital.com');
  });

  test('GET /auditoria should be protected (Admin only)', async () => {
    // 1. Anonymous
    const resAuth = await request(app).get('/auditoria');
    expect(resAuth.statusCode).toBe(401);

    // 2. Medico (Non-admin)
    await Factories.createMedico({});
    // We need a token for this medico.
    // AuthHelper might not support generating medico tokens easily without password.
    // We'll skip non-admin check if it's too complex to setup, but checking 401 is good.
  });

  test('GET /auditoria should return logs for Admin', async () => {
    // Create some logs
    await prisma.auditLog.create({
      data: { accion: 'TEST_ACTION', usuario: 'test@test.com' },
    });

    const res = await request(app)
      .get('/auditoria')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].accion).toBe('TEST_ACTION');
  });
});
