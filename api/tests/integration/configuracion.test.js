const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/lib/prisma');

describe('API Integration Tests - Configuracion', () => {

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * Test 1: Obtener Configuración (y verificar creación por defecto)
     */
    test('GET /configuracion debe devolver la configuración por defecto o existente', async () => {
        const res = await request(app).get('/configuracion');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('maxGuardiasTotales');
        expect(res.body).toHaveProperty('medicosPorDia');

        // Verificar valores numéricos razonables
        expect(res.body.maxGuardiasTotales).toBeGreaterThan(0);
        expect(res.body.medicosPorDia).toBeGreaterThan(0);
    });

    /**
     * Test 2: Actualizar Configuración
     */
    test('PUT /configuracion debe actualizar los valores', async () => {
        const nuevosValores = {
            maxGuardiasTotales: 10,
            medicosPorDia: 2
        };

        const res = await request(app)
            .put('/configuracion')
            .send(nuevosValores);

        expect(res.statusCode).toEqual(200);
        expect(res.body.maxGuardiasTotales).toBe(nuevosValores.maxGuardiasTotales);
        expect(res.body.medicosPorDia).toBe(nuevosValores.medicosPorDia);
    });

    /**
     * Test 3: Verificar Persistencia de la Actualización
     */
    test('GET /configuracion posterior debe devolver los valores actualizados', async () => {
        const res = await request(app).get('/configuracion');

        expect(res.statusCode).toEqual(200);
        expect(res.body.maxGuardiasTotales).toBe(10);
        expect(res.body.medicosPorDia).toBe(2);
    });
});
