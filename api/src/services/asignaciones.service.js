const prisma = require('../lib/prisma');
const coreService = require('./core.service');

/**
 * Genera asignaciones para los períodos especificados usando datos de la DB
 * @param {number[]} periodoIds - IDs de los períodos a resolver (opcional, si no se pasa resuelve todos)
 * @returns {Promise<Object>} - Resultado del solver
 */
async function generarAsignaciones(periodoIds = null) {
    // 1. Obtener configuración global
    const config = await prisma.configuracion.findFirst();
    if (!config) {
        throw new Error('No hay configuración definida en el sistema');
    }

    // 2. Obtener períodos con sus feriados
    const whereClause = periodoIds ? { id: { in: periodoIds } } : {};
    const periodos = await prisma.periodo.findMany({
        where: whereClause,
        include: {
            feriados: true,
        },
    });

    if (periodos.length === 0) {
        throw new Error('No hay períodos para resolver');
    }

    // 3. Obtener todos los días de todos los períodos
    const todosDias = periodos.flatMap(p =>
        p.feriados.map(f => f.fecha.toISOString().split('T')[0])
    );

    // 4. Obtener médicos activos
    const medicos = await prisma.medico.findMany({
        where: { activo: true },
    });

    if (medicos.length === 0) {
        throw new Error('No hay médicos activos en el sistema');
    }

    // 5. Obtener disponibilidad para los días relevantes
    const disponibilidades = await prisma.disponibilidad.findMany({
        where: {
            fecha: {
                in: periodos.flatMap(p => p.feriados.map(f => f.fecha)),
            },
            medico: {
                activo: true,
            },
        },
        include: {
            medico: true,
        },
    });

    // 6. Construir el JSON para el solver
    const inputData = construirInputParaCore(medicos, periodos, disponibilidades, config);

    // 7. Ejecutar el solver
    const resultado = await coreService.ejecutarCore(inputData);

    // 8. Si es factible, guardar los turnos en la DB
    if (resultado.factible) {
        await guardarTurnos(resultado.asignaciones, periodos);
    }

    return resultado;
}

/**
 * Construye el objeto JSON que espera el core C++
 */
function construirInputParaCore(medicos, periodos, disponibilidades, config) {
    // Nombres de médicos
    const nombresMedicos = medicos.map(m => m.nombre);

    // Todos los días (fechas)
    const dias = periodos.flatMap(p =>
        p.feriados.map(f => f.fecha.toISOString().split('T')[0])
    );

    // Períodos en formato del solver
    const periodosFormat = periodos.map(p => ({
        id: p.nombre,
        dias: p.feriados.map(f => f.fecha.toISOString().split('T')[0]),
    }));

    // Disponibilidad por médico
    const disponibilidad = {};
    for (const medico of medicos) {
        const diasDisponibles = disponibilidades
            .filter(d => d.medicoId === medico.id)
            .map(d => d.fecha.toISOString().split('T')[0]);

        if (diasDisponibles.length > 0) {
            disponibilidad[medico.nombre] = diasDisponibles;
        }
    }

    return {
        medicos: nombresMedicos,
        dias: dias,
        periodos: periodosFormat,
        disponibilidad: disponibilidad,
        maxGuardiasPorPeriodo: 1, // Según el enunciado: máximo 1 día por período
        maxGuardiasTotales: config.maxGuardiasTotales,
        medicosPorDia: config.medicosPorDia,
    };
}

/**
 * Guarda los turnos generados en la base de datos
 */
async function guardarTurnos(asignaciones, periodos) {
    // Crear mapa de nombre médico -> id
    const medicos = await prisma.medico.findMany({
        where: { activo: true },
    });
    const medicoMap = new Map(medicos.map(m => [m.nombre, m.id]));

    // Crear mapa de fecha -> periodoId
    const fechaPeriodoMap = new Map();
    for (const periodo of periodos) {
        for (const feriado of periodo.feriados) {
            const fechaStr = feriado.fecha.toISOString().split('T')[0];
            fechaPeriodoMap.set(fechaStr, periodo.id);
        }
    }

    // Borrar asignaciones anteriores de estos períodos
    await prisma.asignacion.deleteMany({
        where: {
            periodoId: { in: periodos.map(p => p.id) },
        },
    });

    // Crear nuevas asignaciones
    const asignacionesData = asignaciones.map(asig => ({
        fecha: new Date(asig.dia),
        medicoId: medicoMap.get(asig.medico),
        periodoId: fechaPeriodoMap.get(asig.dia),
    }));

    await prisma.asignacion.createMany({
        data: asignacionesData,
    });

    return asignacionesData.length;
}

/**
 * Obtiene las asignaciones generadas para un período
 */
async function obtenerPorPeriodo(periodoId) {
    return prisma.asignacion.findMany({
        where: { periodoId },
        include: {
            medico: true,
            periodo: true,
        },
        orderBy: { fecha: 'asc' },
    });
}

/**
 * Obtiene todas las asignaciones
 */
async function obtenerTodas() {
    return prisma.asignacion.findMany({
        include: {
            medico: true,
            periodo: true,
        },
        orderBy: { fecha: 'asc' },
    });
}

module.exports = {
    generarAsignaciones,
    obtenerPorPeriodo,
    obtenerTodas,
};
