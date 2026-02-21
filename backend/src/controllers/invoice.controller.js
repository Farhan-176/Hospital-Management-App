const { success, error } = require('../utils/response');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * Create a new invoice
 */
const createInvoice = async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      items,
      consultationFee,
      medicineCharges,
      labCharges,
      roomCharges,
      otherCharges,
      discount,
      notes,
      sendEmail
    } = req.body;

    if (!patientId) {
      return error(res, 'Patient ID is required', 400);
    }

    // Verify patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return error(res, 'Patient not found', 404);
    }

    // Verify appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return error(res, 'Appointment not found', 404);
      }
      if (appointment.patientId !== patientId) {
        return error(res, 'Appointment does not belong to this patient', 400);
      }
    }

    // Calculate totals
    const consultationTotal = parseFloat(consultationFee || 0);
    const medicineTotal = parseFloat(medicineCharges || 0);
    const labTotal = parseFloat(labCharges || 0);
    const roomTotal = parseFloat(roomCharges || 0);
    const otherTotal = parseFloat(otherCharges || 0);
    const discountAmount = parseFloat(discount || 0);

    const subtotal = consultationTotal + medicineTotal + labTotal + roomTotal + otherTotal;
    const taxRate = 0; // Configure as needed
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Generate invoice number
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await Invoice.count();
    const invoiceNumber = `INV-${date}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      patientId,
      appointmentId: appointmentId || null,
      items: items || [],
      consultationFee: consultationTotal,
      medicineCharges: medicineTotal,
      labCharges: labTotal,
      roomCharges: roomTotal,
      otherCharges: otherTotal,
      subtotal,
      taxAmount,
      discount: discountAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      paymentStatus: 'pending',
      paymentMethod: null,
      notes
    });

    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    // Send invoice email if requested
    if (sendEmail && createdInvoice.patient?.user?.email) {
      emailService.sendInvoiceEmail(createdInvoice.patient.user.email, createdInvoice).catch(err => {
        console.error('Failed to send invoice email:', err);
      });
    }

    return success(res, createdInvoice, 'Invoice created successfully', 201);
  } catch (err) {
    console.error('Create invoice error:', err);
    return error(res, 'Failed to create invoice', 500);
  }
};

/**
 * Get all invoices
 */
const getAllInvoices = async (req, res) => {
  try {
    const { patientId, paymentStatus, startDate, endDate } = req.query;

    const where = {};
    if (patientId) where.patientId = patientId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[require('sequelize').Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[require('sequelize').Op.lte] = new Date(endDate);
    }

    const invoices = await Invoice.findAll({
      where,
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return success(res, invoices, 'Invoices retrieved successfully');
  } catch (err) {
    console.error('Get all invoices error:', err);
    return error(res, 'Failed to retrieve invoices', 500);
  }
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patientProfile || patientProfile.id !== invoice.patientId) {
        return error(res, 'Unauthorized to view this invoice', 403);
      }
    }

    return success(res, invoice, 'Invoice retrieved successfully');
  } catch (err) {
    console.error('Get invoice by ID error:', err);
    return error(res, 'Failed to retrieve invoice', 500);
  }
};

/**
 * Get patient invoices
 */
const getPatientInvoices = async (req, res) => {
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
        return error(res, 'Unauthorized to view these invoices', 403);
      }
    }

    const invoices = await Invoice.findAll({
      where: { patientId },
      include: [
        { model: Appointment, as: 'appointment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return success(res, invoices, 'Patient invoices retrieved successfully');
  } catch (err) {
    console.error('Get patient invoices error:', err);
    return error(res, 'Failed to retrieve patient invoices', 500);
  }
};

/**
 * Update invoice
 */
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      items,
      consultationFee,
      medicineCharges,
      labCharges,
      roomCharges,
      otherCharges,
      discount,
      notes
    } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    if (invoice.paymentStatus === 'paid') {
      return error(res, 'Cannot update a paid invoice', 400);
    }

    // Recalculate totals if amounts changed
    const consultationTotal = consultationFee !== undefined ? parseFloat(consultationFee) : invoice.consultationFee;
    const medicineTotal = medicineCharges !== undefined ? parseFloat(medicineCharges) : invoice.medicineCharges;
    const labTotal = labCharges !== undefined ? parseFloat(labCharges) : invoice.labCharges;
    const roomTotal = roomCharges !== undefined ? parseFloat(roomCharges) : invoice.roomCharges;
    const otherTotal = otherCharges !== undefined ? parseFloat(otherCharges) : invoice.otherCharges;
    const discountAmount = discount !== undefined ? parseFloat(discount) : invoice.discount;

    const subtotal = consultationTotal + medicineTotal + labTotal + roomTotal + otherTotal;
    const taxAmount = invoice.taxAmount; // Keep existing tax
    const totalAmount = subtotal + taxAmount - discountAmount;
    const balanceDue = totalAmount - invoice.amountPaid;

    const updates = {
      consultationFee: consultationTotal,
      medicineCharges: medicineTotal,
      labCharges: labTotal,
      roomCharges: roomTotal,
      otherCharges: otherTotal,
      discount: discountAmount,
      subtotal,
      totalAmount,
      balanceDue: Math.max(0, balanceDue)
    };

    if (items !== undefined) updates.items = items;
    if (notes !== undefined) updates.notes = notes;

    await invoice.update(updates);

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return success(res, updatedInvoice, 'Invoice updated successfully');
  } catch (err) {
    console.error('Update invoice error:', err);
    return error(res, 'Failed to update invoice', 500);
  }
};

/**
 * Process payment for invoice
 */
const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionId } = req.body;

    if (!amount || amount <= 0) {
      return error(res, 'Valid payment amount is required', 400);
    }

    if (!paymentMethod) {
      return error(res, 'Payment method is required', 400);
    }

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    if (invoice.paymentStatus === 'paid') {
      return error(res, 'Invoice is already paid', 400);
    }

    const paymentAmount = parseFloat(amount);
    const newAmountPaid = parseFloat(invoice.amountPaid) + paymentAmount;
    const newBalanceDue = invoice.totalAmount - newAmountPaid;

    let paymentStatus = 'pending';
    if (newBalanceDue <= 0) {
      paymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      paymentStatus = 'partial';
    }

    await invoice.update({
      amountPaid: newAmountPaid,
      balanceDue: Math.max(0, newBalanceDue),
      paymentStatus,
      paymentMethod,
      paidAt: paymentStatus === 'paid' ? new Date() : invoice.paidAt,
      transactionId: transactionId || invoice.transactionId
    });

    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return success(res, updatedInvoice, 'Payment processed successfully');
  } catch (err) {
    console.error('Process payment error:', err);
    return error(res, 'Failed to process payment', 500);
  }
};

/**
 * Cancel invoice
 */
const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    if (invoice.paymentStatus === 'paid') {
      return error(res, 'Cannot cancel a paid invoice', 400);
    }

    if (invoice.paymentStatus === 'cancelled') {
      return error(res, 'Invoice is already cancelled', 400);
    }

    await invoice.update({ paymentStatus: 'cancelled' });

    return success(res, invoice, 'Invoice cancelled successfully');
  } catch (err) {
    console.error('Cancel invoice error:', err);
    return error(res, 'Failed to cancel invoice', 500);
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getPatientInvoices,
  updateInvoice,
  processPayment,
  cancelInvoice
};
