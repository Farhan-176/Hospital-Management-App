# 🏥 Hospital Management System - System Overview

## Enterprise-Grade Healthcare Management Platform

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React.js)                     │
│  ┌─────────────┬──────────────┬─────────────┬─────────────┐│
│  │   Admin     │    Doctor    │ Receptionist│   Patient   ││
│  │  Dashboard  │   Dashboard  │  Dashboard  │  Dashboard  ││
│  └─────────────┴──────────────┴─────────────┴─────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JWT Auth)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                    │
│  ┌──────────┬──────────┬────────────┬─────────────────────┐│
│  │   Auth   │  RBAC    │ Validation │  Error Handling    ││
│  │Middleware│Middleware│ Middleware │     Middleware     ││
│  └──────────┴──────────┴────────────┴─────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers & Services                   │  │
│  │  • Authentication    • Appointments                  │  │
│  │  • Patient Mgmt      • Prescriptions                 │  │
│  │  • Medicine/Inventory • Billing                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Sequelize ORM (Data Layer)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                            │
│  ┌──────┬─────────┬────────────┬──────────┬──────────────┐ │
│  │Users │Patients │Appointments│ Medicines│ Prescriptions│ │
│  └──────┴─────────┴────────────┴──────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Data Models

### 1. User Management
```
┌─────────────────────────────────────┐
│              Users                  │
├─────────────────────────────────────┤
│ • id (UUID)                         │
│ • email (unique)                    │
│ • password (hashed)                 │
│ • role (admin/doctor/receptionist/  │
│         patient)                    │
│ • firstName, lastName               │
│ • phone, address                    │
│ • isActive, lastLogin               │
└─────────────────────────────────────┘
```

### 2. Patient Profile
```
┌─────────────────────────────────────┐
│             Patients                │
├─────────────────────────────────────┤
│ • medicalRecordNumber (auto-gen)   │
│ • bloodGroup                        │
│ • allergies (array)                 │
│ • chronicConditions (array)         │
│ • emergencyContact (JSON)           │
│ • insuranceInfo (JSON)              │
│ → References: User                  │
└─────────────────────────────────────┘
```

### 3. Doctor Profile
```
┌─────────────────────────────────────┐
│              Doctors                │
├─────────────────────────────────────┤
│ • specialization                    │
│ • licenseNumber (unique)            │
│ • qualifications (array)            │
│ • consultationFee                   │
│ • availability (JSON schedule)      │
│ • rating                            │
│ → References: User, Department      │
└─────────────────────────────────────┘
```

### 4. Appointments (With Locking)
```
┌─────────────────────────────────────┐
│           Appointments              │
├─────────────────────────────────────┤
│ • appointmentNumber (auto-gen)      │
│ • appointmentDate, appointmentTime  │
│ • status (scheduled/confirmed/      │
│          in-progress/completed)     │
│ • queueToken (Q-001, Q-002...)      │
│ • diagnosis, notes                  │
│ • checkInTime, checkOutTime         │
│ → References: Patient, Doctor       │
│ ⚡ Row Locking for Double-Booking   │
│    Prevention                       │
└─────────────────────────────────────┘
```

### 5. Prescriptions
```
┌─────────────────────────────────────┐
│          Prescriptions              │
├─────────────────────────────────────┤
│ • prescriptionNumber (auto-gen)     │
│ • diagnosis                         │
│ • medications (JSON array):         │
│   - medicineId, medicineName        │
│   - dosage, frequency, duration     │
│ • labTests (array)                  │
│ • advice, followUpDate              │
│ • status (active/completed)         │
│ → References: Appointment, Patient  │
│              Doctor                 │
└─────────────────────────────────────┘
```

### 6. Medicine Inventory
```
┌─────────────────────────────────────┐
│             Medicines               │
├─────────────────────────────────────┤
│ • name, genericName                 │
│ • category, manufacturer            │
│ • stock (current quantity)          │
│ • minStock (threshold)              │
│ • price                             │
│ • expiryDate                        │
│ ⚡ Stock Auto-Decrement on Dispense │
│ ⚡ Low Stock Alerts                 │
└─────────────────────────────────────┘
```

---

## Security Implementation

### Authentication Flow
```
1. User Login
   ↓
2. Validate Credentials (bcrypt)
   ↓
3. Generate JWT (access + refresh tokens)
   ↓
4. Store tokens in localStorage
   ↓
5. Include token in Authorization header
   ↓
6. Middleware verifies token
   ↓
7. Attach user to request
   ↓
8. Role-based authorization check
   ↓
9. Execute protected endpoint
```

### Role-Based Access Control (RBAC)

| Feature | Admin | Doctor | Receptionist | Patient |
|---------|-------|--------|--------------|---------|
| Register Patient | ✓ | ✗ | ✓ | ✗ |
| View All Patients | ✓ | ✓ | ✓ | ✗ |
| Book Appointment | ✓ | ✗ | ✓ | ✓ |
| View Queue | ✓ | ✓ | ✓ | ✗ |
| Create Prescription | ✗ | ✓ | ✗ | ✗ |
| Dispense Medicine | ✓ | ✗ | ✓ | ✗ |
| Manage Inventory | ✓ | ✗ | ✗ | ✗ |
| View Own Records | ✓ | ✓ | ✓ | ✓ |

