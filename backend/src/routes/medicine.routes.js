const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicine.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

// Get all medicines
router.get('/', 
  authenticateJWT, 
  medicineController.getAllMedicines
);

// Get medicine by ID
router.get('/:id', 
  authenticateJWT, 
  medicineController.getMedicineById
);

// Get low stock medicines
router.get('/alerts/low-stock', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist'), 
  medicineController.getLowStockMedicines
);

// Create medicine (admin only)
router.post('/', 
  authenticateJWT, 
  authorizeRole('admin'), 
  medicineController.createMedicine
);

// Update medicine (admin only)
router.put('/:id', 
  authenticateJWT, 
  authorizeRole('admin'), 
  medicineController.updateMedicine
);

// Update stock
router.post('/:id/stock', 
  authenticateJWT, 
  authorizeRole('admin', 'receptionist'), 
  medicineController.updateStock
);

module.exports = router;
