const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Patient = require('./Patient');
const Appointment = require('./Appointment');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Patient,
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
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
    // Format: [{ description, quantity, unitPrice, total }]
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  medicineCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  labCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  roomCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  otherCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  balanceDue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'insurance', 'online'),
  },
  transactionId: {
    type: DataTypes.STRING
  },
  dueDate: {
    type: DataTypes.DATEONLY
  },
  paidAt: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'invoices',
  hooks: {
    beforeCreate: async (invoice) => {
      if (!invoice.invoiceNumber) {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const count = await Invoice.count();
        invoice.invoiceNumber = `INV-${date}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

Invoice.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Invoice.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Patient.hasMany(Invoice, { foreignKey: 'patientId', as: 'invoices' });

module.exports = Invoice;
