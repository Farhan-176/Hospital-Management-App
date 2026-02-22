require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const dialect = process.env.DB_DIALECT || (isProduction ? 'postgres' : 'sqlite');

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    dialect,

    // SQLite (development only)
    storage: process.env.DB_STORAGE || './database.sqlite',

    // PostgreSQL (production)
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    logging: isProduction ? false : console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    // Required for Neon / SSL-enabled Postgres hosts
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_key_in_production',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || '"CareSync HMS" <noreply@caresync.com>'
  }
};
