const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');

/**
 * Idempotent seed — safe to run multiple times.
 * Skips records that already exist.
 */
const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // --- Departments ---
    const [cardiology] = await Department.findOrCreate({
      where: { name: 'Cardiology' },
      defaults: { description: 'Heart and cardiovascular system' }
    });
    const [neurology] = await Department.findOrCreate({
      where: { name: 'Neurology' },
      defaults: { description: 'Brain and nervous system' }
    });
    await Department.findOrCreate({ where: { name: 'Orthopedics' }, defaults: { description: 'Bones and muscles' } });
    await Department.findOrCreate({ where: { name: 'Pediatrics' }, defaults: { description: 'Children healthcare' } });
    await Department.findOrCreate({ where: { name: 'General Medicine' }, defaults: { description: 'General health issues' } });
    console.log('✓ Departments seeded');

    // --- Admin ---
    await User.findOrCreate({
      where: { email: 'admin@hospital.com' },
      defaults: {
        password: await bcrypt.hash('admin123', 10),
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        phone: '1234567890',
        isActive: true
      }
    });
    console.log('✓ Admin seeded');

    // --- Receptionist ---
    await User.findOrCreate({
      where: { email: 'reception@hospital.com' },
      defaults: {
        password: await bcrypt.hash('reception123', 10),
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'receptionist',
        phone: '1234567891',
        isActive: true
      }
    });
    console.log('✓ Receptionist seeded');

    // --- Doctor 1 ---
    const [doctorUser1, wasCreated1] = await User.findOrCreate({
      where: { email: 'dr.smith@hospital.com' },
      defaults: {
        password: await bcrypt.hash('doctor123', 10),
        firstName: 'John',
        lastName: 'Smith',
        role: 'doctor',
        phone: '1234567892',
        isActive: true
      }
    });
    if (wasCreated1) {
      const Doctor = require('../models/Doctor');
      await Doctor.findOrCreate({
        where: { licenseNumber: 'DR-CARDIO-001' },
        defaults: {
          userId: doctorUser1.id,
          specialization: 'Cardiology',
          departmentId: cardiology.id,
          consultationFee: 1500,
          availability: { monday: ['09:00-17:00'], tuesday: ['09:00-17:00'], wednesday: ['09:00-17:00'] }
        }
      });
    }

    // --- Doctor 2 ---
    const [doctorUser2, wasCreated2] = await User.findOrCreate({
      where: { email: 'dr.williams@hospital.com' },
      defaults: {
        password: await bcrypt.hash('doctor123', 10),
        firstName: 'Emily',
        lastName: 'Williams',
        role: 'doctor',
        phone: '1234567893',
        isActive: true
      }
    });
    if (wasCreated2) {
      const Doctor = require('../models/Doctor');
      await Doctor.findOrCreate({
        where: { licenseNumber: 'DR-NEURO-001' },
        defaults: {
          userId: doctorUser2.id,
          specialization: 'Neurology',
          departmentId: neurology.id,
          consultationFee: 2000,
          availability: { thursday: ['10:00-18:00'], friday: ['10:00-18:00'] }
        }
      });
    }
    console.log('✓ Doctors seeded');

    // --- Medicines ---
    const medicines = [
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', stock: 500, price: 50, minStock: 100 },
      { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic', stock: 1000, price: 10, minStock: 200 },
      { name: 'Aspirin 75mg', genericName: 'Aspirin', category: 'Antiplatelet', stock: 300, price: 20, minStock: 100 },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', stock: 400, price: 30, minStock: 100 },
      { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Antidiabetic', stock: 600, price: 40, minStock: 150 }
    ];
    for (const med of medicines) {
      await Medicine.findOrCreate({ where: { name: med.name }, defaults: med });
    }
    console.log('✓ Medicines seeded');

    // --- Sample Patient ---
    const [patientUser, patientCreated] = await User.findOrCreate({
      where: { email: 'patient@example.com' },
      defaults: {
        password: await bcrypt.hash('patient123', 10),
        firstName: 'Michael',
        lastName: 'Brown',
        role: 'patient',
        phone: '1234567894',
        isActive: true
      }
    });
    if (patientCreated) {
      const year = new Date().getFullYear();
      await Patient.findOrCreate({
        where: { userId: patientUser.id },
        defaults: {
          medicalRecordNumber: `PT-${year}-0001`,
          bloodGroup: 'O+',
          allergies: [],
          chronicConditions: [],
          emergencyContact: { name: 'Jane Brown', phone: '1234567895', relationship: 'Spouse' }
        }
      });
    }
    console.log('✓ Sample patient seeded');

    console.log('\n=== Seed Complete ===');
    console.log('Admin:        admin@hospital.com     / admin123');
    console.log('Receptionist: reception@hospital.com / reception123');
    console.log('Doctor 1:     dr.smith@hospital.com  / doctor123');
    console.log('Doctor 2:     dr.williams@hospital.com / doctor123');
    console.log('Patient:      patient@example.com    / patient123');

  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed().then(() => {
    console.log('\nSeeding completed successfully');
    process.exit(0);
  });
}

module.exports = seed;
