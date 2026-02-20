import { Router } from 'express';
import reportesController from '../controllers/reportes.controller.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Métricas y estadísticas del sistema
 */

/**
 * @swagger
 * /reportes/equidad:
 *   get:
 *     summary: Obtener reporte de equidad y distribución de guardias
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteEquidad'
 */
router.get(
  '/equidad',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  reportesController.obtenerReporteEquidad
);

export default router;
