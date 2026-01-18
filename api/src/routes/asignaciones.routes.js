const { Router } = require('express');
const asignacionesController = require('../controllers/asignaciones.controller');

const router = Router();

router.post('/calcular', asignacionesController.calcular);
router.get('/', asignacionesController.obtenerResultados);
router.delete('/', asignacionesController.limpiar);

module.exports = router;
