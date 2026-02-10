const express = require('express');
const router = express.Router();
const labTestController = require('../controllers/labTest.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createLabTestSchema, updateLabTestStatusSchema, addLabTestResultsSchema } = require('../validators/labTest.validator');

// Create lab test order (doctor only)
router.post('/', 
  authenticateJWT,
  authorizeRole('doctor'),
  validate(createLabTestSchema),
  labTestController.createLabTest
);

// Get all lab tests (admin, doctor, receptionist)
router.get('/', 
  authenticateJWT,
  authorizeRole('admin', 'doctor', 'receptionist'),
  labTestController.getAllLabTests
);

// Get lab test by ID
router.get('/:id', 
  authenticateJWT,
  labTestController.getLabTestById
);

// Get patient lab tests
router.get('/patient/:patientId', 
  authenticateJWT,
  labTestController.getPatientLabTests
);

// Update lab test status (admin, receptionist)
router.put('/:id/status', 
  authenticateJWT,
  authorizeRole('admin', 'receptionist'),
  validate(updateLabTestStatusSchema),
  labTestController.updateLabTestStatus
);

// Add lab test results (admin, doctor)
router.post('/:id/results', 
  authenticateJWT,
  authorizeRole('admin', 'doctor'),
  validate(addLabTestResultsSchema),
  labTestController.addLabTestResults
);

// Cancel lab test (admin, doctor)
router.post('/:id/cancel', 
  authenticateJWT,
  authorizeRole('admin', 'doctor'),
  labTestController.cancelLabTest
);

module.exports = router;
