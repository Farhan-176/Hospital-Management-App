const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');

const LabTest = sequelize.define('LabTest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  testNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Patient,
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Doctor,
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.UUID,
    references: {
      model: Appointment,
      key: 'id'
    }
  },
  testName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  testType: {
    type: DataTypes.ENUM('blood', 'urine', 'imaging', 'biopsy', 'culture', 'other'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  priority: {
    type: DataTypes.ENUM('routine', 'urgent', 'stat'),
    defaultValue: 'routine'
  },
  status: {
    type: DataTypes.ENUM('ordered', 'sample-collected', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'ordered'
  },
  instructions: {
    type: DataTypes.TEXT
  },
  results: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('results');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('results', JSON.stringify(value || {}));
    }
  },
  normalRange: {
    type: DataTypes.TEXT
  },
  findings: {
    type: DataTypes.TEXT
  },
  interpretation: {
    type: DataTypes.TEXT
  },
  performedBy: {
    type: DataTypes.STRING
  },
  verifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sampleCollectedAt: {
    type: DataTypes.DATE
  },
  reportedAt: {
    type: DataTypes.DATE
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  attachments: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('attachments');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('attachments', JSON.stringify(value || []));
    }
  }
}, {
  timestamps: true,
  tableName: 'lab_tests',
  hooks: {
    beforeCreate: async (labTest) => {
      if (!labTest.testNumber) {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const count = await LabTest.count();
        labTest.testNumber = `LAB-${date}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

LabTest.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
LabTest.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
LabTest.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Patient.hasMany(LabTest, { foreignKey: 'patientId', as: 'labTests' });
Appointment.hasMany(LabTest, { foreignKey: 'appointmentId', as: 'labTests' });

module.exports = LabTest;
