const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // Create departments
    const departments = await Department.bulkCreate([
      { name: 'Cardiology', description: 'Heart and cardiovascular system' },
      { name: 'Neurology', description: 'Brain and nervous system' },
      { name: 'Orthopedics', description: 'Bones and muscles' },
      { name: 'Pediatrics', description: 'Children healthcare' },
      { name: 'General Medicine', description: 'General health issues' }
    ]);
    console.log('✓ Departments created');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@hospital.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phone: '1234567890',
      isActive: true
    });
    console.log('✓ Admin user created');

    // Create receptionist
    await User.create({
      email: 'reception@hospital.com',
      password: await bcrypt.hash('reception123', 10),
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'receptionist',
      phone: '1234567891',
      isActive: true
    });
    console.log('✓ Receptionist created');

    // Create doctors
    const doctorUsers = await User.bulkCreate([
      {
        email: 'dr.smith@hospital.com',
        password: await bcrypt.hash('doctor123', 10),
        firstName: 'John',
        lastName: 'Smith',
        role: 'doctor',
        phone: '1234567892',
        isActive: true
      },
      {
        email: 'dr.williams@hospital.com',
        password: await bcrypt.hash('doctor123', 10),
        firstName: 'Emily',
        lastName: 'Williams',
        role: 'doctor',
        phone: '1234567893',
        isActive: true
      }
    ]);

    await Doctor.bulkCreate([
      {
        userId: doctorUsers[0].id,
        specialization: 'Cardiology',
        licenseNumber: 'DR-CARDIO-001',
        departmentId: departments[0].id,
        consultationFee: 1500,
        availability: { monday: ['09:00-17:00'], tuesday: ['09:00-17:00'], wednesday: ['09:00-17:00'] }
      },
      {
        userId: doctorUsers[1].id,
        specialization: 'Neurology',
        licenseNumber: 'DR-NEURO-001',
        departmentId: departments[1].id,
        consultationFee: 2000,
        availability: { thursday: ['10:00-18:00'], friday: ['10:00-18:00'] }
      }
    ]);
    console.log('✓ Doctors created');

    // Create sample medicines
    await Medicine.bulkCreate([
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', stock: 500, price: 50, minStock: 100 },
      { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic', stock: 1000, price: 10, minStock: 200 },
      { name: 'Aspirin 75mg', genericName: 'Aspirin', category: 'Antiplatelet', stock: 300, price: 20, minStock: 100 },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', stock: 400, price: 30, minStock: 100 },
      { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Antidiabetic', stock: 600, price: 40, minStock: 150 }
    ]);
    console.log('✓ Medicines created');

    // Create sample patient
    await User.create({
      email: 'patient@example.com',
      password: await bcrypt.hash('patient123', 10),
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'patient',
      phone: '1234567894',
      isActive: true
    });
    console.log('✓ Sample patient created');

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin: admin@hospital.com / admin123');
    console.log('Receptionist: reception@hospital.com / reception123');
    console.log('Doctor 1: dr.smith@hospital.com / doctor123');
    console.log('Doctor 2: dr.williams@hospital.com / doctor123');
    console.log('Patient: patient@example.com / patient123');

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
