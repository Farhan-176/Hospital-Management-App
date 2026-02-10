const { Sequelize } = require('sequelize');
const config = require('./config');

// For SQLite, only storage and dialect are needed
// For PostgreSQL, use full config with host, port, username, password
const sequelize = config.database.dialect === 'sqlite' 
  ? new Sequelize({
      dialect: 'sqlite',
      storage: config.database.storage,
      logging: config.database.logging,
      pool: config.database.pool
    })
  : new Sequelize(
      config.database.database,
      config.database.username,
      config.database.password,
      {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging,
        pool: config.database.pool
      }
    );

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
