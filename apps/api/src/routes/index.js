import { Router } from 'express';
import medicosRoutes from './medicos.routes.js';
import periodosRoutes from './periodos.routes.js';
import asignacionesRoutes from './asignaciones.routes.js';
import authRoutes from './auth.routes.js';
import exportRoutes from './export.routes.js';
import configuracionRoutes from './configuracion.routes.js';
import reportesRoutes from './reportes.routes.js';
import auditRoutes from './audit.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/medicos', medicosRoutes);
router.use('/periodos', periodosRoutes);
router.use('/asignaciones', asignacionesRoutes);
router.use('/export', exportRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/reportes', reportesRoutes);
router.use('/auditoria', auditRoutes);

export default router;
