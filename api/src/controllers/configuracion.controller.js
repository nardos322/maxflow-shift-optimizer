const configuracionService = require('../services/configuracion.service');


async function obtenerConfiguracion(req, res, next) {
    try {
        const configuracion = await configuracionService.getConfiguracion();
        res.json(configuracion);
    } catch (error) {
        next(error);
    }
}

async function actualizarConfiguracion(req, res, next) {
    try {
        const configuracion = await configuracionService.actualizarConfiguracion(req.body);
        res.json(configuracion);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    obtenerConfiguracion,
    actualizarConfiguracion,
};