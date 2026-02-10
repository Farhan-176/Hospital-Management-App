const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const { success, error, paginated } = require('../utils/response');
const { withTransaction } = require('../utils/transaction');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

/**
 * Register new patient (Receptionist)
 */
const registerPatient = async (req, res) => {
  try {
    const patientData = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ where: { email: patientData.email } });
    if (existingUser) {
      return error(res, 'Email already registered', 409);
    }

    const result = await withTransaction(async (transaction) => {
      // Generate default password if not provided
      const password = patientData.password || Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email: patientData.email,
        password: hashedPassword,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phone: patientData.phone,
        address: patientData.address,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        role: 'patient'
      }, { transaction });

      // Create patient profile
      const patient = await Patient.create({
        userId: user.id,
        bloodGroup: patientData.bloodGroup,
        allergies: patientData.allergies || [],
        chronicConditions: patientData.chronicConditions || [],
        emergencyContact: patientData.emergencyContact || {},
        insuranceInfo: patientData.insuranceInfo || {}
      }, { transaction });

      return { user, patient, temporaryPassword: patientData.password ? null : password };
    });

    const userData = result.user.toJSON();
    delete userData.password;

    return success(res, {
      user: userData,
      patient: result.patient,
      ...(result.temporaryPassword && { temporaryPassword: result.temporaryPassword })
    }, 'Patient registered successfully', 201);

  } catch (err) {
    console.error('Register patient error:', err);
    return error(res, 'Failed to register patient', 500);
  }
};

/**
 * Get all patients (with pagination)
 */
const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } },
        { medicalRecordNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Patient.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return paginated(res, rows, page, limit, count, 'Patients retrieved successfully');
  } catch (err) {
    console.error('Get patients error:', err);
    return error(res, 'Failed to retrieve patients', 500);
  }
};

/**
 * Get patient by ID
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!patient) {
      return error(res, 'Patient not found', 404);
    }

    return success(res, patient, 'Patient retrieved successfully');
  } catch (err) {
    console.error('Get patient error:', err);
    return error(res, 'Failed to retrieve patient', 500);
  }
};

/**
 * Get patient medical history
 */
const getPatientHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Appointment,
          as: 'appointments',
          include: [
            { model: Doctor, as: 'doctor', include: ['user'] },
            { model: Prescription, as: 'prescriptions' }
          ],
          order: [['appointmentDate', 'DESC']]
        }
      ]
    });

    if (!patient) {
      return error(res, 'Patient not found', 404);
    }

    return success(res, patient, 'Patient history retrieved successfully');
  } catch (err) {
    console.error('Get patient history error:', err);
    return error(res, 'Failed to retrieve patient history', 500);
  }
};

/**
 * Update patient information
 */
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const patient = await Patient.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!patient) {
      return error(res, 'Patient not found', 404);
    }

    await withTransaction(async (transaction) => {
      // Update user details if provided
      if (updates.firstName || updates.lastName || updates.phone || updates.address) {
        await patient.user.update({
          ...(updates.firstName && { firstName: updates.firstName }),
          ...(updates.lastName && { lastName: updates.lastName }),
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.address && { address: updates.address }),
          ...(updates.dateOfBirth && { dateOfBirth: updates.dateOfBirth }),
          ...(updates.gender && { gender: updates.gender })
        }, { transaction });
      }

      // Update patient profile
      await patient.update({
        ...(updates.bloodGroup && { bloodGroup: updates.bloodGroup }),
        ...(updates.allergies && { allergies: updates.allergies }),
        ...(updates.chronicConditions && { chronicConditions: updates.chronicConditions }),
        ...(updates.emergencyContact && { emergencyContact: updates.emergencyContact }),
        ...(updates.insuranceInfo && { insuranceInfo: updates.insuranceInfo }),
        ...(updates.medicalHistory && { medicalHistory: updates.medicalHistory })
      }, { transaction });
    });

    const updatedPatient = await Patient.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }]
    });

    return success(res, updatedPatient, 'Patient updated successfully');
  } catch (err) {
    console.error('Update patient error:', err);
    return error(res, 'Failed to update patient', 500);
  }
};

module.exports = {
  registerPatient,
  getAllPatients,
  getPatientById,
  getPatientHistory,
  updatePatient
};
