const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const User = require('../models/User');

/**
 * Authenticate JWT token
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Access token required', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return error(res, 'Invalid or expired token', 401);
    }

    // Fetch user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.isActive) {
      return error(res, 'User not found or inactive', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return error(res, 'Authentication failed', 401);
  }
};

/**
 * Authorize specific roles
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthorized access', 403);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(res, `Access denied. Required roles: ${allowedRoles.join(', ')}`, 403);
    }

    next();
  };
};

/**
 * Check if user owns the resource or is admin
 */
const authorizeOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.id !== resourceUserId) {
      return error(res, 'You can only access your own resources', 403);
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole,
  authorizeOwnership
};
