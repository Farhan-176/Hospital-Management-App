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
 * Create audit log entry
 */
const createAuditLog = async (action, entityType, entityId, userId, changes = {}) => {
  // This would log to an audit_logs table
  console.log('AUDIT LOG:', {
    timestamp: new Date(),
    action,
    entityType,
    entityId,
    userId,
    changes
  });
  
  // TODO: Implement actual audit log table and storage
};

module.exports = {
  withTransaction,
  createAuditLog
};
