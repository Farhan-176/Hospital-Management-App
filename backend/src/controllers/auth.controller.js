const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');
const { withTransaction } = require('../utils/transaction');

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: Patient, as: 'patientProfile' },
        { model: Doctor, as: 'doctorProfile', include: ['department'] }
      ]
    });

    if (!user) {
      return error(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return error(res, 'Account is inactive', 403);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return error(res, 'Invalid credentials', 401);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.id
    });

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    return success(res, {
      user: userData,
      accessToken,
      refreshToken
    }, 'Login successful');

  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed', 500);
  }
};

/**
 * Register new patient
 */
const register = async (req, res) => {
  try {
    const userData = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      return error(res, 'Email already registered', 409);
    }

    const result = await withTransaction(async (transaction) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: 'patient'
      }, { transaction });

      // Create patient profile
      const patient = await Patient.create({
        userId: user.id
      }, { transaction });

      return { user, patient };
    });

    // Generate tokens
    const accessToken = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role
    });

    const refreshToken = generateRefreshToken({
      id: result.user.id
    });

    // Remove password from response
    const userData_response = result.user.toJSON();
    delete userData_response.password;

    return success(res, {
      user: userData_response,
      patient: result.patient,
      accessToken,
      refreshToken
    }, 'Registration successful', 201);

  } catch (err) {
    console.error('Registration error:', err);
    return error(res, 'Registration failed', 500);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Patient, as: 'patientProfile' },
        { model: Doctor, as: 'doctorProfile', include: ['department'] }
      ]
    });

    return success(res, user, 'Profile retrieved successfully');
  } catch (err) {
    console.error('Get profile error:', err);
    return error(res, 'Failed to retrieve profile', 500);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update(updates);

    const updatedUser = user.toJSON();
    delete updatedUser.password;

    return success(res, updatedUser, 'Profile updated successfully');
  } catch (err) {
    console.error('Update profile error:', err);
    return error(res, 'Failed to update profile', 500);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return error(res, 'Refresh token required', 400);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return error(res, 'Invalid refresh token', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return error(res, 'User not found', 404);
    }

    const newAccessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return success(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (err) {
    console.error('Refresh token error:', err);
    return error(res, 'Failed to refresh token', 500);
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  refreshToken
};