---

## Critical Features Implementation

### 1. **No Double Booking** ✅
```javascript
// Row-level locking in transaction
const appointment = await withTransaction(async (transaction) => {
  const existing = await Appointment.findOne({
    where: { doctorId, appointmentDate, appointmentTime },
    transaction,
    lock: transaction.LOCK.UPDATE  // 🔒 Row lock
  });
  
  if (existing) throw new Error('Slot taken');
  
  return await Appointment.create({ ... }, { transaction });
});
```

### 2. **Inventory Never Negative** ✅
```javascript
// Stock validation before dispensing
if (medicine.stock < quantity) {
  throw new Error('Insufficient stock');
}

await medicine.update({
  stock: medicine.stock - quantity
}, { transaction });
```

### 3. **Immutable Medical Records** ✅
- Prescriptions are append-only
- Audit logs for all changes
- Timestamps on all records
- No DELETE operations on medical data

### 4. **Secure Authentication** ✅
- Passwords hashed with bcrypt (10 rounds)
- JWT with expiration
- Refresh token mechanism
- Role-based middleware

### 5. **Transaction Safety** ✅
```javascript
const withTransaction = async (callback) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

---

## User Workflows

### Receptionist Workflow
```
1. Patient arrives
   ↓
2. Check if existing patient (search by MRN/name)
   ↓
3. If new → Register patient (auto-generate MRN)
   ↓
4. Check doctor availability
   ↓
5. Book appointment (prevents double booking)
   ↓
6. Generate queue token
   ↓
7. Print appointment slip
```

### Doctor Workflow
```
1. Login to doctor dashboard
   ↓
2. View today's schedule & queue
   ↓
3. Check-in patient (status: in-progress)
   ↓
4. View patient medical history
   ↓
5. Diagnose and create prescription
   ↓
6. Request lab tests (if needed)
   ↓
7. Complete appointment
   ↓
8. Next patient
```

### Patient Workflow
```
1. Register/Login
   ↓
2. View doctor availability
   ↓
3. Book appointment online
   ↓
4. Receive confirmation
   ↓
5. Check appointment status
   ↓
6. View medical history
   ↓
7. Download prescriptions/reports
```

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register patient
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/refresh` - Refresh token

### Patients
- `POST /api/patients` - Register patient
- `GET /api/patients` - List patients
- `GET /api/patients/:id` - Get patient
- `GET /api/patients/:id/history` - Medical history

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/doctor/:id/queue` - Get queue
- `PUT /api/appointments/:id` - Update status
- `POST /api/appointments/:id/cancel` - Cancel

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/patient/:id` - Get prescriptions
- `POST /api/prescriptions/:id/dispense` - Dispense

### Medicines
- `GET /api/medicines` - List medicines
- `POST /api/medicines` - Add medicine
- `POST /api/medicines/:id/stock` - Update stock
- `GET /api/medicines/alerts/low-stock` - Low stock alerts

---

## Technology Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL 14+
- **Authentication:** JWT + bcryptjs
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **Library:** React 18
- **Routing:** React Router v6
- **State Management:** Context API
- **HTTP Client:** Axios
- **UI Framework:** Tailwind CSS
- **Icons:** React Icons
- **Notifications:** React Toastify

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Web Server:** Nginx (production)
- **Version Control:** Git

---

## Performance Optimizations

1. **Database Indexing**
   - patient_id, doctor_id
   - appointment_date
   - medicalRecordNumber

2. **Connection Pooling**
   ```javascript
   pool: {
     max: 5,
     min: 0,
     acquire: 30000,
     idle: 10000
   }
   ```

3. **Pagination**
   - All list endpoints support pagination
   - Default limit: 10

4. **Selective Field Loading**
   - Exclude sensitive fields (passwords)
   - Use Sequelize attributes option

---

## Monitoring & Logging

### Audit Logs
```javascript
createAuditLog(
  'CREATE_PRESCRIPTION',
  'prescription',
  prescriptionId,
  userId,
  { medications: 3 }
);
```

### Access Logs
- Morgan middleware logs all requests
- Development: 'dev' format
- Production: 'combined' format

---

## Future Enhancements

### Phase 2
- Lab test management module
- Billing invoice UI
- PDF report generation
- Email/SMS notifications
- Patient mobile app

### Phase 3
- Video consultation
- Insurance claim processing
- Advanced analytics
- Multi-language support
- FHIR compliance

### Phase 4
- Microservices architecture
- Redis caching
- Message queues
- Real-time updates (Socket.io)
- AI-powered diagnostics

---

## Quality Assurance

### Enterprise Checklist ✅

- [x] No double bookings (row locking)
- [x] No unauthorized access (RBAC)
- [x] Stock never negative (validation)
- [x] Medical records immutable
- [x] Audit trails implemented
- [x] Passwords hashed
- [x] JWT authentication
- [x] Input validation
- [x] Error handling
- [x] Transaction management
- [x] API documentation
- [x] Docker support
- [x] Environment configuration
- [x] Database migrations
- [x] Seed data

---

**System Status: Production Ready ✅**

For installation instructions, see [SETUP.md](./SETUP.md)  
For API documentation, see [API.md](./backend/API.md)
