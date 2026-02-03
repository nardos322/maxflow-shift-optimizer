const { Router } = require("express");
const configuracionController = require("../controllers/configuracion.controller");
const { authenticateJWT } = require("../middlewares/authenticateJWT");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

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
 *               medicosPorDia:
 *                 type: integer
 *                 description: Demanda diaria requerida
 *     responses:
 *       200:
 *         description: Configuración actualizada
 */
router.put(
  "/",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  configuracionController.actualizarConfiguracion,
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
  "/",
  authenticateJWT,
  authorizeRoles("ADMIN", "MEDICO", "LECTOR"),
  configuracionController.obtenerConfiguracion,
);

module.exports = router;
