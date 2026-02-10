const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional().allow(''),
  role: Joi.string().valid('patient').default('patient'),
  dateOfBirth: Joi.date().optional().allow(''),
  gender: Joi.string().valid('male', 'female', 'other').optional().allow(''),
  address: Joi.string().optional().allow('')
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  address: Joi.string().optional()
});

module.exports = {
  loginSchema,
  registerSchema,
  updateProfileSchema
};
