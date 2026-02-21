require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    // For SQLite (lightweight demo)
    storage: process.env.DB_STORAGE || './database.sqlite',
    dialect: process.env.DB_DIALECT || 'sqlite',

    // For PostgreSQL (production - uncomment these and comment SQLite above)
    // host: process.env.DB_HOST || 'localhost',
    // port: process.env.DB_PORT || 5432,
    // database: process.env.DB_NAME || 'hospital_management',
    // username: process.env.DB_USER || 'postgres',
    // password: process.env.DB_PASSWORD || '',
    // dialect: 'postgres',

    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000 // Increased for development
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
