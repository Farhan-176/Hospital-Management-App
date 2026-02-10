const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createInvoiceSchema, processPaymentSchema } = require('../validators/invoice.validator');

// Create invoice (admin, receptionist only)
router.post('/', 
  authenticateJWT,
  authorizeRole('admin', 'receptionist'),
  validate(createInvoiceSchema),
  invoiceController.createInvoice
);

// Get all invoices (admin, receptionist only)
router.get('/', 
  authenticateJWT,
  authorizeRole('admin', 'receptionist'),
  invoiceController.getAllInvoices
);

// Get invoice by ID
router.get('/:id', 
  authenticateJWT,
  invoiceController.getInvoiceById
);

// Get patient invoices
router.get('/patient/:patientId', 
  authenticateJWT,
  invoiceController.getPatientInvoices
);

// Update invoice (admin, receptionist only)
router.put('/:id', 
  authenticateJWT,
  authorizeRole('admin', 'receptionist'),
  invoiceController.updateInvoice
);

// Process payment (admin, receptionist only)
router.post('/:id/payment', 
  authenticateJWT,
  authorizeRole('admin', 'receptionist'),
  validate(processPaymentSchema),
  invoiceController.processPayment
);

// Cancel invoice (admin only)
router.post('/:id/cancel', 
  authenticateJWT,
  authorizeRole('admin'),
  invoiceController.cancelInvoice
);

module.exports = router;
