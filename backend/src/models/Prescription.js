const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Appointment = require('./Appointment');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Medicine = require('./Medicine');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  prescriptionNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Appointment,
      key: 'id'
    }
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
  medications: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('medications');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('medications', JSON.stringify(value || []));
    }
    // Format: [{ medicineId, medicineName, dosage, frequency, duration, instructions }]
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  labTests: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('labTests');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('labTests', JSON.stringify(value || []));
    }
  },
  advice: {
    type: DataTypes.TEXT
  },
  followUpDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  dispensedAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'prescriptions',
  hooks: {
    beforeCreate: async (prescription) => {
      if (!prescription.prescriptionNumber) {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const count = await Prescription.count();
        prescription.prescriptionNumber = `RX-${date}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.hasMany(Prescription, { foreignKey: 'appointmentId', as: 'prescriptions' });

module.exports = Prescription;
