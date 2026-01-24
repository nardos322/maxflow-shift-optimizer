const { Router } = require('express');
const medicosRoutes = require('./medicos.routes');
const periodosRoutes = require('./periodos.routes');
const asignacionesRoutes = require('./asignaciones.routes');

const router = Router();

router.use('/medicos', medicosRoutes);
router.use('/periodos', periodosRoutes);
router.use('/asignaciones', asignacionesRoutes);
router.use('/configuracion', require('./configuracion.routes'));

module.exports = router;
