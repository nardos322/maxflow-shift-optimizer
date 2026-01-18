const { Router } = require('express');
const periodosController = require('../controllers/periodos.controller');

const router = Router();

router.get('/', periodosController.obtenerTodos);
router.post('/', periodosController.crear);

module.exports = router;
