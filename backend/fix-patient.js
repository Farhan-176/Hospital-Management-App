const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');

async function fixPatient() {
  try {
    await sequelize.sync();
    
    // Find patient user
    const patientUser = await User.findOne({ 
      where: { email: 'patient@example.com' },
      include: [{ model: Patient, as: 'patientProfile' }]
    });
    
    if (!patientUser) {
      console.log('Patient user not found!');
      process.exit(1);
    }
    
    console.log('Patient user found:', patientUser.email);
    
    if (!patientUser.patientProfile) {
      console.log('Creating patient profile...');
      
      const patient = await Patient.create({
        userId: patientUser.id,
        medicalRecordNumber: 'MRN-' + Date.now(),
        bloodGroup: 'O+',
        allergies: [],
        chronicConditions: [],
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '1234567890'
        }
      });
      
      console.log('✓ Patient profile created:', patient.medicalRecordNumber);
    } else {
      console.log('Patient profile already exists:', patientUser.patientProfile.medicalRecordNumber);
      
      // Update MRN if missing
      if (!patientUser.patientProfile.medicalRecordNumber) {
        await patientUser.patientProfile.update({
          medicalRecordNumber: 'MRN-' + Date.now()
        });
        console.log('✓ Updated MRN');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPatient();
