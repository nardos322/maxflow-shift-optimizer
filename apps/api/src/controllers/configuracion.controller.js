import auditService from '../services/audit.service.js';
import configuracionService from '../services/configuracion.service.js';

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
    const configuracion = await configuracionService.actualizarConfiguracion(
      req.body
    );

    // Audit Log
    const usuarioEmail = req.user ? req.user.email : 'system';
    await auditService.log('CONFIG_UPDATE', usuarioEmail, req.body);

    res.json(configuracion);
  } catch (error) {
    next(error);
  }
}

export default {
  obtenerConfiguracion,
  actualizarConfiguracion,
};
