jest.setTimeout(30000);

const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');
const Factories = require('../../src/lib/factories');
const AuthHelper = require('../utils/authHelper');
const { seedAdmin } = require('../../prisma/seed');


describe('API Integration Tests', () => {
    let adminToken;

    beforeAll(async () => {
        await seedAdmin();
        adminToken = await AuthHelper.getAdminToken();
    });

    beforeEach(async () => {
        await Factories.debugCleanDB();

        // Setup por defecto para tests de asignaciones (Escenario Factible)
        await Factories.createConfiguracion({ maxGuardiasTotales: 5, medicosPorDia: 1 });

        const periodos = await Factories.createPeriodoWithFeriados(); // Default: hoy y mañana
        const medicos = await Promise.all([
            Factories.createMedico({ nombre: 'Dr. Test 1' }),
            Factories.createMedico({ nombre: 'Dr. Test 2' })
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
        expect(res.body).toHaveProperty('factible');
        expect(res.body.factible).toBe(true);
        expect(res.body).toHaveProperty('asignaciones');
        expect(Array.isArray(res.body.asignaciones)).toBe(true);
        expect(res.body.asignaciones.length).toBeGreaterThan(0);
    }, 30000); // Timeout aumentado a 30s por performance de CI/local

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
        expect(res.body).toHaveProperty('factible');

        // Debe ser infactible
        expect(res.body.factible).toBe(false);

        // Verificar bottlenecks
        expect(res.body).toHaveProperty('bottlenecks');
        expect(Array.isArray(res.body.bottlenecks)).toBe(true);
        expect(res.body.bottlenecks.length).toBeGreaterThan(0);

        // Al no haber disponibilidad, el bottleneck es de tipo "Day"
        const diaBottleneck = res.body.bottlenecks.find(b => b.tipo === 'Day');
        expect(diaBottleneck).toBeDefined();
    });

});
