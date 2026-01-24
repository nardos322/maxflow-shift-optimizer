const { Router } = require('express');
const asignacionesController = require('../controllers/asignaciones.controller');

const router = Router();

router.post('/resolver', asignacionesController.calcular);
router.post('/reparar', asignacionesController.reparar);
router.get('/', asignacionesController.obtenerResultados);
router.delete('/', asignacionesController.limpiar);

module.exports = router;
