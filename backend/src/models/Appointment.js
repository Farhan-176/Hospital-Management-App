const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Patient = require('./Patient');
const Doctor = require('./Doctor');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentNumber: {
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
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
    defaultValue: 'scheduled'
  },
  type: {
    type: DataTypes.ENUM('consultation', 'follow-up', 'emergency', 'routine-checkup'),
    defaultValue: 'consultation'
  },
  reason: {
    type: DataTypes.TEXT
  },
  symptoms: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('symptoms');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('symptoms', JSON.stringify(value || []));
    }
  },
  queueToken: {
    type: DataTypes.STRING
  },
  diagnosis: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  checkInTime: {
    type: DataTypes.DATE
  },
  checkOutTime: {
    type: DataTypes.DATE
  },
  cancelReason: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'appointments',
  hooks: {
    beforeCreate: async (appointment) => {
      if (!appointment.appointmentNumber) {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const count = await Appointment.count({
          where: {
            appointmentDate: appointment.appointmentDate
          }
        });
        appointment.appointmentNumber = `APT-${date}-${String(count + 1).padStart(3, '0')}`;
      }
    }
  }
});

Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });

module.exports = Appointment;
