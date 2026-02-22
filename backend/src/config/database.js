const { Sequelize } = require('sequelize');
const config = require('./config');

let sequelize;

if (config.database.dialect === 'sqlite') {
  // SQLite for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.database.storage,
    logging: config.database.logging,
    pool: config.database.pool
  });
} else {
  // PostgreSQL for production
  sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: config.database.dialect,
      logging: config.database.logging,
      pool: config.database.pool,
      dialectOptions: config.database.dialectOptions
    }
  );
}

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
