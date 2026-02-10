const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

// Receptionist/Admin routes
router.post('/', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist'), 
  patientController.registerPatient
);

router.get('/', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist', 'doctor'), 
  patientController.getAllPatients
);

router.get('/:id', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist', 'doctor'), 
  patientController.getPatientById
);

router.get('/:id/history', 
  authenticateJWT, 
  authorizeRole('admin', 'doctor'), 
  patientController.getPatientHistory
);

router.put('/:id', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist'), 
  patientController.updatePatient
);

module.exports = router;
