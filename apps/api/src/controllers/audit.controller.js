import auditService from '../services/audit.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /auditoria
 * Obtiene logs de auditoría
 */
const obtenerLogs = asyncHandler(async (req, res) => {
  const logs = await auditService.obtenerLogs();
  res.json(logs);
});

export default {
  obtenerLogs,
};
