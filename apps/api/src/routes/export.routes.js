const { Router } = require('express');
const exportController = require('../controllers/export.controller');
const { authenticateJWT } = require('../middlewares/authenticateJWT');
const { authorizeRoles } = require('../middlewares/authorizeRoles');
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

module.exports = router;
