const Joi = require('joi');

/**
 * Create staff validation schema
 */
const createStaffSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('doctor', 'receptionist', 'admin').required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  
  // Doctor-specific fields
  specialization: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  licenseNumber: Joi.when('role', {
    is: 'doctor',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  departmentId: Joi.string().uuid().optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  experience: Joi.number().integer().min(0).optional(),
  consultationFee: Joi.number().positive().optional(),
  availability: Joi.object().optional()
});

/**
 * Update staff validation schema
 */
const updateStaffSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  isActive: Joi.boolean().optional(),
  
  // Doctor-specific fields
  specialization: Joi.string().optional(),
  departmentId: Joi.string().uuid().allow(null).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  experience: Joi.number().integer().min(0).optional(),
  consultationFee: Joi.number().positive().optional(),
  availability: Joi.object().optional(),
  isAvailable: Joi.boolean().optional()
});

module.exports = {
  createStaffSchema,
  updateStaffSchema
};
