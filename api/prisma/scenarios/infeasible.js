const prisma = require('../../src/lib/prisma');
const { seedAdmin } = require('../seedAdmin');
const Factories = require('../../src/lib/factories');

async function main() {
    console.log('🔥 Iniciando seed: INFEASIBLE (Infactible)...');
    await seedAdmin();

    // Limpiar datos existentes
    await Factories.debugCleanDB();

    // Crear configuración global AMBICIOSA
    await Factories.createConfiguracion({
        maxGuardiasTotales: 5,
        medicosPorDia: 2, // Requerimos 2 médicos por día
    });
    console.log('✅ Configuración creada (C=5, pero 2 médicos requeridos por día)');

    // Crear médicos (Solo 2 médicos para cubrir mucha demanda)
    const medicos = await Promise.all([
        Factories.createMedico({ nombre: 'Dr. Solitario', email: 'solitario@hospital.com' }),
        Factories.createMedico({ nombre: 'Dra. Sobrecargada', email: 'sobrecargada@hospital.com' }),
    ]);
    console.log(`✅ ${medicos.length} médicos creados (muy posos para la demanda)`);

    // Crear un solo período pero exigente
    const periodo = await prisma.periodo.create({
        data: {
            nombre: 'Semana Imposible 2026',
            fechaInicio: new Date('2026-06-01'),
            fechaFin: new Date('2026-06-05'),
            feriados: {
                create: [
                    { fecha: new Date('2026-06-01'), descripcion: 'Lunes' },
                    { fecha: new Date('2026-06-02'), descripcion: 'Martes' },
                    { fecha: new Date('2026-06-03'), descripcion: 'Miércoles' },
                    { fecha: new Date('2026-06-04'), descripcion: 'Jueves' },
                    { fecha: new Date('2026-06-05'), descripcion: 'Viernes' },
                ],
            },
        },
    });

    console.log('✅ Período de 5 días creado (con req de 2 medicos/dia = 10 turnos totales)');

    // Crear disponibilidad LIMITADA
    const disponibilidadData = [
        { medicoId: medicos[0].id, fecha: new Date('2026-06-01') },
        { medicoId: medicos[0].id, fecha: new Date('2026-06-02') },

        { medicoId: medicos[1].id, fecha: new Date('2026-06-01') },
        { medicoId: medicos[1].id, fecha: new Date('2026-06-03') },
        { medicoId: medicos[1].id, fecha: new Date('2026-06-05') },
    ];

    for (const d of disponibilidadData) {
        await Factories.createDisponibilidad(d.medicoId, d.fecha);
    }
    console.log(`✅ ${disponibilidadData.length} registros de disponibilidad creados (Oferta insuficiente)`);

    console.log('');
    console.log('🔥 Seed INFACTIBLE completado!');
    console.log('');
    console.log('📊 Análisis del desastre:');
    console.log('   - Demanda: 10 turnos (5 días * 2 médicos)');
    console.log('   - Oferta: 5 turnos disponibles totales');
    console.log('   - Resultado esperado: Infactible (Min-Cut detectará falta de cobertura)');
}

if (require.main === module) {
    main()
        .catch((e) => {
            console.error('❌ Error en seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = { main };
