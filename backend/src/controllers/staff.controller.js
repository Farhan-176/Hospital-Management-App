const { success, error } = require('../utils/response');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');

/**
 * Get all staff members (doctors and receptionists)
 */
const getAllStaff = async (req, res) => {
  try {
    const { role, isActive, departmentId } = req.query;
    
    const where = {};
    if (role && ['doctor', 'receptionist', 'admin'].includes(role)) {
      where.role = role;
    } else {
      where.role = { [require('sequelize').Op.in]: ['doctor', 'receptionist', 'admin'] };
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const include = [];
    if (role === 'doctor' || !role) {
      include.push({
        model: Doctor,
        as: 'doctorProfile',
        include: [{ model: Department, as: 'department' }],
        where: departmentId ? { departmentId } : undefined,
        required: false
      });
    }

    const staff = await User.findAll({
      where,
      include,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    return success(res, staff, 'Staff retrieved successfully');
  } catch (err) {
    console.error('Get all staff error:', err);
    return error(res, 'Failed to retrieve staff', 500);
  }
};

/**
 * Create a new staff member (doctor or receptionist)
 */
const createStaff = async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, role, phone, address,
      dateOfBirth, gender,
      // Doctor specific fields
      specialization, licenseNumber, departmentId, qualifications,
      experience, consultationFee, availability
    } = req.body;

    // Validate role
    if (!['doctor', 'receptionist', 'admin'].includes(role)) {
      return error(res, 'Invalid role. Must be doctor, receptionist, or admin', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return error(res, 'User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      phone,
      address,
      dateOfBirth,
      gender,
      isActive: true
    });

    // If doctor, create doctor profile
    if (role === 'doctor') {
      if (!specialization || !licenseNumber) {
        await user.destroy();
        return error(res, 'Specialization and license number are required for doctors', 400);
      }

      // Check if license number already exists
      const existingDoctor = await Doctor.findOne({ where: { licenseNumber } });
      if (existingDoctor) {
        await user.destroy();
        return error(res, 'Doctor with this license number already exists', 409);
      }

      await Doctor.create({
        userId: user.id,
        specialization,
        licenseNumber,
        departmentId: departmentId || null,
        qualifications: qualifications || [],
        experience: experience || 0,
        consultationFee: consultationFee || 500,
        availability: availability || {
          monday: [], tuesday: [], wednesday: [], thursday: [],
          friday: [], saturday: [], sunday: []
        },
        isAvailable: true
      });
    }

    // Fetch complete user data
    const createdStaff = await User.findByPk(user.id, {
      include: role === 'doctor' ? [
        { model: Doctor, as: 'doctorProfile', include: [{ model: Department, as: 'department' }] }
      ] : [],
      attributes: { exclude: ['password'] }
    });

    return success(res, createdStaff, 'Staff member created successfully', 201);
  } catch (err) {
    console.error('Create staff error:', err);
    return error(res, 'Failed to create staff member', 500);
  }
};

/**
 * Get staff member by ID
 */
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findByPk(id, {
      include: [
        { model: Doctor, as: 'doctorProfile', include: [{ model: Department, as: 'department' }], required: false }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!staff) {
      return error(res, 'Staff member not found', 404);
    }

    if (!['doctor', 'receptionist', 'admin'].includes(staff.role)) {
      return error(res, 'User is not a staff member', 403);
    }

    return success(res, staff, 'Staff member retrieved successfully');
  } catch (err) {
    console.error('Get staff by ID error:', err);
    return error(res, 'Failed to retrieve staff member', 500);
  }
};

/**
 * Update staff member
 */
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, phone, address, dateOfBirth, gender, isActive,
      // Doctor specific fields
      specialization, departmentId, qualifications, experience,
      consultationFee, availability, isAvailable
    } = req.body;

    const staff = await User.findByPk(id);
    if (!staff) {
      return error(res, 'Staff member not found', 404);
    }

    if (!['doctor', 'receptionist', 'admin'].includes(staff.role)) {
      return error(res, 'User is not a staff member', 403);
    }

    // Update user fields
    const userUpdates = {};
    if (firstName !== undefined) userUpdates.firstName = firstName;
    if (lastName !== undefined) userUpdates.lastName = lastName;
    if (phone !== undefined) userUpdates.phone = phone;
    if (address !== undefined) userUpdates.address = address;
    if (dateOfBirth !== undefined) userUpdates.dateOfBirth = dateOfBirth;
    if (gender !== undefined) userUpdates.gender = gender;
    if (isActive !== undefined) userUpdates.isActive = isActive;

    await staff.update(userUpdates);

    // Update doctor profile if applicable
    if (staff.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ where: { userId: id } });
      if (doctorProfile) {
        const doctorUpdates = {};
        if (specialization !== undefined) doctorUpdates.specialization = specialization;
        if (departmentId !== undefined) doctorUpdates.departmentId = departmentId;
        if (qualifications !== undefined) doctorUpdates.qualifications = qualifications;
        if (experience !== undefined) doctorUpdates.experience = experience;
        if (consultationFee !== undefined) doctorUpdates.consultationFee = consultationFee;
        if (availability !== undefined) doctorUpdates.availability = availability;
        if (isAvailable !== undefined) doctorUpdates.isAvailable = isAvailable;

        await doctorProfile.update(doctorUpdates);
      }
    }

    // Fetch updated staff
    const updatedStaff = await User.findByPk(id, {
      include: [
        { model: Doctor, as: 'doctorProfile', include: [{ model: Department, as: 'department' }], required: false }
      ],
      attributes: { exclude: ['password'] }
    });

    return success(res, updatedStaff, 'Staff member updated successfully');
  } catch (err) {
    console.error('Update staff error:', err);
    return error(res, 'Failed to update staff member', 500);
  }
};

