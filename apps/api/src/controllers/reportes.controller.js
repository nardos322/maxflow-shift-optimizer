import reportesService from '../services/reportes.service.js';

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

/**
 * GET /reportes/faltantes
 * Obtiene guardias/días con cobertura incompleta.
 */
async function obtenerGuardiasFaltantes(req, res, next) {
  try {
    const faltantes = await reportesService.obtenerGuardiasFaltantes();
    res.json(faltantes);
  } catch (error) {
    next(error);
  }
}

export default {
  obtenerReporteEquidad,
  obtenerGuardiasFaltantes,
};
