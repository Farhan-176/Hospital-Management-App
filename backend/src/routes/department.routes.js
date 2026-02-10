const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validators/department.validator');

// Get all departments
router.get('/', 
  authenticateJWT,
  departmentController.getAllDepartments
);

// Get department by ID
router.get('/:id', 
  authenticateJWT,
  departmentController.getDepartmentById
);

// Get department doctors
router.get('/:id/doctors', 
  authenticateJWT,
  departmentController.getDepartmentDoctors
);

// Create department (admin only)
router.post('/', 
  authenticateJWT,
  authorizeRole('admin'),
  validate(createDepartmentSchema),
  departmentController.createDepartment
);

// Update department (admin only)
router.put('/:id', 
  authenticateJWT,
  authorizeRole('admin'),
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);

// Delete department (admin only)
router.delete('/:id', 
  authenticateJWT,
  authorizeRole('admin'),
  departmentController.deleteDepartment
);

module.exports = router;
