const { Router } = require('express');
const medicosController = require('../controllers/medicos.controller');

const router = Router();

router.get('/', medicosController.obtenerTodos);
router.post('/', medicosController.crear);
router.get('/:id/disponibilidad', medicosController.obtenerDisponibilidad);
router.post('/:id/disponibilidad', medicosController.agregarDisponibilidad);
router.delete('/:id/disponibilidad', medicosController.eliminarDisponibilidad);
router.get('/:id', medicosController.obtenerPorId);
router.put('/:id', medicosController.actualizar);
router.delete('/:id', medicosController.eliminar);


module.exports = router;
