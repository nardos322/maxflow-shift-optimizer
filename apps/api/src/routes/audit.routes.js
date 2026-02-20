import { Router } from 'express';
import auditController from '../controllers/audit.controller.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auditoria
 *   description: Registro de actividades del sistema
 */

/**
 * @swagger
 * /auditoria:
 *   get:
 *     summary: Obtener logs de auditoría
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs de auditoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   accion:
 *                     type: string
 *                   usuario:
 *                     type: string
 *                   detalles:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  auditController.obtenerLogs
);

export default router;
