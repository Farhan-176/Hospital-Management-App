const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPrescriptionSchema } = require('../validators/prescription.validator');

// Create prescription (doctor only)
router.post('/', 
  authenticateJWT, 
  authorizeRole('doctor'), 
  validate(createPrescriptionSchema),
  prescriptionController.createPrescription
);

// Get prescription by ID
router.get('/:id', 
  authenticateJWT, 
  prescriptionController.getPrescriptionById
);

// Get patient's prescriptions
router.get('/patient/:patientId', 
  authenticateJWT, 
  prescriptionController.getPatientPrescriptions
);

// Dispense prescription (pharmacist)
router.post('/:id/dispense', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist'), // In real system, would be 'pharmacist'
  prescriptionController.dispensePrescription
);

module.exports = router;
