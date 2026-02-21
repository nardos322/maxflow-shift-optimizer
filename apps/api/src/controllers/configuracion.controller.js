import auditService from '../services/audit.service.js';
import configuracionService from '../services/configuracion.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const obtenerConfiguracion = asyncHandler(async (req, res) => {
  const configuracion = await configuracionService.getConfiguracion();
  res.json(configuracion);
});

const actualizarConfiguracion = asyncHandler(async (req, res) => {
  const configuracion = await configuracionService.actualizarConfiguracion(
    req.body
  );

  // Audit Log
  const usuarioEmail = req.user ? req.user.email : 'system';
  await auditService.log('CONFIG_UPDATE', usuarioEmail, req.body);

  res.json(configuracion);
});

export default {
  obtenerConfiguracion,
  actualizarConfiguracion,
};
