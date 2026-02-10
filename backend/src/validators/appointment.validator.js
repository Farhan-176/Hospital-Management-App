const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  doctorId: Joi.string().uuid().required(),
  appointmentDate: Joi.date().iso().required(),
  appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  type: Joi.string().valid('consultation', 'follow-up', 'emergency', 'routine-checkup').default('consultation'),
  reason: Joi.string().optional(),
  symptoms: Joi.array().items(Joi.string()).optional()
});

const updateAppointmentSchema = Joi.object({
  appointmentDate: Joi.date().iso().optional(),
  appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  status: Joi.string().valid('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show').optional(),
  diagnosis: Joi.string().optional(),
  notes: Joi.string().optional(),
  cancelReason: Joi.string().optional()
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentSchema
};
