const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');
const { Transaction, Op } = require('sequelize');
const { success, error } = require('../utils/response');
const { withTransaction, createAuditLog } = require('../utils/transaction');

/**
 * Create prescription
 */
const createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, diagnosis, medications, labTests, advice, followUpDate } = req.body;
    const doctorId = req.user.doctorProfile?.id;

    if (!doctorId) {
      return error(res, 'Only doctors can create prescriptions', 403);
    }

    const prescription = await withTransaction(async (transaction) => {
      // Verify appointment exists and belongs to this doctor
      const appointment = await Appointment.findByPk(appointmentId, { transaction });
      if (!appointment || appointment.doctorId !== doctorId) {
        throw new Error('Invalid appointment');
      }

      // Verify patient exists
      const patient = await Patient.findByPk(patientId, { transaction });
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Validate all medicines exist
      const medicineIds = medications.map(m => m.medicineId);
      const medicines = await Medicine.findAll({
        where: { id: medicineIds },
        transaction
      });

      if (medicines.length !== medicineIds.length) {
        throw new Error('One or more medicines not found');
      }

      // Create prescription
      const newPrescription = await Prescription.create({
        appointmentId,
        patientId,
        doctorId,
        diagnosis,
        medications,
        labTests: labTests || [],
        advice,
        followUpDate,
        status: 'active'
      }, { transaction });

      // Update appointment with diagnosis
      await appointment.update({
        diagnosis,
        notes: advice
      }, { transaction });

      await createAuditLog('CREATE_PRESCRIPTION', 'prescription', newPrescription.id, req.user.id, {
        patientId,
        medications: medications.length
      });

      return newPrescription;
    });

    const prescriptionData = await Prescription.findByPk(prescription.id, {
      include: [
        { model: Patient, as: 'patient', include: ['user'] },
        { model: Doctor, as: 'doctor', include: ['user'] },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return success(res, prescriptionData, 'Prescription created successfully', 201);
  } catch (err) {
    console.error('Create prescription error:', err);
    return error(res, err.message || 'Failed to create prescription', 500);
  }
};

/**
 * Get prescription by ID
 */
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', include: ['user'] },
        { model: Doctor, as: 'doctor', include: ['user', 'department'] },
        { model: Appointment, as: 'appointment' }
      ]
    });

    if (!prescription) {
      return error(res, 'Prescription not found', 404);
    }

    return success(res, prescription, 'Prescription retrieved successfully');
  } catch (err) {
    console.error('Get prescription error:', err);
    return error(res, 'Failed to retrieve prescription', 500);
  }
};

/**
 * Get patient's prescription history
 */
const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.findAll({
      where: { patientId },
      include: [
        { model: Doctor, as: 'doctor', include: ['user', 'department'] },
        { model: Appointment, as: 'appointment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return success(res, prescriptions, 'Prescriptions retrieved successfully');
  } catch (err) {
    console.error('Get patient prescriptions error:', err);
    return error(res, 'Failed to retrieve prescriptions', 500);
  }
};

/**
 * Dispense prescription (Pharmacy)
 */
const dispensePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await withTransaction(async (transaction) => {
      const prescription = await Prescription.findByPk(id, {
        transaction,
        lock: Transaction.LOCK.UPDATE
      });

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      if (prescription.status === 'completed') {
        throw new Error('Prescription already dispensed');
      }

      // Check stock availability for all medicines
      for (const medication of prescription.medications) {
        const medicine = await Medicine.findByPk(medication.medicineId, {
          transaction,
          lock: Transaction.LOCK.UPDATE
        });

        if (!medicine) {
          throw new Error(`Medicine ${medication.medicineName} not found`);
        }

        const quantity = parseInt(medication.quantity) || 1;

        if (medicine.stock < quantity) {
          throw new Error(`Insufficient stock for ${medication.medicineName}. Available: ${medicine.stock}`);
        }

        // Decrement stock
        await medicine.update({
          stock: medicine.stock - quantity
        }, { transaction });

        await createAuditLog('DISPENSE_MEDICINE', 'medicine', medicine.id, req.user.id, {
          prescriptionId: id,
          quantity,
          previousStock: medicine.stock,
          newStock: medicine.stock - quantity
        });
      }

      // Mark prescription as completed
      await prescription.update({
        status: 'completed',
        dispensedAt: new Date()
      }, { transaction });

      return prescription;
    });

    const updatedPrescription = await Prescription.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', include: ['user'] },
        { model: Doctor, as: 'doctor', include: ['user'] }
      ]
    });

    return success(res, updatedPrescription, 'Prescription dispensed successfully');
  } catch (err) {
    console.error('Dispense prescription error:', err);
    return error(res, err.message || 'Failed to dispense prescription', 500);
  }
};

module.exports = {
  createPrescription,
  getPrescriptionById,
  getPatientPrescriptions,
  dispensePrescription
};
