const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');
const Factories = require('../../src/lib/factories');

describe('Input Validation Tests', () => {
  let adminToken;

  const bcrypt = require('bcryptjs');

  // ...

  beforeAll(async () => {
    await Factories.debugCleanDB();
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Admin for authenticated routes
    await prisma.user.create({
      data: {
        nombre: 'Super Admin',
        email: 'admin@valid.com',
        password: passwordHash,
        rol: 'ADMIN',
      },
    });

    // Login to get token
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@valid.com', password: 'password123' });
    adminToken = res.body.token;
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Auth Validation', () => {
    test('POST /auth/login - should fail with invalid email', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'not-an-email',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Error de validación');
      expect(res.body.details[0].path).toBe('body.email');
    });

    test('POST /auth/login - should fail with empty password', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'valid@email.com',
        password: '',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.details[0].path).toBe('body.password');
    });
  });

  describe('Medico Validation', () => {
    test('POST /medicos - should fail with short name', async () => {
      const res = await request(app)
        .post('/medicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'A', // Too short
          email: 'doctor@valid.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.details[0].path).toBe('body.nombre');
    });

    test('POST /medicos - should fail with invalid email', async () => {
      const res = await request(app)
        .post('/medicos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Dr. House',
          email: 'bad-email',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Periodo Validation', () => {
    test('POST /periodos - should fail if fechaFin < fechaInicio', async () => {
      const res = await request(app)
        .post('/periodos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Periodo Invalido',
          fechaInicio: '2026-01-05',
          fechaFin: '2026-01-01', // Before start
        });

      expect(res.statusCode).toBe(400);
      // The Refine error usually attaches to the path we specified or the root
      const error = res.body.details.find((e) =>
        e.message.includes('posterior')
      );
      expect(error).toBeTruthy();
    });
  });
});
