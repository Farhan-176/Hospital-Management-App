const Joi = require('joi');

/**
 * Create department validation schema
 */
const createDepartmentSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  headOfDepartment: Joi.string().uuid().optional()
});

/**
 * Update department validation schema
 */
const updateDepartmentSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  headOfDepartment: Joi.string().uuid().allow(null).optional(),
  isActive: Joi.boolean().optional()
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema
};
