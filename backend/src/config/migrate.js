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
const Setting = require('../models/Setting');

const migrate = async () => {
  try {
    console.log('Starting database migration...');

    // Production: alter (safe) — Development: force (full reset)
    const isProduction = process.env.NODE_ENV === 'production';
    const syncOptions = isProduction
      ? { alter: true }   // safe: adds columns, doesn't drop data
      : { force: true };  // dev: drop & recreate all tables

    await sequelize.sync(syncOptions);

    console.log(`✓ All tables synced (${isProduction ? 'alter' : 'force'} mode)`);
    console.log('✓ Models synced:');
    console.log('  - Users, Patients, Doctors, Departments');
    console.log('  - Appointments, Prescriptions, Medicines');
    console.log('  - Invoices, Lab Tests, Audit Logs, Settings');
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
