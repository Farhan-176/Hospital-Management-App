const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { success, error, paginated } = require('../utils/response');
const { withTransaction, createAuditLog } = require('../utils/transaction');
const { Op } = require('sequelize');

/**
 * Create new appointment with slot locking
 */
const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, type, reason, symptoms } = req.body;

    const appointment = await withTransaction(async (transaction) => {
      // Check if doctor exists and is available
      const doctor = await Doctor.findByPk(doctorId, {
        include: [{ model: User, as: 'user' }],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!doctor || !doctor.isAvailable) {
        throw new Error('Doctor not available');
      }

      // Check for existing appointments at the same time (prevent double booking)
      const existingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          appointmentDate,
          appointmentTime,
          status: {
            [Op.notIn]: ['cancelled', 'no-show']
          }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (existingAppointment) {
        throw new Error('Time slot already booked');
      }

      // Check if patient exists
      const patient = await Patient.findByPk(patientId, { transaction });
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Create appointment
      const newAppointment = await Appointment.create({
        patientId,
        doctorId,
        appointmentDate,
        appointmentTime,
        type,
        reason,
        symptoms: symptoms || [],
        status: 'scheduled'
      }, { transaction });

      // Generate queue token (simple implementation)
      const queueCount = await Appointment.count({
        where: {
          doctorId,
          appointmentDate,
          status: {
            [Op.in]: ['scheduled', 'confirmed', 'in-progress']
          }
        },
        transaction
      });

      await newAppointment.update({
        queueToken: `Q-${String(queueCount).padStart(3, '0')}`
      }, { transaction });

      await createAuditLog('CREATE_APPOINTMENT', 'appointment', newAppointment.id, req.user.id);

      return newAppointment;
    });

    const appointmentData = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Patient, as: 'patient', include: ['user'] },
        { model: Doctor, as: 'doctor', include: ['user', 'department'] }
      ]
    });

    return success(res, appointmentData, 'Appointment created successfully', 201);
  } catch (err) {
    console.error('Create appointment error:', err);
    return error(res, err.message || 'Failed to create appointment', 500);
  }
};

/**
 * Get all appointments (with filters)
 */
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, doctorId, patientId, date, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (date) where.appointmentDate = date;
    if (status) where.status = status;

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', include: ['user'] },
        { model: Doctor, as: 'doctor', include: ['user', 'department'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'ASC']]
    });

    return paginated(res, rows, page, limit, count, 'Appointments retrieved successfully');
  } catch (err) {
    console.error('Get appointments error:', err);
    return error(res, 'Failed to retrieve appointments', 500);
  }
};

/**
 * Get appointment by ID
 */
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', include: ['user'] },
        { model: Doctor, as: 'doctor', include: ['user', 'department'] },
        { model: Prescription, as: 'prescriptions' }
      ]
    });

    if (!appointment) {
      return error(res, 'Appointment not found', 404);
    }

    return success(res, appointment, 'Appointment retrieved successfully');
  } catch (err) {
    console.error('Get appointment error:', err);
    return error(res, 'Failed to retrieve appointment', 500);
  }
};

/**
 * Get doctor's daily schedule
 */
const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const targetDate = date || new Date().toISOString().split('T')[0];

    const appointments = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: targetDate,
        status: {
          [Op.notIn]: ['cancelled', 'no-show']
        }
      },
      include: [
        { model: Patient, as: 'patient', include: ['user'] }
      ],
      order: [['appointmentTime', 'ASC']]
    });

    return success(res, appointments, 'Doctor schedule retrieved successfully');
  } catch (err) {
    console.error('Get doctor schedule error:', err);
    return error(res, 'Failed to retrieve doctor schedule', 500);
  }
};

/**
 * Get patient's appointments
 */
const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.findAll({
      where: { patientId },
      include: [
        { model: Doctor, as: 'doctor', include: ['user', 'department'] },
        { model: Prescription, as: 'prescriptions' }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
    });

    return success(res, appointments, 'Patient appointments retrieved successfully');
  } catch (err) {
    console.error('Get patient appointments error:', err);
    return error(res, 'Failed to retrieve patient appointments', 500);
  }
};

/**
 * Update appointment status (check-in, complete, cancel)
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return error(res, 'Appointment not found', 404);
    }

    // Special handling for status changes
    if (updates.status === 'confirmed' && !appointment.checkInTime) {
      updates.checkInTime = new Date();
    }

    if (updates.status === 'completed' && !appointment.checkOutTime) {
      updates.checkOutTime = new Date();
    }

    await appointment.update(updates);
    await createAuditLog('UPDATE_APPOINTMENT', 'appointment', id, req.user.id, updates);

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', include: ['user'] },
        { model: Doctor, as: 'doctor', include: ['user', 'department'] }
      ]
    });

    return success(res, updatedAppointment, 'Appointment updated successfully');
  } catch (err) {
    console.error('Update appointment error:', err);
    return error(res, 'Failed to update appointment', 500);
  }
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return error(res, 'Appointment not found', 404);
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return error(res, 'Cannot cancel this appointment', 400);
    }

    await appointment.update({
      status: 'cancelled',
      cancelReason
    });

    await createAuditLog('CANCEL_APPOINTMENT', 'appointment', id, req.user.id, { cancelReason });

    return success(res, appointment, 'Appointment cancelled successfully');
  } catch (err) {
    console.error('Cancel appointment error:', err);
    return error(res, 'Failed to cancel appointment', 500);
  }
};

/**
 * Get today's queue for a doctor
 */
const getDoctorQueue = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const queue = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: today,
        status: {
          [Op.in]: ['scheduled', 'confirmed', 'in-progress']
        }
      },
      include: [
        { model: Patient, as: 'patient', include: ['user'] }
      ],
      order: [['appointmentTime', 'ASC']]
    });

    return success(res, queue, 'Queue retrieved successfully');
  } catch (err) {
    console.error('Get doctor queue error:', err);
    return error(res, 'Failed to retrieve queue', 500);
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getDoctorSchedule,
  getPatientAppointments,
  updateAppointment,
  cancelAppointment,
  getDoctorQueue
};
