import { Router } from 'express';
import configuracionController from '../controllers/configuracion.controller.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import validate from '../middlewares/validate.js';
import {
  updateConfiguracionSchema,
} from '@maxflow/shared';

/**
 * @swagger
 * tags:
 *   name: Configuracion
 *   description: Configuración global del sistema
 */

const router = Router();

// Solo admin puede actualizar configuración
/**
 * @swagger
 * /configuracion:
 *   put:
 *     summary: Actualizar parámetros globales
 *     tags: [Configuracion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxGuardiasTotales:
 *                 type: integer
 *                 description: Límite global C de guardias por médico
 *               maxGuardiasPorPeriodo:
 *                 type: integer
 *                 description: Límite de guardias por médico dentro de cada período
 *               medicosPorDia:
 *                 type: integer
 *                 description: Demanda diaria requerida
 *               freezeDays:
 *                 type: integer
 *                 description: Días desde hoy que quedan congelados para cambios automáticos
 *     responses:
 *       200:
 *         description: Configuración actualizada
 */
router.put(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validate(updateConfiguracionSchema),
  configuracionController.actualizarConfiguracion
);

// Todos los autenticados pueden consultar configuración
/**
 * @swagger
 * /configuracion:
 *   get:
 *     summary: Obtener configuración actual
 *     tags: [Configuracion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Objeto de configuración
 */
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  configuracionController.obtenerConfiguracion
);

export default router;
