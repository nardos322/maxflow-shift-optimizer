const { Router } = require("express");
const medicosController = require("../controllers/medicos.controller");
const { authenticateJWT } = require("../middlewares/authenticateJWT");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

const validate = require("../middlewares/validate");
const {
  createMedicoSchema,
  updateMedicoSchema,
} = require("../schemas/medico.schema");
const { createDisponibilidadSchema } = require("../schemas/asignacion.schema"); // Reusing availability schema

/**
 * @swagger
 * tags:
 *   name: Medicos
 *   description: Gestión de médicos y sus disponibilidades
 */

const router = Router();

// Solo admin puede crear, actualizar y eliminar médicos
/**
 * @swagger
 * /medicos:
 *   post:
 *     summary: Crear nuevo médico
 *     tags: [Medicos]
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
 *               - email
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               activo:
 *                 type: boolean
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Médico creado
 */
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  validate(createMedicoSchema),
  medicosController.crear,
);

/**
 * @swagger
 * /medicos/{id}:
 *   put:
 *     summary: Actualizar médico
 *     tags: [Medicos]
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
 *               email:
 *                 type: string
 *               activo:
 *                 type: boolean
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Médico actualizado
 */
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  validate(updateMedicoSchema),
  medicosController.actualizar,
);

/**
 * @swagger
 * /medicos/{id}:
 *   delete:
 *     summary: Eliminar médico
 *     tags: [Medicos]
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
 *         description: Médico eliminado
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  medicosController.eliminar,
);

// Médicos autenticados pueden gestionar su disponibilidad
/**
 * @swagger
 * /medicos/{id}/disponibilidad:
 *   get:
 *     summary: Obtener disponibilidad de un médico
 *     tags: [Medicos]
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
 *         description: Lista de fechas disponibles
 */
router.get(
  "/:id/disponibilidad",
  authenticateJWT,
  authorizeRoles("MEDICO", "ADMIN"),
  medicosController.obtenerDisponibilidad,
);

/**
 * @swagger
 * /medicos/{id}/disponibilidad:
 *   post:
 *     summary: Agregar fecha de disponibilidad
 *     tags: [Medicos]
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
 *             required:
 *               - fecha
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Disponibilidad agregada
 */
router.post(
  "/:id/disponibilidad",
  authenticateJWT,
  authorizeRoles("MEDICO", "ADMIN"),
  validate(createDisponibilidadSchema),
  medicosController.agregarDisponibilidad,
);

/**
 * @swagger
 * /medicos/{id}/disponibilidad:
 *   delete:
 *     summary: Eliminar fecha de disponibilidad
 *     tags: [Medicos]
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
 *             required:
 *               - fecha
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Disponibilidad eliminada
 */
router.delete(
  "/:id/disponibilidad",
  authenticateJWT,
  authorizeRoles("MEDICO", "ADMIN"),
  medicosController.eliminarDisponibilidad,
);

// Todos los autenticados pueden consultar médicos
/**
 * @swagger
 * /medicos:
 *   get:
 *     summary: Listar todos los médicos
 *     tags: [Medicos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de médicos
 */
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("ADMIN", "MEDICO", "LECTOR"),
  medicosController.obtenerTodos,
);

/**
 * @swagger
 * /medicos/{id}:
 *   get:
 *     summary: Obtener médico por ID
 *     tags: [Medicos]
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
 *         description: Detalles del médico
 *       404:
 *         description: Médico no encontrado
 */
router.get(
  "/:id",
  authenticateJWT,
  authorizeRoles("ADMIN", "MEDICO", "LECTOR"),
  medicosController.obtenerPorId,
);

module.exports = router;
