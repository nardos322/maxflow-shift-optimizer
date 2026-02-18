const reportesService = require('../services/reportes.service');

/**
 * GET /reportes/equidad
 * Obtiene métricas de equidad en la distribución de guardias.
 */
async function obtenerReporteEquidad(req, res, next) {
  try {
    const reporte = await reportesService.generarReporteEquidad();
    res.json(reporte);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerReporteEquidad,
};
