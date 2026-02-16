const { Router } = require('express');
const reportesController = require('../controllers/reportes.controller');
const { authenticateJWT } = require('../middlewares/authenticateJWT');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

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
 *               type: object
 *               properties:
 *                 fechaGeneracion:
 *                   type: string
 *                   format: date-time
 *                 estadisticasGlobales:
 *                   type: object
 *                   properties:
 *                     totalGuardias:
 *                       type: integer
 *                     medicosActivos:
 *                       type: integer
 *                     promedioPorMedico:
 *                       type: number
 *                     desviacionEstandar:
 *                       type: number
 *                 detallePorMedico:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       totalGuardias:
 *                         type: integer
 *                       periodosCubiertos:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get(
    '/equidad',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
    reportesController.obtenerReporteEquidad
);

module.exports = router;
