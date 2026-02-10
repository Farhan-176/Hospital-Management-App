const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  medicalRecordNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  },
  allergies: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('allergies');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('allergies', JSON.stringify(value || []));
    }
  },
  chronicConditions: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('chronicConditions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('chronicConditions', JSON.stringify(value || []));
    }
  },
  emergencyContact: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('emergencyContact');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('emergencyContact', JSON.stringify(value || {}));
    }
  },
  insuranceInfo: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('insuranceInfo');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('insuranceInfo', JSON.stringify(value || {}));
    }
  },
  medicalHistory: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'patients',
  hooks: {
    beforeCreate: async (patient) => {
      if (!patient.medicalRecordNumber) {
        const year = new Date().getFullYear();
        const count = await Patient.count();
        patient.medicalRecordNumber = `PT-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Patient;
