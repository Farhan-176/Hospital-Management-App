const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
    // Examples: 'CREATE_PATIENT', 'UPDATE_PRESCRIPTION', 'VIEW_MEDICAL_RECORD'
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false
    // Examples: 'patient', 'prescription', 'appointment', 'invoice'
  },
  resourceId: {
    type: DataTypes.UUID
  },
  method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
    allowNull: false
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.TEXT
  },
  requestBody: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('requestBody');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('requestBody', value ? JSON.stringify(value) : null);
    }
  },
  responseStatus: {
    type: DataTypes.INTEGER
  },
  changes: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('changes');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('changes', value ? JSON.stringify(value) : null);
    }
  },
  metadata: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('metadata');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value || {}));
    }
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low'
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'audit_logs',
  updatedAt: false
});

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = AuditLog;
