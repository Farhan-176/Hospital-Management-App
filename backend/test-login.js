const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function testLogin() {
  try {
    const email = 'admin@hospital.com';
    const password = 'admin123';
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('User found:', email);
    console.log('Stored password hash:', user.password);
    console.log('Password to test:', password);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);
    
    // Test with a fresh hash
    const freshHash = await bcrypt.hash(password, 10);
    const isValidFresh = await bcrypt.compare(password, freshHash);
    console.log('Fresh hash test:', isValidFresh);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
