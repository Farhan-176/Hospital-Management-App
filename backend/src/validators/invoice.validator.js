const Joi = require('joi');

/**
 * Create invoice validation schema
 */
const createInvoiceSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  appointmentId: Joi.string().uuid().optional(),
  items: Joi.array().items(Joi.object({
    description: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    unitPrice: Joi.number().positive().required(),
    total: Joi.number().positive().required()
  })).optional(),
  consultationFee: Joi.number().min(0).optional(),
  medicineCharges: Joi.number().min(0).optional(),
  labCharges: Joi.number().min(0).optional(),
  roomCharges: Joi.number().min(0).optional(),
  otherCharges: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  notes: Joi.string().optional()
});

/**
 * Process payment validation schema
 */
const processPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'insurance', 'online').required(),
  transactionId: Joi.string().optional()
});

module.exports = {
  createInvoiceSchema,
  processPaymentSchema
};
