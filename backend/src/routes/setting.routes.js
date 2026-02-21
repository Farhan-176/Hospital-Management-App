const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All settings routes are protected and restricted to admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', settingController.getAllSettings);
router.post('/', settingController.updateSettings);

module.exports = router;
