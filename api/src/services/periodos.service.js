const prisma = require('../lib/prisma');

/**
 * Obtiene todos los períodos
 */
async function obtenerTodos() {
    return prisma.periodo.findMany({
        include: {
            feriados: true,
            _count: { select: { asignaciones: true } },
        },
        orderBy: { fechaInicio: 'asc' },
    });
}

/**
 * Obtiene un período por ID con sus feriados y turnos
 */
async function obtenerPorId(id) {
    return prisma.periodo.findUnique({
        where: { id: parseInt(id) },
        include: {
            feriados: true,
            asignaciones: {
                include: { medico: true },
                orderBy: { fecha: 'asc' },
            },
        },
    });
}

/**
 * Crea un nuevo período con sus feriados
 */
async function crear(data) {
    return prisma.periodo.create({
        data: {
            nombre: data.nombre,
            fechaInicio: new Date(data.fechaInicio),
            fechaFin: new Date(data.fechaFin),
            feriados: {
                create: data.feriados.map(f => ({
                    fecha: new Date(f.fecha),
                    descripcion: f.descripcion,
                })),
            },
        },
        include: { feriados: true },
    });
}

/**
 * Actualiza un período
 */
async function actualizar(id, data) {
    return prisma.periodo.update({
        where: { id: parseInt(id) },
        data: {
            nombre: data.nombre,
            fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
            fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
        },
    });
}

/**
 * Elimina un período y sus feriados
 */
async function eliminar(id) {
    // Primero eliminar asignaciones asociadas
    await prisma.asignacion.deleteMany({
        where: { periodoId: parseInt(id) },
    });

    // Luego eliminar feriados
    await prisma.feriado.deleteMany({
        where: { periodoId: parseInt(id) },
    });

    // Finalmente eliminar el período
    return prisma.periodo.delete({
        where: { id: parseInt(id) },
    });
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
};
