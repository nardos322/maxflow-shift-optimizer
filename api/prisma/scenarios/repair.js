const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed: REPAIR SCENARIO...');

    // 1. Limpiar DB
    await prisma.asignacion.deleteMany();
    await prisma.disponibilidad.deleteMany();
    await prisma.feriado.deleteMany();
    await prisma.periodo.deleteMany();
    await prisma.medico.deleteMany();
    await prisma.configuracion.deleteMany();

    // 2. Configuración Global (Critica)
    await prisma.configuracion.create({
        data: {
            maxGuardiasTotales: 2, // Límite bajo para forzar el uso de todos
            medicosPorDia: 1
        }
    });

    // 3. Crear Médicos
    // Necesitamos suficientes médicos para cubrir todo, pero justos para que al sacar uno se note.
    // 3 Periodos x 1 día = 3 días totales. C=2. Se necesitan 2 médicos mínimo (2+1).
    // Crearemos 3 médicos: A (2), B (2), C (2). Total Capacidad = 6. Demanda = 3.
    const medicos = await Promise.all([
        prisma.medico.create({ data: { nombre: 'Dr. A (Saliente)', email: 'a@h.com' } }),
        prisma.medico.create({ data: { nombre: 'Dr. B (Queda)', email: 'b@h.com' } }),
        prisma.medico.create({ data: { nombre: 'Dr. C (Queda)', email: 'c@h.com' } }),
    ]);

    const drA = medicos[0];
    console.log(`✅ Creados 3 médicos (Dr. A con ID: ${drA.id})`);

    // 4. Crear Períodos (3 días distintos)
    // Usamos fechas futuras
    const fechaBase = new Date();
    fechaBase.setDate(fechaBase.getDate() + 10); // +10 días

    const dias = [];
    for (let i = 0; i < 3; i++) {
        const fecha = new Date(fechaBase);
        fecha.setDate(fecha.getDate() + i);
        dias.push(fecha);
    }

    const periodo = await prisma.periodo.create({
        data: {
            nombre: 'Periodo Prueba Repair',
            fechaInicio: dias[0],
            fechaFin: dias[2],
            feriados: {
                create: dias.map((d, idx) => ({
                    fecha: d,
                    descripcion: `Feriado ${idx + 1}`
                }))
            }
        },
        include: { feriados: true }
    });
    console.log('✅ Creado 1 período con 3 feriados');

    // 5. Disponibilidad Total (Todos pueden ir todos los días)
    for (const medico of medicos) {
        for (const f of periodo.feriados) {
            await prisma.disponibilidad.create({
                data: {
                    medicoId: medico.id,
                    fecha: f.fecha
                }
            });
        }
    }
    console.log('✅ Disponibilidad total creada');

    // 6. Pre-Asignar manualmente para forzar un escenario conocido
    // Dia 1: Dr. A
    // Dia 2: Dr. B
    // Dia 3: Dr. C
    // Razón: Queremos borrar a Dr. A y ver que Dr. B o Dr. C tomen el Dia 1,
    // SIN perder sus asignaciones de Dia 2 y Dia 3.

    await prisma.asignacion.createMany({
        data: [
            { fecha: dias[0], medicoId: medicos[0].id, periodoId: periodo.id }, // Dr A -> Dia 1
            { fecha: dias[1], medicoId: medicos[1].id, periodoId: periodo.id }, // Dr B -> Dia 2
            { fecha: dias[2], medicoId: medicos[2].id, periodoId: periodo.id }, // Dr C -> Dia 3
        ]
    });

    console.log('✅ Asignaciones iniciales creadas manualmente:');
    console.log('   - Dia 1: Dr. A');
    console.log('   - Dia 2: Dr. B');
    console.log('   - Dia 3: Dr. C');
    console.log('==================================================');
    console.log('🧪 ESCENARIO LISTO PARA REPARAR');
    console.log(`👉 Para probar, ejecuta: POST /asignaciones/reparar con body { "medicoId": ${drA.id} }`);
    console.log('   El Dr. A debería desaparecer del Dia 1.');
    console.log('   El Dr. B o C deberían tomar el Dia 1 (porque tienen C=2 y solo usan 1).');
    console.log('   El Dr. B y C deben MANTENER sus días 2 y 3.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
