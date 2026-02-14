const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

// All audit log routes are restricted to admin
router.use(authenticateJWT);
router.use(authorizeRole('admin'));

router.get('/', auditLogController.getAllAuditLogs);
router.get('/:id', auditLogController.getAuditLogById);

module.exports = router;
