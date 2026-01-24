const { Router } = require('express');
const periodosController = require('../controllers/periodos.controller');

const router = Router();

router.get('/', periodosController.obtenerTodos);
router.post('/', periodosController.crear);
router.get('/:id', periodosController.obtenerPorId);
router.put('/:id', periodosController.actualizar);
router.delete('/:id', periodosController.eliminar);

module.exports = router;
