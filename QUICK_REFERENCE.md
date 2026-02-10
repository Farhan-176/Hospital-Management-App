# 🏥 HMS - Quick Reference Card

## 🚀 Quick Start Commands

### Development Setup
```bash
# Install all dependencies
npm run install-all

# Setup database
psql -U postgres -c "CREATE DATABASE hospital_management;"
cd backend
npm run db:migrate
npm run db:seed

# Start development servers
cd ..
npm run dev
```

### Access URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | dr.smith@hospital.com | doctor123 |
| Receptionist | reception@hospital.com | reception123 |
| Patient | patient@example.com | patient123 |

---

## 📡 Common API Calls

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

### Get Patients (with auth)
```bash
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "uuid",
    "doctorId": "uuid",
    "appointmentDate": "2026-02-01",
    "appointmentTime": "10:00",
    "type": "consultation",
    "reason": "General checkup"
  }'
```

---

## 🐳 Docker Commands

```bash
# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Access backend container
docker exec -it hms-backend sh

# Database initialization (inside container)
npm run db:migrate
npm run db:seed
```

---

## 📁 Important Files

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables
- `docker-compose.yml` - Docker configuration

### Documentation
- `README.md` - Project overview
- `SETUP.md` - Installation guide
- `ARCHITECTURE.md` - System architecture
- `backend/API.md` - API documentation
- `PROJECT_SUMMARY.md` - Implementation summary

### Scripts
- `backend/src/config/migrate.js` - Database migrations
- `backend/src/config/seed.js` - Seed data
- `install.sh` / `install.ps1` - Installation scripts

---

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify credentials in backend/.env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hospital_management
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

### Frontend Not Connecting to Backend
1. Check backend is running (http://localhost:5000/api/health)
2. Verify REACT_APP_API_URL in frontend/.env
3. Check CORS_ORIGIN in backend/.env

---

## 📊 Database Tables

1. **users** - User accounts
2. **patients** - Patient profiles
3. **doctors** - Doctor profiles
4. **departments** - Hospital departments
5. **appointments** - Appointment bookings
6. **prescriptions** - Digital prescriptions
7. **medicines** - Inventory
8. **invoices** - Billing

---

## 🎯 User Capabilities by Role

### Admin
- Full system access
- Manage all users
- Add medicines
- View all reports
- System configuration

### Doctor
- View own schedule
- Access patient records
- Write prescriptions
- Complete appointments
- Request lab tests

### Receptionist
- Register patients
- Book appointments
- Check-in patients
- Dispense medicines
- View patient list

### Patient
- Book appointments online
- View own medical history
- Access prescriptions
- View test results
- Update profile

---

## 🔍 Common Workflows

### Register New Patient
1. Login as Receptionist/Admin
2. Go to Receptionist Dashboard
3. Fill patient registration form
4. Auto-generated MRN displayed
5. Note temporary password (if applicable)

### Book Appointment
1. Select patient
2. Choose doctor
3. Select date & time
4. Confirm booking
5. Queue token generated

### Doctor Consultation
1. View queue
2. Check-in patient
3. View medical history
4. Diagnose & prescribe
5. Complete appointment

### Dispense Prescription
1. Scan/search prescription
2. Verify medicines available
3. Confirm dispensing
4. Stock auto-decremented

---

## 📦 NPM Scripts

### Root
```bash
npm run dev          # Start both frontend & backend
npm run install-all  # Install all dependencies
```

### Backend
```bash
npm start            # Start production server
npm run dev          # Start development server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed sample data
```

### Frontend
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

---

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_NAME=hospital_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Status
```bash
psql -U postgres -d hospital_management -c "\dt"
```

### Check Running Processes
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5000
lsof -i :3000
```

---

## 🎨 Color Coding

### Roles
- Admin: Red
- Doctor: Blue
- Receptionist: Green
- Patient: Purple

### Status
- Scheduled: Blue
- Confirmed: Green
- In Progress: Yellow
- Completed: Gray
- Cancelled: Red

---

## 🔐 Security Checklist

✅ JWT authentication  
✅ Password hashing (bcrypt)  
✅ Role-based access control  
✅ Input validation (Joi)  
✅ SQL injection protection (ORM)  
✅ CORS configuration  
✅ Rate limiting  
✅ Security headers (Helmet)  
✅ Error handling  
✅ Environment variables  

---

## 📞 Support

1. Check [SETUP.md](./SETUP.md) for installation issues
2. Review [API.md](./backend/API.md) for API questions
3. See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
4. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for features

---

**Last Updated:** January 31, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
