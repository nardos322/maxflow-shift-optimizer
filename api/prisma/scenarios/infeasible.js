const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔥 Iniciando seed: INFEASIBLE (Infactible)...');

    // Limpiar datos existentes
    await prisma.asignacion.deleteMany();
    await prisma.disponibilidad.deleteMany();
    await prisma.feriado.deleteMany();
    await prisma.periodo.deleteMany();
    await prisma.medico.deleteMany();
    await prisma.configuracion.deleteMany();

    // Crear configuración global AMBICIOSA
    await prisma.configuracion.create({
        data: {
            maxGuardiasTotales: 5,
            medicosPorDia: 2, // Requerimos 2 médicos por día
        },
    });
    console.log('✅ Configuración creada (C=5, pero 2 médicos requeridos por día)');

    // Crear médicos (Solo 2 médicos para cubrir mucha demanda)
    const medicos = await Promise.all([
        prisma.medico.create({ data: { nombre: 'Dr. Solitario', email: 'solitario@hospital.com' } }),
        prisma.medico.create({ data: { nombre: 'Dra. Sobrecargada', email: 'sobrecargada@hospital.com' } }),
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
    // Dr. Solitario: Solo puede Lunes y Martes
    // Dra. Sobrecargada: Puede Lunes, Miercoles y Viernes
    // TOTAL OFERTA: 2 + 3 = 5 turnos.
    // DEMANDA: 5 días * 2 médicos = 10 turnos.
    // DÉFICIT: 5 turnos. INFACTIBLE.

    const disponibilidadData = [
        { medicoId: medicos[0].id, fecha: new Date('2026-06-01') },
        { medicoId: medicos[0].id, fecha: new Date('2026-06-02') },

        { medicoId: medicos[1].id, fecha: new Date('2026-06-01') },
        { medicoId: medicos[1].id, fecha: new Date('2026-06-03') },
        { medicoId: medicos[1].id, fecha: new Date('2026-06-05') },
    ];

    await prisma.disponibilidad.createMany({ data: disponibilidadData });
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
