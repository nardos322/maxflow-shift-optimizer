const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');
const Factories = require('../utils/factories');

describe('API Integration Tests - Medicos', () => {

    afterAll(async () => {
        await prisma.$disconnect();
    });

    let medicoId; // Para guardar el ID del médico creado

    /**
     * Test 1: Crear Médico
     */
    test('POST /medicos debe crear un médico nuevo', async () => {
        const nuevoMedico = {
            nombre: 'Juan Pérez',
            email: 'juan.perez@hospital.com'
        };

        const res = await request(app)
            .post('/medicos')
            .send(nuevoMedico);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.nombre).toBe(nuevoMedico.nombre);
        expect(res.body.activo).toBe(true); // Por defecto activo

        medicoId = res.body.id;
    });

    /**
     * Test 2: Listar (Verificación de creación)
     */
    test('GET /medicos debe listar el médico creado', async () => {
        const res = await request(app).get('/medicos');

        expect(res.statusCode).toEqual(200);
        const creado = res.body.find(m => m.id === medicoId);
        expect(creado).toBeDefined();
        expect(creado.nombre).toBe('Juan Pérez');
    });

    /**
     * Test 3: Eliminar (Soft Delete)
     */
    test('DELETE /medicos/:id debe desactivar al médico', async () => {
        const res = await request(app).delete(`/medicos/${medicoId}`);
        expect(res.statusCode).toEqual(204);
    });

    /**
     * Test 4: Listar con filtro de activos
     */
    test('GET /medicos?soloActivos=true NO debe mostrar al médico eliminado', async () => {
        const res = await request(app).get('/medicos?soloActivos=true');

        expect(res.statusCode).toEqual(200);
        const eliminado = res.body.find(m => m.id === medicoId);
        expect(eliminado).toBeUndefined(); // No debe estar
    });

    /**
     * Test 6: Verificar limpieza de asignaciones futuras
     */
    test('DELETE debe borrar asignaciones futuras', async () => {
        // 1. Crear otro médico
        const medicoRes = await request(app).post('/medicos').send({
            nombre: 'Dra. Futura',
            email: 'futura@hospital.com'
        });
        const idFutura = medicoRes.body.id;

        // 2. Crear asignación futura manual usando Factories
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);

        const periodo = await Factories.createPeriodo({
            nombre: 'Periodo Test Futuro',
            fechaInicio: new Date(),
            fechaFin: new Date()
        });

        await Factories.createAsignacion(idFutura, periodo.id, manana);

        // 3. Eliminar al médico
        await request(app).delete(`/medicos/${idFutura}`);

        // 4. Verificar que la asignación ya no existe
        const asignacion = await prisma.asignacion.findFirst({
            where: { medicoId: idFutura }
        });

        expect(asignacion).toBeNull();
    });

    /**
     * Test 5: Listar sin filtro (Historial)
     */
    test('GET /medicos (sin filtro) SÍ debe mostrar al médico eliminado pero inactivo', async () => {
        const res = await request(app).get('/medicos');

        expect(res.statusCode).toEqual(200);
        const historico = res.body.find(m => m.id === medicoId);
        expect(historico).toBeDefined();
        expect(historico.activo).toBe(false); // Debe estar, pero como false
    });

});
