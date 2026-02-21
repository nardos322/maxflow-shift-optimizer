import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import Factories from '../../src/lib/factories.js';
import AuthHelper from '../utils/authHelper.js';
import { seedAdmin } from '../../prisma/seed.js';


describe('API Integration Tests - Medicos', () => {
  // Moved to inner scope

  let medicoId; // Para guardar el ID del médico creado
  let adminToken;

  beforeAll(async () => {
    await seedAdmin();
    adminToken = await AuthHelper.getAdminToken();
  });

  /**
   * Test 1: Crear Médico
   */
  test('POST /medicos debe crear un médico nuevo', async () => {
    const nuevoMedico = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@hospital.com',
    };

    const res = await request(app)
      .post('/medicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(nuevoMedico);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(nuevoMedico.nombre);
    expect(res.body.activo).toBe(true); // Por defecto activo

    // Verificar que se devuelve el usuario creado
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(nuevoMedico.email);

    // Verificar en DB que el usuario existe y tiene rol MEDICO
    const userDb = await prisma.user.findUnique({
      where: { email: nuevoMedico.email },
    });
    expect(userDb).toBeDefined();
    expect(userDb.rol).toBe('MEDICO');
    expect(userDb.id).toBe(res.body.user.id);

    medicoId = res.body.id;
  });

  test('POST /medicos debe fallar si el email ya existe', async () => {
    const dupl = {
      nombre: 'Otro Juan',
      email: 'juan.perez@hospital.com', // Mismo email que el anterior
    };

    const res = await request(app)
      .post('/medicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dupl);

    expect(res.statusCode).toEqual(409); // Conflict
    expect(res.body).toHaveProperty('error', 'El email ya está registrado');
  });

  /**
   * Test 2: Listar (Verificación de creación)
   */
  test('GET /medicos debe listar el médico creado', async () => {
    const res = await request(app)
      .get('/medicos')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    const creado = res.body.find((m) => m.id === medicoId);
    expect(creado).toBeDefined();
    expect(creado.nombre).toBe('Juan Pérez');
  });

  /**
   * Test 3: Eliminar (Soft Delete)
   */
  test('DELETE /medicos/:id debe desactivar al médico', async () => {
    const res = await request(app)
      .delete(`/medicos/${medicoId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(204);
  });

  /**
   * Test 4: Listar con filtro de activos
   */
  test('GET /medicos?soloActivos=true NO debe mostrar al médico eliminado', async () => {
    const res = await request(app)
      .get('/medicos?soloActivos=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    const eliminado = res.body.find((m) => m.id === medicoId);
    expect(eliminado).toBeUndefined(); // No debe estar
  });

  /**
   * Test 6: Verificar limpieza de asignaciones futuras
   */
  test('DELETE debe borrar asignaciones futuras', async () => {
    // 1. Crear otro médico
    const medicoRes = await request(app)
      .post('/medicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Dra. Futura',
        email: 'futura@hospital.com',
      });
    const idFutura = medicoRes.body.id;

    // 2. Crear asignación futura manual usando Factories
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    const periodo = await Factories.createPeriodo({
      nombre: 'Periodo Test Futuro',
      fechaInicio: new Date(),
      fechaFin: new Date(),
    });

    await Factories.createAsignacion(idFutura, periodo.id, manana);

    // 3. Eliminar al médico
    await request(app)
      .delete(`/medicos/${idFutura}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // 4. Verificar que la asignación ya no existe
    const asignacion = await prisma.asignacion.findFirst({
      where: { medicoId: idFutura },
    });

    expect(asignacion).toBeNull();
  });

  /**
   * Test 5: Listar sin filtro (Historial)
   */
  test('GET /medicos (sin filtro) SÍ debe mostrar al médico eliminado pero inactivo', async () => {
    const res = await request(app)
      .get('/medicos')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    const historico = res.body.find((m) => m.id === medicoId);
    expect(historico).toBeDefined();
    expect(historico.activo).toBe(false); // Debe estar, pero como false
  });
});
