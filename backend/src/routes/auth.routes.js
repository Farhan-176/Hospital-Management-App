const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema, registerSchema, updateProfileSchema } = require('../validators/auth.validator');

// Public routes
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/profile', authenticateJWT, authController.getProfile);
router.put('/profile', authenticateJWT, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
