const { Router } = require("express");
const medicosRoutes = require("./medicos.routes");
const periodosRoutes = require("./periodos.routes");
const asignacionesRoutes = require("./asignaciones.routes");
const authRoutes = require("./auth.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/medicos", medicosRoutes);
router.use("/periodos", periodosRoutes);
router.use("/asignaciones", asignacionesRoutes);
router.use("/configuracion", require("./configuracion.routes"));

module.exports = router;
