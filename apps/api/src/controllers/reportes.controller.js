import reportesService from '../services/reportes.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /reportes/equidad
 * Obtiene métricas de equidad en la distribución de guardias.
 */
const obtenerReporteEquidad = asyncHandler(async (req, res) => {
  const reporte = await reportesService.generarReporteEquidad();
  res.json(reporte);
});

/**
 * GET /reportes/faltantes
 * Obtiene guardias/días con cobertura incompleta.
 */
const obtenerGuardiasFaltantes = asyncHandler(async (req, res) => {
  const faltantes = await reportesService.obtenerGuardiasFaltantes();
  res.json(faltantes);
});

export default {
  obtenerReporteEquidad,
  obtenerGuardiasFaltantes,
};
