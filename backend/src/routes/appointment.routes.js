const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAppointmentSchema, updateAppointmentSchema } = require('../validators/appointment.validator');

// Create appointment (receptionist, patient)
router.post('/', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist', 'patient'), 
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

// Get all appointments (admin, receptionist)
router.get('/', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist'), 
  appointmentController.getAllAppointments
);

// Get appointment by ID
router.get('/:id', 
  authenticateJWT, 
  appointmentController.getAppointmentById
);

// Get doctor's schedule
router.get('/doctor/:doctorId/schedule', 
  authenticateJWT, 
  appointmentController.getDoctorSchedule
);

// Get doctor's queue
router.get('/doctor/:doctorId/queue', 
  authenticateJWT, 
  authorizeRole('doctor', 'receptionist', 'admin'), 
  appointmentController.getDoctorQueue
);

// Get patient's appointments
router.get('/patient/:patientId', 
  authenticateJWT, 
  appointmentController.getPatientAppointments
);

// Update appointment
router.put('/:id', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist', 'doctor'), 
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

// Cancel appointment
router.post('/:id/cancel', 
  authenticateJWT, 
  appointmentController.cancelAppointment
);

module.exports = router;
