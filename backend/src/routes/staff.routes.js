const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createStaffSchema, updateStaffSchema } = require('../validators/staff.validator');

// Get all staff members (admin only)
router.get('/', 
  authenticateJWT,
  authorizeRole('admin'),
  staffController.getAllStaff
);

// Get all doctors (public for appointment booking)
router.get('/doctors', 
  authenticateJWT,
  staffController.getAllDoctors
);

// Create staff member (admin only)
router.post('/', 
  authenticateJWT,
  authorizeRole('admin'),
  validate(createStaffSchema),
  staffController.createStaff
);

// Get staff member by ID (admin only)
router.get('/:id', 
  authenticateJWT,
  authorizeRole('admin'),
  staffController.getStaffById
);

// Update staff member (admin only)
router.put('/:id', 
  authenticateJWT,
  authorizeRole('admin'),
  validate(updateStaffSchema),
  staffController.updateStaff
);

// Delete staff member (admin only)
router.delete('/:id', 
  authenticateJWT,
  authorizeRole('admin'),
  staffController.deleteStaff
);

module.exports = router;
