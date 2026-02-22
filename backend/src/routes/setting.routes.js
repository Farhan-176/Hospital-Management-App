const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

// All settings routes are protected and restricted to admin
router.use(authenticateJWT);
router.use(authorizeRole('admin'));

router.get('/', settingController.getAllSettings);
router.post('/', settingController.updateSettings);

module.exports = router;
