const Joi = require('joi');

/**
 * Create lab test validation schema
 */
const createLabTestSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  doctorId: Joi.string().uuid().required(),
  appointmentId: Joi.string().uuid().optional(),
  testName: Joi.string().required(),
  testType: Joi.string().valid('blood', 'urine', 'imaging', 'biopsy', 'culture', 'other').required(),
  category: Joi.string().optional(),
  priority: Joi.string().valid('routine', 'urgent', 'stat').optional(),
  instructions: Joi.string().optional(),
  cost: Joi.number().min(0).optional()
});

/**
 * Update lab test status validation schema
 */
const updateLabTestStatusSchema = Joi.object({
  status: Joi.string().valid('ordered', 'sample-collected', 'in-progress', 'completed', 'cancelled').required(),
  performedBy: Joi.string().optional(),
  sampleCollectedAt: Joi.date().optional()
});

/**
 * Add lab test results validation schema
 */
const addLabTestResultsSchema = Joi.object({
  results: Joi.object().required(),
  findings: Joi.string().optional(),
  interpretation: Joi.string().optional(),
  normalRange: Joi.string().optional(),
  attachments: Joi.array().items(Joi.string()).optional()
});

module.exports = {
  createLabTestSchema,
  updateLabTestStatusSchema,
  addLabTestResultsSchema
};
