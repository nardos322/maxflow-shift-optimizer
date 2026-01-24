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
        await guardarAsignaciones(resultado.asignaciones, periodos);
    }

    return resultado;
}

/**
 * Repara asignaciones cuando un médico sale del sistema (baja o inactivo).
 * Mantiene las asignaciones existentes de otros médicos y llena los huecos.
 * @param {number} medicoSalienteId - ID del médico que deja de estar disponible
 * @param {boolean} darDeBaja - Si es true, marca al médico como inactivo (activo: false)
 */
async function repararAsignaciones(medicoSalienteId, darDeBaja = false) {
    // 1. Obtener configuración
    const config = await prisma.configuracion.findFirst();
    if (!config) throw new Error('No hay configuración definida');

    // 2. Obtener todas las asignaciones futuras
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const asignacionesExistentes = await prisma.asignacion.findMany({
        where: { fecha: { gte: hoy } },
        include: { medico: true }
    });

    // 3. Identificar huecos (asignaciones del médico saliente)
    const asignacionesBorrables = asignacionesExistentes.filter(a => a.medicoId === parseInt(medicoSalienteId));

    // Si no hay asignaciones futuras, igual procesamos la baja si se solicitó
    if (asignacionesBorrables.length === 0) {
        if (darDeBaja) {
            await prisma.medico.update({
                where: { id: parseInt(medicoSalienteId) },
                data: { activo: false }
            });
            return { message: "El médico no tenía asignaciones futuras. Se ha dado de baja correctamente." };
        }
        return { message: "El médico no tenía asignaciones futuras. No se requiere reparación." };
    }

    // 4. Borrar asignaciones del médico saliente
    await prisma.asignacion.deleteMany({
        where: {
            id: { in: asignacionesBorrables.map(a => a.id) }
        }
    });

    // 5. Calcular capacidad restante de médicos activos
    const medicosActivos = await prisma.medico.findMany({
        where: {
            activo: true,
            id: { not: parseInt(medicoSalienteId) }
        }
    });

    const capacidadesPersonales = {};
    const asignacionesConservadas = asignacionesExistentes.filter(a => a.medicoId !== parseInt(medicoSalienteId));

    for (const medico of medicosActivos) {
        const usadas = asignacionesConservadas.filter(a => a.medicoId === medico.id).length;
        const restante = Math.max(0, config.maxGuardiasTotales - usadas);
        capacidadesPersonales[medico.nombre] = restante; // Pasamos al core cuánto le queda
    }

    // 6. Preparar datos para solver (SOLO para los huecos)
    // Buscamos los períodos afectados por los huecos
    const fechasHuecos = asignacionesBorrables.map(a => a.fecha.toISOString().split('T')[0]);
    const periodosAfectadosIds = [...new Set(asignacionesBorrables.map(a => a.periodoId))];

    const periodos = await prisma.periodo.findMany({
        where: { id: { in: periodosAfectadosIds } },
        include: { feriados: true }
    });

    // Filtramos los periodos para que SOLO contengan los días huecos
    // (Hack: El solver necesita estructura de periodos, pero solo queremos resolver para los días faltantes)
    const periodosParaSolver = periodos.map(p => ({
        ...p,
        feriados: p.feriados.filter(f => fechasHuecos.includes(f.fecha.toISOString().split('T')[0]))
    })).filter(p => p.feriados.length > 0); // Solo periodos que tengan huecos

    // Obtener disponibilidades para los días huecos
    const disponibilidades = await prisma.disponibilidad.findMany({
        where: {
            fecha: { in: periodosParaSolver.flatMap(p => p.feriados.map(f => f.fecha)) },
            medico: { activo: true, id: { not: parseInt(medicoSalienteId) } }
        },
        include: { medico: true }
    });

    // Construir input
    const inputData = construirInputParaCore(
        medicosActivos,
        periodosParaSolver,
        disponibilidades,
        config,
        capacidadesPersonales // Nuevo parámetro
    );

    // 7. Ejecutar solver
    const resultado = await coreService.ejecutarCore(inputData);

    // 8. Guardar nuevas asignaciones (append)
    if (resultado.factible) {
        await guardarAsignacionesAppend(resultado.asignaciones, periodos); // Usamos append, no overwrite
    }

    // 9. Procesar baja si corresponde
    // IMPORTANTE: Si se pidió dar de baja, lo hacemos independientemente de si se pudo reparar o no.
    // Si el usuario renuncia, renuncia. Que queden huecos es un problema secundario.
    if (darDeBaja) {
        await prisma.medico.update({
            where: { id: parseInt(medicoSalienteId) },
            data: { activo: false }
        });
        resultado.medicoDadoDeBaja = true;
    }

    return resultado;
}


/**
 * Construye el objeto JSON que espera el core C++
 */
function construirInputParaCore(medicos, periodos, disponibilidades, config, personalCapacities = null) {
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

    const inputData = {
        medicos: nombresMedicos,
        dias: dias,
        periodos: periodosFormat,
        disponibilidad: disponibilidad,
        maxGuardiasPorPeriodo: 1,
        maxGuardiasTotales: config.maxGuardiasTotales,
        medicosPorDia: config.medicosPorDia,
    };

    if (personalCapacities) {
        inputData.capacidades = personalCapacities;
    }

    return inputData;
}

/**
 * Guarda los turnos generados en la base de datos (Sobrescribe por período)
 */
async function guardarAsignaciones(asignaciones, periodos) {
    // Crear mapa de nombre médico -> id
    const medicos = await prisma.medico.findMany({ where: { activo: true } });
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

    if (asignacionesData.length > 0) {
        await prisma.asignacion.createMany({ data: asignacionesData });
    }
}

/**
 * Guarda turnos agregándolos (APPEND) sin borrar lo existente del período
 * Usado por la reparación.
 */
async function guardarAsignacionesAppend(asignaciones, periodos) {
    const medicos = await prisma.medico.findMany({ where: { activo: true } });
    const medicoMap = new Map(medicos.map(m => [m.nombre, m.id]));

    const fechaPeriodoMap = new Map();
    for (const periodo of periodos) {
        for (const feriado of periodo.feriados) {
            const fechaStr = feriado.fecha.toISOString().split('T')[0];
            fechaPeriodoMap.set(fechaStr, periodo.id);
        }
    }

    const asignacionesData = asignaciones.map(asig => ({
        fecha: new Date(asig.dia),
        medicoId: medicoMap.get(asig.medico),
        periodoId: fechaPeriodoMap.get(asig.dia),
    }));

    if (asignacionesData.length > 0) {
        await prisma.asignacion.createMany({ data: asignacionesData });
    }
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
    repararAsignaciones,
    obtenerPorPeriodo,
    obtenerTodas,
};
