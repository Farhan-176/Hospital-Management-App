const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Department = require('./Department');

const Doctor = sequelize.define('Doctor', {
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  departmentId: {
    type: DataTypes.UUID,
    references: {
      model: Department,
      key: 'id'
    }
  },
  qualifications: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('qualifications');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('qualifications', JSON.stringify(value || []));
    }
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 500
  },
  availability: {
    type: DataTypes.TEXT,
    defaultValue: '{"monday":[],"tuesday":[],"wednesday":[],"thursday":[],"friday":[],"saturday":[],"sunday":[]}',
    get() {
      const value = this.getDataValue('availability');
      return value ? JSON.parse(value) : {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };
    },
    set(value) {
      this.setDataValue('availability', JSON.stringify(value || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }));
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'doctors'
});

User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Doctor.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

module.exports = Doctor;
