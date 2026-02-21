const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const appointmentRoutes = require('./appointment.routes');
const prescriptionRoutes = require('./prescription.routes');
const medicineRoutes = require('./medicine.routes');
const staffRoutes = require('./staff.routes');
const departmentRoutes = require('./department.routes');
const invoiceRoutes = require('./invoice.routes');
const labTestRoutes = require('./labTest.routes');
const reportsRoutes = require('./reports.routes');
const settingRoutes = require('./setting.routes');
const auditLogRoutes = require('./auditLog.routes');

// API version prefix
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/medicines', medicineRoutes);
router.use('/staff', staffRoutes);
router.use('/departments', departmentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/lab-tests', labTestRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingRoutes);
router.use('/audit-logs', auditLogRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hospital Management System API is running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

module.exports = router;
