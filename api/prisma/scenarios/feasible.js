const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed: FEASIBLE (Happy Path)...');

    // Limpiar datos existentes
    await prisma.asignacion.deleteMany();
    await prisma.disponibilidad.deleteMany();
    await prisma.feriado.deleteMany();
    await prisma.periodo.deleteMany();
    await prisma.medico.deleteMany();
    await prisma.configuracion.deleteMany();

    // Crear configuración global
    await prisma.configuracion.create({
        data: {
            maxGuardiasTotales: 3,  // C = 3 días máximo por médico en total
            medicosPorDia: 1,
        },
    });
    console.log('✅ Configuración creada (C=3, 1 médico/día)');

    // Crear médicos
    const medicos = await Promise.all([
        prisma.medico.create({ data: { nombre: 'Ana García', email: 'ana.garcia@hospital.com' } }),
        prisma.medico.create({ data: { nombre: 'Luis Rodríguez', email: 'luis.rodriguez@hospital.com' } }),
        prisma.medico.create({ data: { nombre: 'Carlos Martínez', email: 'carlos.martinez@hospital.com' } }),
        prisma.medico.create({ data: { nombre: 'María López', email: 'maria.lopez@hospital.com' } }),
        prisma.medico.create({ data: { nombre: 'Pedro Sánchez', email: 'pedro.sanchez@hospital.com' } }),
    ]);
    console.log(`✅ ${medicos.length} médicos creados`);

    // Crear períodos con sus feriados
    // Período 1: Semana Santa 2026
    const semanaSanta = await prisma.periodo.create({
        data: {
            nombre: 'Semana Santa 2026',
            fechaInicio: new Date('2026-04-02'),
            fechaFin: new Date('2026-04-05'),
            feriados: {
                create: [
                    { fecha: new Date('2026-04-02'), descripcion: 'Jueves Santo' },
                    { fecha: new Date('2026-04-03'), descripcion: 'Viernes Santo' },
                    { fecha: new Date('2026-04-04'), descripcion: 'Sábado Santo' },
                    { fecha: new Date('2026-04-05'), descripcion: 'Domingo de Pascua' },
                ],
            },
        },
    });

    // Período 2: Carnaval 2026
    const carnaval = await prisma.periodo.create({
        data: {
            nombre: 'Carnaval 2026',
            fechaInicio: new Date('2026-02-16'),
            fechaFin: new Date('2026-02-17'),
            feriados: {
                create: [
                    { fecha: new Date('2026-02-16'), descripcion: 'Lunes de Carnaval' },
                    { fecha: new Date('2026-02-17'), descripcion: 'Martes de Carnaval' },
                ],
            },
        },
    });

    // Período 3: Navidad y Año Nuevo
    const navidad = await prisma.periodo.create({
        data: {
            nombre: 'Navidad y Año Nuevo 2026',
            fechaInicio: new Date('2026-12-24'),
            fechaFin: new Date('2027-01-01'),
            feriados: {
                create: [
                    { fecha: new Date('2026-12-24'), descripcion: 'Nochebuena' },
                    { fecha: new Date('2026-12-25'), descripcion: 'Navidad' },
                    { fecha: new Date('2026-12-31'), descripcion: 'Fin de Año' },
                    { fecha: new Date('2027-01-01'), descripcion: 'Año Nuevo' },
                ],
            },
        },
    });

    console.log('✅ 3 períodos con feriados creados');

    // Crear disponibilidad de médicos (Si = días disponibles para cada médico)
    const disponibilidadData = [
        // === SEMANA SANTA ===
        // Ana: disponible Jueves, Viernes, Domingo
        { medicoId: medicos[0].id, fecha: new Date('2026-04-02') },
        { medicoId: medicos[0].id, fecha: new Date('2026-04-03') },
        { medicoId: medicos[0].id, fecha: new Date('2026-04-05') },

        // Luis: disponible Viernes, Sábado
        { medicoId: medicos[1].id, fecha: new Date('2026-04-03') },
        { medicoId: medicos[1].id, fecha: new Date('2026-04-04') },

        // Carlos: disponible Jueves, Sábado, Domingo
        { medicoId: medicos[2].id, fecha: new Date('2026-04-02') },
        { medicoId: medicos[2].id, fecha: new Date('2026-04-04') },
        { medicoId: medicos[2].id, fecha: new Date('2026-04-05') },

        // María: disponible todos los días
        { medicoId: medicos[3].id, fecha: new Date('2026-04-02') },
        { medicoId: medicos[3].id, fecha: new Date('2026-04-03') },
        { medicoId: medicos[3].id, fecha: new Date('2026-04-04') },
        { medicoId: medicos[3].id, fecha: new Date('2026-04-05') },

        // Pedro: disponible Jueves, Viernes
        { medicoId: medicos[4].id, fecha: new Date('2026-04-02') },
        { medicoId: medicos[4].id, fecha: new Date('2026-04-03') },

        // === CARNAVAL ===
        { medicoId: medicos[0].id, fecha: new Date('2026-02-16') },
        { medicoId: medicos[1].id, fecha: new Date('2026-02-16') },
        { medicoId: medicos[1].id, fecha: new Date('2026-02-17') },
        { medicoId: medicos[2].id, fecha: new Date('2026-02-17') },
        { medicoId: medicos[3].id, fecha: new Date('2026-02-16') },
        { medicoId: medicos[3].id, fecha: new Date('2026-02-17') },

        // === NAVIDAD ===
        { medicoId: medicos[0].id, fecha: new Date('2026-12-24') },
        { medicoId: medicos[0].id, fecha: new Date('2026-12-25') },
        { medicoId: medicos[1].id, fecha: new Date('2026-12-25') },
        { medicoId: medicos[1].id, fecha: new Date('2026-12-31') },
        { medicoId: medicos[2].id, fecha: new Date('2026-12-24') },
        { medicoId: medicos[2].id, fecha: new Date('2027-01-01') },
        { medicoId: medicos[3].id, fecha: new Date('2026-12-31') },
        { medicoId: medicos[3].id, fecha: new Date('2027-01-01') },
        { medicoId: medicos[4].id, fecha: new Date('2026-12-24') },
        { medicoId: medicos[4].id, fecha: new Date('2026-12-25') },
    ];

    await prisma.disponibilidad.createMany({ data: disponibilidadData });
    console.log(`✅ ${disponibilidadData.length} registros de disponibilidad creados`);

    console.log('');
    console.log('🎉 Seed FEASIBLE completado!');
    console.log('');
    console.log('📊 Modelo del problema:');
    console.log('   - K períodos: Semana Santa, Carnaval, Navidad (agrupan días feriados)');
    console.log('   - N médicos: 5 médicos con disponibilidad Si');
    console.log('   - C = 3: máximo días totales asignados por médico');
    console.log('   - Restricción: máximo 1 día asignado por médico POR PERÍODO');
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
