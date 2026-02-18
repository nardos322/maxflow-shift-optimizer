jest.setTimeout(30000);

const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');
const Factories = require('../../src/lib/factories');
const AuthHelper = require('../utils/authHelper');
const { seedAdmin } = require('../../prisma/seed');

describe('Export Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  beforeEach(async () => {
    await Factories.debugCleanDB();

    // 1. Setup básico para evitar errores de "Configuración no encontrada"
    await Factories.createConfiguracion({});

    // 2. Crear datos de médico y asignación
    const medico = await Factories.createMedico({ nombre: 'Dr. Export' });
    const periodo = await Factories.createPeriodoWithFeriados([new Date()]);

    // 3. Crear una asignación manual para tener qué exportar
    await prisma.asignacion.create({
      data: {
        medicoId: medico.id,
        periodoId: periodo.id,
        fecha: periodo.feriados[0].fecha,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test: Export Excel when assignments exist
   */
  test('GET /export/excel debe retornar archivo XLSX', async () => {
    const res = await request(app)
      .get('/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(res.header['content-disposition']).toContain(
      'attachment; filename=asignaciones.xlsx'
    );
  });

  /**
   * Test: Export ICS when assignments exist
   */
  test('GET /export/ics debe retornar archivo ICS', async () => {
    const res = await request(app)
      .get('/export/ics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('text/calendar');
    expect(res.header['content-disposition']).toContain(
      'attachment; filename=asignaciones.ics'
    );
    // Verifica contenido esperado en formato ICS
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('SUMMARY:Guardia: Dr. Export');
    expect(res.text).toContain('END:VCALENDAR');
  });

  /**
   * Test: 404 if no assignments
   */
  test('GET /export/excel debe retornar 404 si no hay asignaciones', async () => {
    await prisma.asignacion.deleteMany();

    const res = await request(app)
      .get('/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(404);
  });
});
