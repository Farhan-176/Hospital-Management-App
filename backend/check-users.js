const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function checkUsers() {
  try {
    await sequelize.sync();
    const users = await User.findAll();
    console.log('\nUsers in database:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
