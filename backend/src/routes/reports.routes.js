const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

// Get financial report (admin only)
router.get('/financial', 
  authenticateJWT,
  authorizeRole('admin'),
  reportsController.getFinancialReport
);

// Get operational report (admin only)
router.get('/operational', 
  authenticateJWT,
  authorizeRole('admin'),
  reportsController.getOperationalReport
);

// Get inventory report (admin, receptionist)
router.get('/inventory', 
  authenticateJWT,
  authorizeRole('admin', 'receptionist'),
  reportsController.getInventoryReport
);

// Get dashboard summary (admin)
router.get('/dashboard', 
  authenticateJWT,
  authorizeRole('admin'),
  reportsController.getDashboardSummary
);

module.exports = router;
