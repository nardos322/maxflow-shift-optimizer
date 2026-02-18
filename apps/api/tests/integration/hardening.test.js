const request = require('supertest');
const app = require('../../src/app');
const AuthHelper = require('../utils/authHelper');
const { seedAdmin } = require('../../prisma/seed');
const prisma = require('../../src/lib/prisma');

jest.setTimeout(30000);

describe('API Hardening Tests', () => {
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  test('CORS headers should be present', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  test('Rate Limiter should block excessive requests to /resolver', async () => {
    // Mock the controller to avoid actual processing overhead,
    // OR rely on the fact that rate limiter hits BEFORE controller.
    // We'll just fire requests. Limiter is 5 per minute.

    // We need to ensure we are using the SAME IP. Supertest usually does this.

    // Fire 5 allowed requests
    for (let i = 0; i < 5; i++) {
      // We use a dummy payload, input validation might fail but rate limiter accounts for hits
      // Actually rate limiter runs before validation?
      // In route definition: authenticate -> authorize -> limiter -> controller
      // So we need valid auth.
      await request(app)
        .post('/asignaciones/resolver')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // Payload doesn't matter for rate limit count, hopefully
    }

    // Fire 6th request - Should be blocked
    const res = await request(app)
      .post('/asignaciones/resolver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toEqual(429);
    expect(res.body.error).toMatch(/Demasiadas peticiones/);
  });
});
