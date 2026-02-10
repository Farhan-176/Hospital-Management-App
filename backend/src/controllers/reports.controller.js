const { success, error } = require('../utils/response');
const { sequelize } = require('../config/database');
const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const LabTest = require('../models/LabTest');
const { Op } = require('sequelize');

/**
 * Get financial summary report
 */
const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    // Total revenue
    const revenueData = await Invoice.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('amountPaid')), 'totalPaid'],
        [sequelize.fn('SUM', sequelize.col('balanceDue')), 'totalPending'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'invoiceCount']
      ],
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
    });

    // Revenue by payment status
    const revenueByStatus = await Invoice.findAll({
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'amount']
      ],
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      group: ['paymentStatus']
    });

    // Revenue breakdown by service type
    const serviceBreakdown = await Invoice.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('consultationFee')), 'consultationRevenue'],
        [sequelize.fn('SUM', sequelize.col('medicineCharges')), 'medicineRevenue'],
        [sequelize.fn('SUM', sequelize.col('labCharges')), 'labRevenue'],
        [sequelize.fn('SUM', sequelize.col('roomCharges')), 'roomRevenue'],
        [sequelize.fn('SUM', sequelize.col('otherCharges')), 'otherRevenue']
      ],
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
    });

    return success(res, {
      summary: revenueData[0],
      byStatus: revenueByStatus,
      serviceBreakdown: serviceBreakdown[0]
    }, 'Financial report generated successfully');
  } catch (err) {
    console.error('Get financial report error:', err);
    return error(res, 'Failed to generate financial report', 500);
  }
};

/**
 * Get operational statistics report
 */
const getOperationalReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    // Appointment statistics
    const appointmentStats = await Appointment.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalAppointments'],
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      group: ['status']
    });

    const totalAppointments = await Appointment.count({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
    });

    const completedAppointments = await Appointment.count({
      where: {
        status: 'completed',
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
      }
    });

    // Patient statistics
    const totalPatients = await Patient.count({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
    });

    const newPatients = await Patient.count({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
    });

    // Prescription statistics
    const totalPrescriptions = await Prescription.count({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
    });

    const dispensedPrescriptions = await Prescription.count({
      where: {
        status: 'completed',
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
      }
    });

    // Lab test statistics
    const totalLabTests = await LabTest.count({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
    });

    const completedLabTests = await LabTest.count({
      where: {
        status: 'completed',
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
      }
    });

    return success(res, {
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(2) : 0,
        byStatus: appointmentStats
      },
      patients: {
        total: totalPatients,
        new: newPatients
      },
      prescriptions: {
        total: totalPrescriptions,
        dispensed: dispensedPrescriptions,
        dispensingRate: totalPrescriptions > 0 ? ((dispensedPrescriptions / totalPrescriptions) * 100).toFixed(2) : 0
      },
      labTests: {
        total: totalLabTests,
        completed: completedLabTests,
        completionRate: totalLabTests > 0 ? ((completedLabTests / totalLabTests) * 100).toFixed(2) : 0
      }
    }, 'Operational report generated successfully');
  } catch (err) {
    console.error('Get operational report error:', err);
    return error(res, 'Failed to generate operational report', 500);
  }
};

/**
 * Get inventory report
 */
const getInventoryReport = async (req, res) => {
  try {
    const { lowStockOnly } = req.query;

    const where = {};
    if (lowStockOnly === 'true') {
      where.stock = { [Op.lte]: sequelize.col('minStock') };
    }

    // Total medicines
    const totalMedicines = await Medicine.count();

    // Low stock medicines
    const lowStockMedicines = await Medicine.findAll({
      where: {
        stock: { [Op.lte]: sequelize.col('minStock') }
      },
      order: [['stock', 'ASC']]
    });

    // Out of stock
    const outOfStockMedicines = await Medicine.count({
      where: { stock: 0 }
    });

    // Total inventory value
    const inventoryValue = await Medicine.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('stock * price')), 'totalValue']
      ]
    });

    // Category breakdown
    const categoryBreakdown = await Medicine.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('stock')), 'totalStock'],
        [sequelize.fn('SUM', sequelize.literal('stock * price')), 'totalValue']
      ],
      group: ['category']
    });

    return success(res, {
      summary: {
        totalMedicines,
        lowStockCount: lowStockMedicines.length,
        outOfStockCount: outOfStockMedicines,
        totalValue: inventoryValue[0]?.dataValues?.totalValue || 0
      },
      lowStockItems: lowStockMedicines,
      categoryBreakdown
    }, 'Inventory report generated successfully');
  } catch (err) {
    console.error('Get inventory report error:', err);
    return error(res, 'Failed to generate inventory report', 500);
  }
};

/**
 * Get dashboard summary for admin
 */
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todayAppointments = await Appointment.count({
      where: {
        appointmentDate: today.toISOString().split('T')[0]
      }
    });

    const todayCompleted = await Appointment.count({
      where: {
        appointmentDate: today.toISOString().split('T')[0],
        status: 'completed'
      }
    });

    // Total patients
    const totalPatients = await Patient.count();

    // Low stock alerts
    const lowStockCount = await Medicine.count({
      where: {
        stock: { [Op.lte]: sequelize.col('minStock') }
      }
    });

    // Today's revenue
    const todayRevenue = await Invoice.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amountPaid')), 'revenue']
      ],
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Pending invoices
    const pendingInvoices = await Invoice.count({
      where: {
        paymentStatus: { [Op.in]: ['pending', 'partial'] }
      }
    });

    return success(res, {
      appointments: {
        today: todayAppointments,
        completed: todayCompleted,
        completionRate: todayAppointments > 0 ? ((todayCompleted / todayAppointments) * 100).toFixed(2) : 0
      },
      patients: {
        total: totalPatients
      },
      inventory: {
        lowStockAlerts: lowStockCount
      },
      revenue: {
        today: todayRevenue[0]?.dataValues?.revenue || 0,
        pendingInvoices
      }
    }, 'Dashboard summary generated successfully');
  } catch (err) {
    console.error('Get dashboard summary error:', err);
    return error(res, 'Failed to generate dashboard summary', 500);
  }
};

module.exports = {
  getFinancialReport,
  getOperationalReport,
  getInventoryReport,
  getDashboardSummary
};
