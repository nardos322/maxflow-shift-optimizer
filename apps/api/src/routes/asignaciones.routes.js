import { Router } from 'express';
import asignacionesController from '../controllers/asignaciones.controller.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { solverLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  planDiffSchema,
  publishPlanVersionSchema,
  publishedPlanDiffSchema,
  repararAsignacionSchema,
  simulacionSchema,
} from '@maxflow/shared';

/**
 * @swagger
 * tags:
 *   name: Asignaciones
 *   description: Motor de asignación de guardias (Solver)
 */

const router = Router();

// Solo admin puede resolver, reparar y limpiar
// REST-friendly aliases (resource-oriented):
// - POST /asignaciones/ejecuciones   (antes /resolver)
// - POST /asignaciones/reparaciones  (antes /reparar)
// - POST /asignaciones/simulaciones  (antes /simular)
/**
 * @swagger
 * /asignaciones/resolver:
 *   post:
 *     summary: Ejecutar algoritmo de asignación (Edmonds-Karp)
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asignación calculada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultadoSolver'
 *       500:
 *         description: Error en el cálculo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/ejecuciones',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  solverLimiter,
  asignacionesController.calcular
);

router.post(
  '/resolver',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  solverLimiter,
  asignacionesController.calcular
);

/**
 * @swagger
 * /asignaciones/reparar:
 *   post:
 *     summary: Reparar asignación de un médico específico (Eliminar y reasignar)
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicoId
 *             properties:
 *               medicoId:
 *                 type: integer
 *               darDeBaja:
 *                 type: boolean
 *               ventanaInicio:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha inicio opcional para limitar la reparación
 *               ventanaFin:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha fin opcional para limitar la reparación
 *     responses:
 *       200:
 *         description: Asignación reparada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultadoSolver'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/reparaciones',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validate(repararAsignacionSchema),
  asignacionesController.reparar
);

router.post(
  '/reparar',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validate(repararAsignacionSchema),
  asignacionesController.reparar
);

/**
 * @swagger
 * /asignaciones/simular:
 *   post:
 *     summary: Simular asignación con parámetros modificados (What-If)
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               excluirMedicos:
 *                 type: array
 *                 items:
 *                   type: integer
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: Resultado de la simulación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 parametros:
 *                   type: object
 *                 resultado:
 *                   $ref: '#/components/schemas/ResultadoSolver'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/simulaciones',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  solverLimiter,
  validate(simulacionSchema),
  asignacionesController.simular
);

router.post(
  '/simular',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  solverLimiter,
  validate(simulacionSchema),
  asignacionesController.simular
);

/**
 * @swagger
 * /asignaciones:
 *   delete:
 *     summary: Limpiar todas las asignaciones existentes
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Asignaciones eliminadas
 *       401:
 *         description: No autorizado
 */
router.delete(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  asignacionesController.limpiar
);

// Todos los autenticados pueden consultar resultados
/**
 * @swagger
 * /asignaciones:
 *   get:
 *     summary: Obtener todas las asignaciones vigentes
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asignacion'
 *       401:
 *         description: No autorizado
 */
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  asignacionesController.obtenerResultados
);

/**
 * @swagger
 * /asignaciones/diff:
 *   get:
 *     summary: Comparar dos versiones de plan
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromVersionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: toVersionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Diferencias calculadas entre versiones
 */

router.get(
  '/diff',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  validate(planDiffSchema),
  asignacionesController.compararVersiones
);

router.get(
  '/diff/publicado',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  validate(publishedPlanDiffSchema),
  asignacionesController.compararConPublicada
);

router.get(
  '/versiones',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  asignacionesController.listarVersiones
);

router.post(
  '/versiones/:id/publicar',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validate(publishPlanVersionSchema),
  asignacionesController.publicarVersion
);

export default router;
