const prisma = require('../lib/prisma');

/**
 * Obtiene la configuración global del sistema.
 * Si no existe, crea una por defecto.
 */
async function getConfiguracion() {
    let config = await prisma.configuracion.findFirst();

    if (!config) {
        config = await prisma.configuracion.create({
            data: {
                maxGuardiasTotales: 3,
                medicosPorDia: 1,
            },
        });
    }

    return config;
}

/**
 * Actualiza la configuración global.
 * @param {Object} data - Datos a actualizar (maxGuardiasTotales, medicosPorDia)
 */
async function actualizarConfiguracion(data) {
    const config = await getConfiguracion();

    return prisma.configuracion.update({
        where: { id: config.id },
        data: {
            maxGuardiasTotales: data.maxGuardiasTotales,
            medicosPorDia: data.medicosPorDia,
        },
    });
}

module.exports = {
    getConfiguracion,
    actualizarConfiguracion,
};
