const auditService = require('../services/audit.service');

/**
 * GET /auditoria
 * Obtiene logs de auditoría
 */
async function obtenerLogs(req, res, next) {
  try {
    const logs = await auditService.obtenerLogs();
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerLogs,
};
