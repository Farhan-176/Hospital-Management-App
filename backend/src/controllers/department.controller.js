const { success, error } = require('../utils/response');
const Department = require('../models/Department');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

/**
 * Get all departments
 */
const getAllDepartments = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const departments = await Department.findAll({
      where,
      include: [
        {
          model: User,
          as: 'head',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    return success(res, departments, 'Departments retrieved successfully');
  } catch (err) {
    console.error('Get all departments error:', err);
    return error(res, 'Failed to retrieve departments', 500);
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: User,
          as: 'head',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    if (!department) {
      return error(res, 'Department not found', 404);
    }

    // Get doctor count
    const doctorCount = await Doctor.count({ where: { departmentId: id } });

    const departmentData = {
      ...department.toJSON(),
      doctorCount
    };

    return success(res, departmentData, 'Department retrieved successfully');
  } catch (err) {
    console.error('Get department by ID error:', err);
    return error(res, 'Failed to retrieve department', 500);
  }
};

/**
 * Create a new department
 */
const createDepartment = async (req, res) => {
  try {
    const { name, description, headOfDepartment } = req.body;

    if (!name) {
      return error(res, 'Department name is required', 400);
    }

    // Check if department already exists
    const existingDepartment = await Department.findOne({ where: { name } });
    if (existingDepartment) {
      return error(res, 'Department with this name already exists', 409);
    }

    // Validate head of department if provided
    if (headOfDepartment) {
      const head = await User.findByPk(headOfDepartment);
      if (!head || head.role !== 'doctor') {
        return error(res, 'Head of department must be a valid doctor', 400);
      }
    }

    const department = await Department.create({
      name,
      description,
      headOfDepartment: headOfDepartment || null,
      isActive: true
    });

    const createdDepartment = await Department.findByPk(department.id, {
      include: [
        {
          model: User,
          as: 'head',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    return success(res, createdDepartment, 'Department created successfully', 201);
  } catch (err) {
    console.error('Create department error:', err);
    return error(res, 'Failed to create department', 500);
  }
};

/**
 * Update department
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, headOfDepartment, isActive } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return error(res, 'Department not found', 404);
    }

    // Check if new name conflicts
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ where: { name } });
      if (existingDepartment) {
        return error(res, 'Department with this name already exists', 409);
      }
    }

    // Validate new head of department
    if (headOfDepartment) {
      const head = await User.findByPk(headOfDepartment);
      if (!head || head.role !== 'doctor') {
        return error(res, 'Head of department must be a valid doctor', 400);
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (headOfDepartment !== undefined) updates.headOfDepartment = headOfDepartment;
    if (isActive !== undefined) updates.isActive = isActive;

    await department.update(updates);

    const updatedDepartment = await Department.findByPk(id, {
      include: [
        {
          model: User,
          as: 'head',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    return success(res, updatedDepartment, 'Department updated successfully');
  } catch (err) {
    console.error('Update department error:', err);
    return error(res, 'Failed to update department', 500);
  }
};

/**
 * Delete department (soft delete)
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return error(res, 'Department not found', 404);
    }

    // Check if department has doctors
    const doctorCount = await Doctor.count({ where: { departmentId: id } });
    if (doctorCount > 0) {
      return error(res, `Cannot delete department. It has ${doctorCount} doctor(s) assigned. Please reassign them first.`, 400);
    }

    // Soft delete
    await department.update({ isActive: false });

    return success(res, null, 'Department deactivated successfully');
  } catch (err) {
    console.error('Delete department error:', err);
    return error(res, 'Failed to delete department', 500);
  }
};

/**
 * Get department doctors
 */
const getDepartmentDoctors = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
    if (!department) {
      return error(res, 'Department not found', 404);
    }

    const doctors = await Doctor.findAll({
      where: { departmentId: id },
      include: [{
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }],
      order: [['rating', 'DESC']]
    });

    return success(res, doctors, 'Department doctors retrieved successfully');
  } catch (err) {
    console.error('Get department doctors error:', err);
    return error(res, 'Failed to retrieve department doctors', 500);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentDoctors
};
