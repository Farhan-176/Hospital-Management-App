const { sequelize } = require('../config/database');

/**
 * Transaction wrapper for database operations
 */
const withTransaction = async (callback) => {
  const transaction = await sequelize.transaction();
  
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Create audit log entry (for legacy support)
 * Note: Primary audit logging is handled by middleware/auditLog.js
 * This function provides backward compatibility for direct audit calls
 */
const createAuditLog = async (action, entityType, entityId, userId, changes = {}) => {
  // Console logging for development/debugging
  console.log('AUDIT LOG:', {
    timestamp: new Date(),
    action,
    entityType,
    entityId,
    userId,
    changes
  });
  
  // Comprehensive audit logging is implemented via middleware/auditLog.js
  // which automatically logs all API requests to the audit_logs table
};

module.exports = {
  withTransaction,
  createAuditLog
};
