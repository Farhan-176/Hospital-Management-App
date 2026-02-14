/**
 * Authentication Tests
 * Run with: npm test
 */

const request = require('supertest');
const app = require('../src/server');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

// Test user data
const testUser = {
  email: 'test@hospital.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  phone: '1234567890'
};

describe('Authentication API', () => {
  // Setup and teardown
  beforeAll(async () => {
    // Connect to test database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {} });
  });

  // Registration Tests
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
      expect(response.body.data.token).toBeDefined();
    });

    test('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@hospital.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject duplicate email registration', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Login Tests
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await User.create({
        ...testUser,
        password: hashedPassword,
        isActive: true
      });
    });

    test('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@hospital.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject login for inactive user', async () => {
      // Deactivate user
      await User.update(
        { isActive: false },
        { where: { email: testUser.email } }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // Profile Tests
  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // Create user and get token
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await User.create({
        ...testUser,
        password: hashedPassword,
        isActive: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.data.token;
    });

    test('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.password).toBeUndefined();
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
