const Joi = require('joi');

const createPrescriptionSchema = Joi.object({
  appointmentId: Joi.string().uuid().required(),
  patientId: Joi.string().uuid().required(),
  diagnosis: Joi.string().required(),
  medications: Joi.array().items(
    Joi.object({
      medicineId: Joi.string().uuid().required(),
      medicineName: Joi.string().required(),
      dosage: Joi.string().required(),
      frequency: Joi.string().required(),
      duration: Joi.string().required(),
      instructions: Joi.string().optional()
    })
  ).min(1).required(),
  labTests: Joi.array().items(Joi.string()).optional(),
  advice: Joi.string().optional(),
  followUpDate: Joi.date().optional()
});

module.exports = {
  createPrescriptionSchema
};
