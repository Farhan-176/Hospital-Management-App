const Medicine = require('../models/Medicine');
const { success, error, paginated } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Get all medicines (with pagination and search)
 */
const getAllMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, lowStock } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (lowStock === 'true') {
      where[Op.and] = [
        { stock: { [Op.lte]: sequelize.col('minStock') } }
      ];
    }

    const { count, rows } = await Medicine.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    return paginated(res, rows, page, limit, count, 'Medicines retrieved successfully');
  } catch (err) {
    console.error('Get medicines error:', err);
    return error(res, 'Failed to retrieve medicines', 500);
  }
};

/**
 * Get medicine by ID
 */
const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      return error(res, 'Medicine not found', 404);
    }

    return success(res, medicine, 'Medicine retrieved successfully');
  } catch (err) {
    console.error('Get medicine error:', err);
    return error(res, 'Failed to retrieve medicine', 500);
  }
};

/**
 * Create new medicine (Admin only)
 */
const createMedicine = async (req, res) => {
  try {
    const medicineData = req.body;

    const medicine = await Medicine.create(medicineData);

    return success(res, medicine, 'Medicine created successfully', 201);
  } catch (err) {
    console.error('Create medicine error:', err);
    return error(res, 'Failed to create medicine', 500);
  }
};

/**
 * Update medicine (Admin only)
 */
const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      return error(res, 'Medicine not found', 404);
    }

    await medicine.update(updates);

    return success(res, medicine, 'Medicine updated successfully');
  } catch (err) {
    console.error('Update medicine error:', err);
    return error(res, 'Failed to update medicine', 500);
  }
};

/**
 * Get low stock medicines
 */
const getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({
      where: {
        stock: {
          [Op.lte]: sequelize.col('minStock')
        },
        isActive: true
      },
      order: [['stock', 'ASC']]
    });

    return success(res, medicines, 'Low stock medicines retrieved successfully');
  } catch (err) {
    console.error('Get low stock medicines error:', err);
    return error(res, 'Failed to retrieve low stock medicines', 500);
  }
};

/**
 * Update medicine stock (Admin/Pharmacist)
 */
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'add' or 'remove'

    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      return error(res, 'Medicine not found', 404);
    }

    let newStock = medicine.stock;
    if (type === 'add') {
      newStock += parseInt(quantity);
    } else if (type === 'remove') {
      newStock -= parseInt(quantity);
      if (newStock < 0) {
        return error(res, 'Insufficient stock', 400);
      }
    }

    await medicine.update({ stock: newStock });

    return success(res, medicine, 'Stock updated successfully');
  } catch (err) {
    console.error('Update stock error:', err);
    return error(res, 'Failed to update stock', 500);
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  getLowStockMedicines,
  updateStock
};
