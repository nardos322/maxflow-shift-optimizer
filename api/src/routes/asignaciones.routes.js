const { Router } = require('express');
const asignacionesController = require('../controllers/asignaciones.controller');
const { authenticateJWT } = require('../middlewares/authenticateJWT');
const { authorizeRoles } = require('../middlewares/authorizeRoles');
const { solverLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const {
  repararAsignacionSchema,
  simulacionSchema,
} = require('@maxflow/shared');

/**
 * @swagger
 * tags:
 *   name: Asignaciones
 *   description: Motor de asignación de guardias (Solver)
 */

const router = Router();

// Solo admin puede resolver, reparar y limpiar
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
 *       200:
 *         description: Asignaciones eliminadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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

module.exports = router;
