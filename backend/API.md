# Hospital Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/login
Login user

**Request Body:**
```json
{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### POST /auth/register
Register new patient

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 Main St"
}
```

### GET /auth/profile
Get current user profile (Protected)

### PUT /auth/profile
Update user profile (Protected)

---

## Patient Endpoints

### POST /patients
Register new patient (Receptionist/Admin only)

**Request Body:**
```json
{
  "email": "patient@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "1234567890",
  "dateOfBirth": "1985-05-15",
  "gender": "female",
  "bloodGroup": "O+",
  "address": "456 Oak Ave"
}
```

### GET /patients
Get all patients with pagination (Receptionist/Admin/Doctor)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional)

### GET /patients/:id
Get patient by ID

### GET /patients/:id/history
Get patient medical history (Admin/Doctor)

### PUT /patients/:id
Update patient information

---

## Appointment Endpoints

### POST /appointments
Create new appointment

**Request Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "appointmentDate": "2026-02-01",
  "appointmentTime": "10:00",
  "type": "consultation",
  "reason": "General checkup",
  "symptoms": ["fever", "headache"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "uuid",
    "appointmentNumber": "APT-20260201-001",
    "queueToken": "Q-001",
    "status": "scheduled",
    ...
  }
}
```

### GET /appointments
Get all appointments (Admin/Receptionist)

**Query Parameters:**
- `page`, `limit`
- `doctorId`, `patientId`
- `date`, `status`

### GET /appointments/:id
Get appointment by ID

### GET /appointments/doctor/:doctorId/schedule
Get doctor's schedule for a specific date

**Query Parameters:**
- `date` (ISO format: YYYY-MM-DD)

### GET /appointments/doctor/:doctorId/queue
Get today's patient queue for doctor

### GET /appointments/patient/:patientId
Get patient's appointments

### PUT /appointments/:id
Update appointment status

**Request Body:**
```json
{
  "status": "completed",
  "diagnosis": "Common cold",
  "notes": "Rest advised"
}
```

### POST /appointments/:id/cancel
Cancel appointment

---

## Prescription Endpoints

### POST /prescriptions
Create prescription (Doctor only)

**Request Body:**
```json
{
  "appointmentId": "uuid",
  "patientId": "uuid",
  "diagnosis": "Hypertension",
  "medications": [
    {
      "medicineId": "uuid",
      "medicineName": "Amlodipine 5mg",
      "dosage": "1 tablet",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take after breakfast"
    }
  ],
  "labTests": ["Blood Pressure", "ECG"],
  "advice": "Reduce salt intake",
  "followUpDate": "2026-03-01"
}
```

### GET /prescriptions/:id
Get prescription by ID

### GET /prescriptions/patient/:patientId
Get patient's prescriptions

### POST /prescriptions/:id/dispense
Dispense prescription (Pharmacist/Receptionist)

**Note:** This automatically decrements medicine stock

---

## Medicine/Inventory Endpoints

### GET /medicines
Get all medicines

**Query Parameters:**
- `page`, `limit`
- `search`, `category`
- `lowStock=true` (filter low stock items)

### GET /medicines/:id
Get medicine by ID

### GET /medicines/alerts/low-stock
Get medicines below minimum stock level

### POST /medicines
Create new medicine (Admin only)

**Request Body:**
```json
{
  "name": "Paracetamol 500mg",
  "genericName": "Paracetamol",
  "category": "Analgesic",
  "stock": 1000,
  "minStock": 200,
  "price": 10.00,
  "manufacturer": "PharmaCo"
}
```

### PUT /medicines/:id
Update medicine (Admin only)

### POST /medicines/:id/stock
Update medicine stock

**Request Body:**
```json
{
  "quantity": 100,
  "type": "add"  // or "remove"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Role-Based Access Control

| Endpoint | Admin | Doctor | Receptionist | Patient |
|----------|-------|---------|--------------|---------|
| POST /patients | ✓ | ✗ | ✓ | ✗ |
| GET /patients | ✓ | ✓ | ✓ | ✗ |
| POST /appointments | ✓ | ✗ | ✓ | ✓ |
| POST /prescriptions | ✗ | ✓ | ✗ | ✗ |
| POST /medicines | ✓ | ✗ | ✗ | ✗ |

---

## Data Flow Examples

### Booking an Appointment

1. **Check doctor availability**
   ```
   GET /appointments/doctor/{doctorId}/schedule?date=2026-02-01
   ```

2. **Create appointment** (with double-booking prevention)
   ```
   POST /appointments
   {
     "doctorId": "...",
     "patientId": "...",
     "appointmentDate": "2026-02-01",
     "appointmentTime": "10:00"
   }
   ```

3. **System locks the time slot** (transaction)
4. **Returns appointment with queue token**

### Prescription & Dispensing

1. **Doctor creates prescription**
   ```
   POST /prescriptions
   ```

2. **Pharmacy views pending prescriptions**
   ```
   GET /prescriptions/patient/{patientId}
   ```

3. **Dispense medicines** (automatically decrements stock)
   ```
   POST /prescriptions/{id}/dispense
   ```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

### Get Patients (with token)
```bash
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```
