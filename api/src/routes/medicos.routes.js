const { Router } = require('express');
const medicosController = require('../controllers/medicos.controller');

const router = Router();

router.get('/', medicosController.obtenerTodos);
router.post('/', medicosController.crear);
router.post('/:id/disponibilidad', medicosController.agregarDisponibilidad);

module.exports = router;
