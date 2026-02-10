const { sequelize } = require('./database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const Invoice = require('../models/Invoice');
const Department = require('../models/Department');
const LabTest = require('../models/LabTest');
const AuditLog = require('../models/AuditLog');

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    // Sync all models
    await sequelize.sync({ force: true });
    
    console.log('✓ All tables created successfully');
    console.log('✓ Models synced:');
    console.log('  - Users');
    console.log('  - Patients');
    console.log('  - Doctors');
    console.log('  - Departments');
    console.log('  - Appointments');
    console.log('  - Prescriptions');
    console.log('  - Medicines');
    console.log('  - Invoices');
    console.log('  - Lab Tests');
    console.log('  - Audit Logs');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  migrate().then(() => {
    console.log('Migration completed');
    process.exit(0);
  });
}

module.exports = migrate;
