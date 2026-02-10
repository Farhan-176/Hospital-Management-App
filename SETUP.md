# Hospital Management System - Setup Guide

## 🏥 Complete Installation & Deployment Guide

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional) - [Download](https://git-scm.com/)
- **Docker & Docker Compose** (optional, for containerized deployment) - [Download](https://www.docker.com/)

---

## Quick Start (Development)

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend Configuration

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your database credentials:
   ```env
   PORT=5000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hospital_management
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password

   JWT_SECRET=your_super_secret_key_change_this
   JWT_EXPIRE=7d

   CORS_ORIGIN=http://localhost:3000
   ```

#### Frontend Configuration

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. The default configuration should work:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Step 3: Setup Database

1. **Create PostgreSQL Database:**

   Using PostgreSQL command line:
   ```bash
   psql -U postgres
   CREATE DATABASE hospital_management;
   \q
   ```

   Or using pgAdmin (GUI tool).

2. **Run Database Migrations:**

   ```bash
   cd backend
   npm run db:migrate
   ```

   This will create all necessary tables.

3. **Seed Initial Data:**

   ```bash
   npm run db:seed
   ```

   This creates sample users, departments, doctors, and medicines.

### Step 4: Start the Application

#### Option 1: Using Individual Commands

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Option 2: Using Concurrent Command (from root)

```bash
npm run dev
```

This starts both backend and frontend simultaneously.

### Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## Default Login Credentials

After seeding the database, you can login with:

### Admin
- **Email:** admin@hospital.com
- **Password:** admin123

### Doctor
- **Email:** dr.smith@hospital.com
- **Password:** doctor123

### Receptionist
- **Email:** reception@hospital.com
- **Password:** reception123

### Patient
- **Email:** patient@example.com
- **Password:** patient123

---

## Docker Deployment

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Steps

1. **Make sure Docker is running**

2. **Build and start all containers:**

   ```bash
   docker-compose up -d
   ```

   This will:
   - Create PostgreSQL database container
   - Build and start backend API container
   - Build and start frontend React app container

3. **Initialize the database:**

   ```bash
   # Access backend container
   docker exec -it hms-backend sh

   # Run migrations
   npm run db:migrate

   # Seed data
   npm run db:seed

   # Exit container
   exit
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

5. **Stop containers:**
   ```bash
   docker-compose down
   ```

6. **View logs:**
   ```bash
   docker-compose logs -f
   ```

---

## Project Structure

```
hospital-management-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app configuration
│   │   │   ├── config.js
│   │   │   ├── database.js
│   │   │   ├── migrate.js
│   │   │   └── seed.js
│   │   ├── controllers/     # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── patient.controller.js
│   │   │   ├── appointment.controller.js
│   │   │   ├── prescription.controller.js
│   │   │   └── medicine.controller.js
│   │   ├── middleware/      # Authentication, validation, error handling
│   │   │   ├── auth.js
│   │   │   ├── validate.js
│   │   │   └── errorHandler.js
│   │   ├── models/          # Database models (Sequelize)
│   │   │   ├── User.js
│   │   │   ├── Patient.js
│   │   │   ├── Doctor.js
│   │   │   ├── Appointment.js
│   │   │   ├── Prescription.js
│   │   │   ├── Medicine.js
│   │   │   ├── Invoice.js
│   │   │   └── Department.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── appointment.routes.js
│   │   │   ├── prescription.routes.js
│   │   │   ├── medicine.routes.js
│   │   │   └── index.js
│   │   ├── services/        # External services (future)
│   │   ├── utils/           # Helper functions
│   │   │   ├── jwt.js
│   │   │   ├── response.js
│   │   │   └── transaction.js
│   │   ├── validators/      # Request validation schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── appointment.validator.js
│   │   │   └── prescription.validator.js
│   │   └── server.js        # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/         # React Context (Auth)
│   │   │   └── AuthContext.js
│   │   ├── pages/           # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.js
│   │   │   ├── doctor/
│   │   │   │   └── DoctorDashboard.js
│   │   │   ├── receptionist/
│   │   │   │   └── ReceptionistDashboard.js
│   │   │   └── patient/
│   │   │       └── PatientDashboard.js
│   │   ├── services/        # API service layer
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── patientService.js
│   │   │   ├── appointmentService.js
│   │   │   ├── prescriptionService.js
│   │   │   └── medicineService.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── package.json
└── README.md
```

---

## API Documentation

See [API.md](./backend/API.md) for complete API documentation.

---

## Features Implemented

### ✅ Core Modules

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Token refresh mechanism
   - Secure password hashing (bcrypt)

2. **User Management**
   - Multiple user roles (Admin, Doctor, Receptionist, Patient)
   - Profile management
   - Role-specific permissions

3. **Patient Management**
   - Patient registration with auto-generated MRN
   - Medical history tracking
   - Blood group, allergies, chronic conditions
   - Emergency contact & insurance info

4. **Appointment Scheduling**
   - Double-booking prevention (row locking)
   - Time slot management
   - Queue token generation
   - Status tracking (scheduled, confirmed, in-progress, completed, cancelled)
   - Doctor's daily schedule view

5. **Electronic Medical Records (EMR)**
   - Immutable medical history
   - Visit tracking
   - Diagnosis records
   - Prescription history

6. **Digital Prescriptions**
   - Structured medication orders
   - Lab test requests
   - Follow-up scheduling
   - Prescription dispensing workflow

7. **Inventory Management**
   - Medicine stock tracking
   - Automatic stock decrement on dispensing
   - Low stock alerts
   - Batch & expiry tracking (expandable)

8. **Billing System (Foundation)**
   - Invoice generation
   - Multi-source billing (consultation, medicines, labs, rooms)
   - Payment tracking
   - Audit trail

### ✅ Security Features

- JWT authentication with role-based access
- Password hashing with bcrypt
- Input validation using Joi
- SQL injection protection via Sequelize ORM
- CORS configuration
- Rate limiting
- Helmet.js security headers

### ✅ Transaction Safety

- Database transactions for critical operations
- Row-level locking for appointment booking
- Stock validation before dispensing
- Audit logging for sensitive operations

---

## Testing the Application

### 1. Register a New Patient

1. Go to http://localhost:3000/register
2. Fill in the registration form
3. Login with the created account

### 2. Book an Appointment (Receptionist)

1. Login as receptionist
2. Go to receptionist dashboard
3. Register a patient
4. Book appointment (this feature can be expanded)

### 3. Doctor Workflow

1. Login as doctor (dr.smith@hospital.com)
2. View today's schedule and queue
3. Check-in patients
4. Write prescriptions (expand this feature)
5. Complete appointments

### 4. Admin Functions

1. Login as admin
2. View system statistics
3. Manage medicines
4. View reports

---

## Troubleshooting

### Database Connection Error

**Error:** `Unable to connect to the database`

**Solution:**
1. Check if PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure database exists: `CREATE DATABASE hospital_management;`

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Change PORT in backend/.env
2. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -ti:5000 | xargs kill
   ```

### Frontend Cannot Connect to Backend

**Error:** `Network Error`

**Solution:**
1. Ensure backend is running on port 5000
2. Check REACT_APP_API_URL in frontend/.env
3. Verify CORS_ORIGIN in backend/.env

---

## Next Steps / Roadmap

### Phase 2 Enhancements

- [ ] Complete appointment booking UI for patients
- [ ] Prescription creation UI for doctors
- [ ] Pharmacy dispensing interface
- [ ] Billing invoice generation UI
- [ ] Patient medical history viewer
- [ ] Report generation (PDF)
- [ ] Email notifications
- [ ] SMS notifications

### Phase 3 Features

- [ ] Lab test management
- [ ] Room/Bed management
- [ ] Staff scheduling
- [ ] Financial reports & analytics
- [ ] Insurance claim management
- [ ] Video consultation integration
- [ ] Mobile app (React Native)

### Phase 4 Improvements

- [ ] Microservices architecture
- [ ] Redis caching
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Real-time updates (Socket.io)
- [ ] Advanced analytics dashboard
- [ ] Multi-hospital support
- [ ] HIPAA compliance features

---

## Production Deployment

### Environment Configuration

1. **Update environment variables for production:**

   Backend `.env`:
   ```env
   NODE_ENV=production
   DB_HOST=your-production-db-host
   DB_PASSWORD=strong-production-password
   JWT_SECRET=very-strong-random-secret
   CORS_ORIGIN=https://your-domain.com
   ```

2. **Use environment-specific database**

3. **Enable HTTPS**

4. **Configure reverse proxy (Nginx)**

5. **Set up monitoring (PM2, New Relic, etc.)**

### Deployment Options

- **AWS:** EC2, RDS, S3, CloudFront
- **DigitalOcean:** Droplets, Managed Databases
- **Heroku:** Easy deployment with Heroku Postgres
- **Vercel/Netlify:** Frontend deployment
- **Docker:** Container orchestration with Kubernetes

---

## Support & Contribution

For issues, questions, or contributions, please:

1. Check existing documentation
2. Review API documentation
3. Test with provided demo credentials
4. Check logs for error details

---

## License

MIT License - See LICENSE file for details

---

## Quality Checklist

✅ No double bookings possible (row locking)  
✅ No unauthorized data access (RBAC)  
✅ Inventory never goes negative (validation)  
✅ Medical history immutable (append-only)  
✅ Billing always traceable (audit logs)  
✅ Passwords securely hashed (bcrypt)  
✅ JWT authentication with expiry  
✅ Input validation on all endpoints  
✅ Error handling with proper HTTP codes  
✅ Transaction management for critical operations  

---

**Built with ❤️ for Healthcare Providers**
