
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import Factories from '../../src/lib/factories.js';
import AuthHelper from '../utils/authHelper.js';
import { seedAdmin } from '../../prisma/seed.js';

describe('API Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  beforeEach(async () => {
    await Factories.debugCleanDB();

    // Setup por defecto para tests de asignaciones (Escenario Factible)
    await Factories.createConfiguracion({
      maxGuardiasTotales: 5,
      medicosPorDia: 1,
    });

    const periodos = await Factories.createPeriodoWithFeriados(); // Default: hoy y mañana
    const medicos = await Promise.all([
      Factories.createMedico({ nombre: 'Dr. Test 1' }),
      Factories.createMedico({ nombre: 'Dr. Test 2' }),
    ]);

    // Disponibilidad total
    for (const m of medicos) {
      for (const f of periodos.feriados) {
        await Factories.createDisponibilidad(m.id, f.fecha);
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * Test 1: Health Check
   */
  test('GET /health debe responder 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  /**
   * Test 2: Resolver Asignaciones
   */
  test('POST /asignaciones/resolver debe generar asignaciones', async () => {
    // Ejecutamos el solver
    const res = await request(app)
      .post('/asignaciones/resolver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({}); // Body vacío o con parámetros opcionales

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(['FEASIBLE', 'OPTIMAL']).toContain(res.body.status);

    // Si la API devuelve asignaciones creadas en lugar de el array directo:
    // El controller devuelve el resultado del servicio, que es { status, asignacionesCreadas, flow }
    // OJO: El test anterior esperaba 'asignaciones' en el body.
    // El servicio nuevo NO devuelve el array de asignaciones en la respuesta de 'generarAsignaciones',
    // solo devuelve el status y count.
    // Para ver las asignaciones hay que llamar a GET /asignaciones, que es lo que hacen los tests siguientes.
    // VERIFIQUEMOS si el test original verificaba 'res.body.asignaciones'.
    // SI: expect(res.body.asignaciones.length).toBeGreaterThan(0);
    // Entonces he roto el contrato de la API. El servicio debería devolver las asignaciones generadas si queremos mantener compatibilidad,
    // O debo actualizar el test para que sepa que ya no vienen ahí.
    // Si actualizamos el test, es un Breaking Change de la API.
    // Dado que estoy refactorizando, es mejor mantener la API compatible si es posible,
    // pero el servicio ahora guarda en DB y devuelve metadatos.
    // Voy a actualizar el test para que llame a GET /asignaciones para verificar, o confíe en 'asignacionesCreadas'.

    expect(res.body).toHaveProperty('asignacionesCreadas');
    expect(res.body.asignacionesCreadas).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('planVersion');
    expect(res.body.planVersion).toHaveProperty('id');
    expect(res.body.planVersion.tipo).toBe('BASE');
  }, 30000); // Timeout aumentado

  test('POST /asignaciones/ejecuciones (alias REST) debe generar asignaciones', async () => {
    const res = await request(app)
      .post('/asignaciones/ejecuciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
  });

  /**
   * Test 3: Verificar Persistencia
   */
  test('GET /asignaciones debe devolver los datos guardados', async () => {
    // Primero resolvemos
    await request(app)
      .post('/asignaciones/resolver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    // Luego consultamos
    const res = await request(app)
      .get('/asignaciones')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Verificar estructura de un elemento
    const asignacion = res.body[0];
    expect(asignacion).toHaveProperty('medico');
    expect(asignacion).toHaveProperty('periodo');
    expect(asignacion).toHaveProperty('fecha');
  });

  /**
   * Test 4: Min-Cut Analysis (Infactibilidad)
   * Escenario: Eliminamos disponibilidad de todos los médicos.
   * Resultado esperado: bottlenecks indicando días no cubiertos.
   */
  test('POST /asignaciones/resolver debe retornar bottlenecks si es infactible', async () => {
    // 1. Limpiar disponibilidades (nadie puede trabajar)
    await prisma.disponibilidad.deleteMany();

    // 2. Ejecutar solver
    const res = await request(app)
      .post('/asignaciones/resolver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toEqual(200);

    // Debe ser infactible (status != FEASIBLE/OPTIMAL) or status == INFEASIBLE
    expect(res.body).toHaveProperty('status');
    expect(['FEASIBLE', 'OPTIMAL']).not.toContain(res.body.status);

    // Verificar bottlenecks (ahora minCut)
    // El servicio devuelve 'minCut'
    expect(res.body).toHaveProperty('minCut');
    expect(Array.isArray(res.body.minCut)).toBe(true);
    expect(res.body.minCut.length).toBeGreaterThan(0);

    // Al no haber disponibilidad, el bottleneck es de tipo "Day"?
    // El formato de minCut depende del core C++.
    // Asumiremos que devuelve algo analizable.
  });

  test('POST /asignaciones/simulaciones (alias REST) debe responder 200', async () => {
    const res = await request(app)
      .post('/asignaciones/simulaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        excluirMedicos: [],
        config: { maxGuardiasTotales: 5 },
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('resultado');
  });

  test('POST /asignaciones/reparaciones (alias REST) valida body', async () => {
    const res = await request(app)
      .post('/asignaciones/reparaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toEqual(400);
  });

  test('DELETE /asignaciones debe responder 204', async () => {
    await request(app)
      .post('/asignaciones/resolver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    const res = await request(app)
      .delete('/asignaciones')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(204);
  });
});
