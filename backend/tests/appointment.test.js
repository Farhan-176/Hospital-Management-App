/**
 * Appointment Tests
 * Tests appointment scheduling, double-booking prevention, and status updates
 */

const request = require('supertest');
const app = require('../src/server');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Doctor = require('../src/models/Doctor');
const Department = require('../src/models/Department');
const Appointment = require('../src/models/Appointment');
const bcrypt = require('bcryptjs');

describe('Appointment API', () => {
  let authToken;
  let patientId;
  let doctorUserId;
  let departmentId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '1234567890',
      isActive: true
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    authToken = loginResponse.body.data.token;

    // Create department
    const department = await Department.create({
      name: 'Cardiology',
      description: 'Heart care'
    });
    departmentId = department.id;

    // Create doctor
    const doctorUser = await User.create({
      email: 'doctor@test.com',
      password: hashedPassword,
      firstName: 'Dr.',
      lastName: 'Smith',
      role: 'doctor',
      phone: '1234567891',
      isActive: true
    });
    doctorUserId = doctorUser.id;

    await Doctor.create({
      userId: doctorUser.id,
      specialization: 'Cardiology',
      licenseNumber: 'DOC001',
      departmentId: department.id,
      consultationFee: 1000,
      availability: { monday: ['09:00-17:00'] }
    });

    // Create patient
    const patient = await Patient.create({
      userId: adminUser.id,
      medicalRecordNumber: 'PT-2026-0001',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      bloodGroup: 'O+',
      address: '123 Test St'
    });
    patientId = patient.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear appointments before each test
    await Appointment.destroy({ where: {} });
  });

  describe('POST /api/appointments', () => {
    test('should create appointment successfully', async () => {
      const appointmentData = {
        patientId: patientId,
        doctorId: doctorUserId,
        departmentId: departmentId,
        appointmentDate: '2026-02-20',
        appointmentTime: '10:00',
        reasonForVisit: 'Regular checkup',
        appointmentType: 'consultation'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('scheduled');
      expect(response.body.data.tokenNumber).toBeDefined();
    });

    test('should prevent double-booking for same time slot', async () => {
      const appointmentData = {
        patientId: patientId,
        doctorId: doctorUserId,
        departmentId: departmentId,
        appointmentDate: '2026-02-20',
        appointmentTime: '14:00',
        reasonForVisit: 'Test 1',
        appointmentType: 'consultation'
      };

      // Create first appointment
      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData)
        .expect(201);

      // Try to create duplicate appointment
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...appointmentData, reasonForVisit: 'Test 2' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already booked');
    });

    test('should reject appointment with missing fields', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ patientId: patientId })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointments', () => {
    test('should get all appointments', async () => {
      // Create test appointment
      await Appointment.create({
        patientId: patientId,
        doctorId: doctorUserId,
        departmentId: departmentId,
        appointmentDate: '2026-02-20',
        appointmentTime: '10:00',
        reasonForVisit: 'Test',
        appointmentType: 'consultation',
        status: 'scheduled',
        tokenNumber: 'A001'
      });

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    test('should update appointment status', async () => {
      const appointment = await Appointment.create({
        patientId: patientId,
        doctorId: doctorUserId,
        departmentId: departmentId,
        appointmentDate: '2026-02-20',
        appointmentTime: '10:00',
        reasonForVisit: 'Test',
        appointmentType: 'consultation',
        status: 'scheduled',
        tokenNumber: 'A001'
      });

      const response = await request(app)
        .put(`/api/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });
  });
});
