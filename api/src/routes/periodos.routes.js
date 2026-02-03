const { Router } = require('express');
const periodosController = require('../controllers/periodos.controller');
const { authenticateJWT } = require('../middlewares/authenticateJWT');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

const validate = require('../middlewares/validate');
const { createPeriodoSchema } = require('../schemas/periodo.schema');

/**
 * @swagger
 * tags:
 *   name: Periodos
 *   description: Gestión de períodos vacacionales y feriados
 */

const router = Router();

// Solo admin puede crear, actualizar y eliminar periodos
/**
 * @swagger
 * /periodos:
 *   post:
 *     summary: Crear nuevo período con feriados
 *     tags: [Periodos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - fechaInicio
 *               - fechaFin
 *             properties:
 *               nombre:
 *                 type: string
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Período creado
 */
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validate(createPeriodoSchema),
  periodosController.crear
);

/**
 * @swagger
 * /periodos/{id}:
 *   put:
 *     summary: Actualizar período
 *     tags: [Periodos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Período actualizado
 */
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  periodosController.actualizar
);

/**
 * @swagger
 * /periodos/{id}:
 *   delete:
 *     summary: Eliminar período
 *     tags: [Periodos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Período eliminado
 */
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  periodosController.eliminar
);

// Todos los autenticados pueden consultar periodos
/**
 * @swagger
 * /periodos:
 *   get:
 *     summary: Listar todos los períodos
 *     tags: [Periodos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de períodos
 */
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  periodosController.obtenerTodos
);

/**
 * @swagger
 * /periodos/{id}:
 *   get:
 *     summary: Obtener período por ID
 *     tags: [Periodos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del período incluyendo feriados
 *       404:
 *         description: Período no encontrado
 */
router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  periodosController.obtenerPorId
);

module.exports = router;