/**
 * Delete staff member (soft delete)
 */
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findByPk(id);
    if (!staff) {
      return error(res, 'Staff member not found', 404);
    }

    if (!['doctor', 'receptionist', 'admin'].includes(staff.role)) {
      return error(res, 'User is not a staff member', 403);
    }

    // Prevent deleting yourself
    if (req.user.id === id) {
      return error(res, 'Cannot delete your own account', 403);
    }

    // Soft delete - deactivate instead of removing
    await staff.update({ isActive: false });

    // If doctor, deactivate doctor profile
    if (staff.role === 'doctor') {
      await Doctor.update({ isAvailable: false }, { where: { userId: id } });
    }

    return success(res, null, 'Staff member deactivated successfully');
  } catch (err) {
    console.error('Delete staff error:', err);
    return error(res, 'Failed to delete staff member', 500);
  }
};

/**
 * Get all doctors with availability
 */
const getAllDoctors = async (req, res) => {
  try {
    const { departmentId, specialization, isAvailable } = req.query;

    const where = { role: 'doctor' };
    const doctorWhere = {};

    if (departmentId) doctorWhere.departmentId = departmentId;
    if (specialization) doctorWhere.specialization = { [require('sequelize').Op.iLike]: `%${specialization}%` };
    if (isAvailable !== undefined) doctorWhere.isAvailable = isAvailable === 'true';

    const doctors = await User.findAll({
      where,
      include: [{
        model: Doctor,
        as: 'doctorProfile',
        where: Object.keys(doctorWhere).length > 0 ? doctorWhere : undefined,
        include: [{ model: Department, as: 'department' }],
        required: true
      }],
      attributes: { exclude: ['password'] },
      order: [[{ model: Doctor, as: 'doctorProfile' }, 'rating', 'DESC']]
    });

    return success(res, doctors, 'Doctors retrieved successfully');
  } catch (err) {
    console.error('Get all doctors error:', err);
    return error(res, 'Failed to retrieve doctors', 500);
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getAllDoctors
};
