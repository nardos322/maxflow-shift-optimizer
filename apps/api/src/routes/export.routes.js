import { Router } from 'express';
import exportController from '../controllers/export.controller.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
const router = Router();

// Allow access to exports for ADMIN, MEDICO, and LECTOR roles
router.get(
  '/excel',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  exportController.downloadExcel
);

router.get(
  '/ics',
  authenticateJWT,
  authorizeRoles('ADMIN', 'MEDICO', 'LECTOR'),
  exportController.downloadICS
);

export default router;
