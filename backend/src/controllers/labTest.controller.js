const { success, error } = require('../utils/response');
const LabTest = require('../models/LabTest');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * Create a new lab test order
 */
const createLabTest = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      testName,
      testType,
      category,
      priority,
      instructions,
      cost
    } = req.body;

    if (!patientId || !doctorId || !testName || !testType) {
      return error(res, 'Patient ID, doctor ID, test name, and test type are required', 400);
    }

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return error(res, 'Patient not found', 404);
    }

    // Verify doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return error(res, 'Doctor not found', 404);
    }

    // Verify appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return error(res, 'Appointment not found', 404);
      }
    }

    const labTest = await LabTest.create({
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      testName,
      testType,
      category: category || null,
      priority: priority || 'routine',
      instructions,
      cost: cost || 0,
      status: 'ordered'
    });

    const createdLabTest = await LabTest.findByPk(labTest.id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return success(res, createdLabTest, 'Lab test ordered successfully', 201);
  } catch (err) {
    console.error('Create lab test error:', err);
    return error(res, 'Failed to create lab test', 500);
  }
};

/**
 * Get all lab tests
 */
const getAllLabTests = async (req, res) => {
  try {
    const { patientId, doctorId, status, testType, priority, startDate, endDate } = req.query;

    const where = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (testType) where.testType = testType;
    if (priority) where.priority = priority;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[require('sequelize').Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[require('sequelize').Op.lte] = new Date(endDate);
    }

    const labTests = await LabTest.findAll({
      where,
      include: [
        { 
          model: Patient, 
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return success(res, labTests, 'Lab tests retrieved successfully');
  } catch (err) {
    console.error('Get all lab tests error:', err);
    return error(res, 'Failed to retrieve lab tests', 500);
  }
};

/**
 * Get lab test by ID
 */
const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const labTest = await LabTest.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    if (!labTest) {
      return error(res, 'Lab test not found', 404);
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patientProfile || patientProfile.id !== labTest.patientId) {
        return error(res, 'Unauthorized to view this lab test', 403);
      }
    }

    return success(res, labTest, 'Lab test retrieved successfully');
  } catch (err) {
    console.error('Get lab test by ID error:', err);
    return error(res, 'Failed to retrieve lab test', 500);
  }
};

/**
 * Get patient lab tests
 */
const getPatientLabTests = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return error(res, 'Patient not found', 404);
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patientProfile || patientProfile.id !== patientId) {
        return error(res, 'Unauthorized to view these lab tests', 403);
      }
    }

    const labTests = await LabTest.findAll({
      where: { patientId },
      include: [
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return success(res, labTests, 'Patient lab tests retrieved successfully');
  } catch (err) {
    console.error('Get patient lab tests error:', err);
    return error(res, 'Failed to retrieve patient lab tests', 500);
  }
};

/**
 * Update lab test status
 */
const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, performedBy, sampleCollectedAt } = req.body;

    if (!status) {
      return error(res, 'Status is required', 400);
    }

    const labTest = await LabTest.findByPk(id);
    if (!labTest) {
      return error(res, 'Lab test not found', 404);
    }

    const updates = { status };
    
    if (status === 'sample-collected' && sampleCollectedAt) {
      updates.sampleCollectedAt = sampleCollectedAt;
    }
    
    if (performedBy) {
      updates.performedBy = performedBy;
    }

    await labTest.update(updates);

    const updatedLabTest = await LabTest.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return success(res, updatedLabTest, 'Lab test status updated successfully');
  } catch (err) {
    console.error('Update lab test status error:', err);
    return error(res, 'Failed to update lab test status', 500);
  }
};

/**
 * Add lab test results
 */
const addLabTestResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { results, findings, interpretation, normalRange, attachments } = req.body;

    if (!results) {
      return error(res, 'Results are required', 400);
    }

    const labTest = await LabTest.findByPk(id);
    if (!labTest) {
      return error(res, 'Lab test not found', 404);
    }

    await labTest.update({
      results,
      findings: findings || null,
      interpretation: interpretation || null,
      normalRange: normalRange || null,
      attachments: attachments || labTest.attachments,
      status: 'completed',
      reportedAt: new Date(),
      verifiedBy: req.user.id
    });

    const updatedLabTest = await LabTest.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { 
          model: Doctor, 
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return success(res, updatedLabTest, 'Lab test results added successfully');
  } catch (err) {
    console.error('Add lab test results error:', err);
    return error(res, 'Failed to add lab test results', 500);
  }
};

/**
 * Cancel lab test
 */
const cancelLabTest = async (req, res) => {
  try {
    const { id } = req.params;

    const labTest = await LabTest.findByPk(id);
    if (!labTest) {
      return error(res, 'Lab test not found', 404);
    }

    if (labTest.status === 'completed') {
      return error(res, 'Cannot cancel a completed lab test', 400);
    }

    if (labTest.status === 'cancelled') {
      return error(res, 'Lab test is already cancelled', 400);
    }

    await labTest.update({ status: 'cancelled' });

    return success(res, labTest, 'Lab test cancelled successfully');
  } catch (err) {
    console.error('Cancel lab test error:', err);
    return error(res, 'Failed to cancel lab test', 500);
  }
};

module.exports = {
  createLabTest,
  getAllLabTests,
  getLabTestById,
  getPatientLabTests,
  updateLabTestStatus,
  addLabTestResults,
  cancelLabTest
};
