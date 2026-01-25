const prisma = require('../../src/lib/prisma');
const { seedAdmin } = require('../seedAdmin');
const Factories = require('../../src/lib/factories');

async function main() {
    console.log('🌱 Iniciando seed: REPAIR SCENARIO...');
    await seedAdmin();

    // 1. Limpiar DB
    await Factories.debugCleanDB();

    // 2. Configuración Global (Critica)
    await Factories.createConfiguracion({
        maxGuardiasTotales: 2, // Límite bajo para forzar el uso de todos
        medicosPorDia: 1
    });

    // 3. Crear Médicos
    const medicos = await Promise.all([
        Factories.createMedico({ nombre: 'Dr. A (Saliente)', email: 'a@h.com' }),
        Factories.createMedico({ nombre: 'Dr. B (Queda)', email: 'b@h.com' }),
        Factories.createMedico({ nombre: 'Dr. C (Queda)', email: 'c@h.com' }),
    ]);

    const drA = medicos[0];
    console.log(`✅ Creados 3 médicos (Dr. A con ID: ${drA.id})`);

    // 4. Crear Períodos (3 días distintos)
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
            await Factories.createDisponibilidad(medico.id, f.fecha);
        }
    }
    console.log('✅ Disponibilidad total creada');

    // 6. Pre-Asignar manualmente para forzar un escenario conocido
    await Promise.all([
        Factories.createAsignacion(medicos[0].id, periodo.id, dias[0]), // Dr A -> Dia 1
        Factories.createAsignacion(medicos[1].id, periodo.id, dias[1]), // Dr B -> Dia 2
        Factories.createAsignacion(medicos[2].id, periodo.id, dias[2]), // Dr C -> Dia 3
    ]);

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

if (require.main === module) {
    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = { main };
