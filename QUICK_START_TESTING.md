# 🚀 Quick Start Guide - New Features Testing

## Setup & Migration

### 1. Install Dependencies (if needed)
```bash
cd backend
npm install
```

### 2. Run Database Migration
```bash
# This will create new tables: lab_tests, audit_logs
# and update invoices table with new columns
npm run db:migrate
```

### 3. Seed Database (Optional)
```bash
npm run db:seed
```

### 4. Start Server
```bash
npm run dev
```

Server should start on `http://localhost:5000`

---

## Testing New Features

### Prerequisites
Get your admin token by logging in:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

Save the `accessToken` from the response.

---

## 1. Staff Management

### Create a Doctor
```bash
POST http://localhost:5000/api/staff
Authorization: Bearer {your-admin-token}
Content-Type: application/json

{
  "email": "dr.cardio@hospital.com",
  "password": "doctor123",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "role": "doctor",
  "phone": "+1234567890",
  "gender": "female",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "experience": 10,
  "consultationFee": 1500,
  "availability": {
    "monday": ["09:00-17:00"],
    "tuesday": ["09:00-17:00"],
    "wednesday": ["09:00-17:00"],
    "thursday": ["09:00-17:00"],
    "friday": ["09:00-13:00"]
  }
}
```

### Get All Doctors (Public)
```bash
GET http://localhost:5000/api/staff/doctors
Authorization: Bearer {any-user-token}
```

### Get All Staff (Admin Only)
```bash
GET http://localhost:5000/api/staff?role=doctor
Authorization: Bearer {admin-token}
```

---

## 2. Department Management

### Create Department
```bash
POST http://localhost:5000/api/departments
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Cardiology Department",
  "description": "Specialized care for heart and cardiovascular conditions"
}
```

### Get All Departments
```bash
GET http://localhost:5000/api/departments
Authorization: Bearer {any-user-token}
```

### Assign Head of Department
```bash
PUT http://localhost:5000/api/departments/{department-id}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "headOfDepartment": "{doctor-user-id}"
}
```

---

## 3. Billing & Invoicing

### Create Invoice
```bash
POST http://localhost:5000/api/invoices
Authorization: Bearer {admin-or-receptionist-token}
Content-Type: application/json

{
  "patientId": "{patient-id}",
  "appointmentId": "{appointment-id}",
  "items": [
    {
      "description": "ECG Test",
      "quantity": 1,
      "unitPrice": 500,
      "total": 500
    }
  ],
  "consultationFee": 1500,
  "medicineCharges": 250,
  "labCharges": 800,
  "discount": 50
}
```

Expected Response:
- `invoiceNumber`: Auto-generated (e.g., INV-20260208-0001)
- `totalAmount`: Calculated automatically
- `balanceDue`: Same as totalAmount initially
- `paymentStatus`: "pending"

### Get Patient Invoices
```bash
GET http://localhost:5000/api/invoices/patient/{patient-id}
Authorization: Bearer {any-user-token}
```

### Process Payment
```bash
POST http://localhost:5000/api/invoices/{invoice-id}/payment
Authorization: Bearer {admin-or-receptionist-token}
Content-Type: application/json

{
  "amount": 1000,
  "paymentMethod": "cash",
  "transactionId": "CASH-001"
}
```

Test Scenarios:
- Partial payment (amount < total): Status becomes "partial"
- Full payment (amount = remaining): Status becomes "paid"
- Overpayment: Accepted, balanceDue becomes 0

### Get Invoice Details
```bash
GET http://localhost:5000/api/invoices/{invoice-id}
Authorization: Bearer {any-user-token}
```

---

## 4. Lab Tests

### Order Lab Test (as Doctor)
First, login as a doctor to get doctor token:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "doctor123"
}
```

Then order test:
```bash
POST http://localhost:5000/api/lab-tests
Authorization: Bearer {doctor-token}
Content-Type: application/json

{
  "patientId": "{patient-id}",
  "doctorId": "{doctor-profile-id}",
  "appointmentId": "{appointment-id}",
  "testName": "Complete Blood Count",
  "testType": "blood",
  "category": "Hematology",
  "priority": "urgent",
  "instructions": "Patient should be fasting",
  "cost": 500
}
```

Expected Response:
- `testNumber`: Auto-generated (e.g., LAB-20260208-0001)
- `status`: "ordered"

### Update Test Status (as Receptionist)
```bash
PUT http://localhost:5000/api/lab-tests/{test-id}/status
Authorization: Bearer {receptionist-token}
Content-Type: application/json

{
  "status": "sample-collected",
  "performedBy": "Lab Technician John Doe",
  "sampleCollectedAt": "2026-02-08T10:30:00Z"
}
```

### Add Test Results (as Doctor)
```bash
POST http://localhost:5000/api/lab-tests/{test-id}/results
Authorization: Bearer {doctor-token}
Content-Type: application/json

{
  "results": {
    "WBC": "7.5 x10^9/L",
    "RBC": "4.8 x10^12/L",
    "Hemoglobin": "14.2 g/dL",
    "Hematocrit": "42%",
    "Platelets": "250 x10^9/L"
  },
  "findings": "All blood parameters are within normal reference ranges",
  "interpretation": "Normal complete blood count. No signs of anemia or infection.",
  "normalRange": "WBC: 4-11, RBC: 4.5-5.5, Hemoglobin: 13-17, Platelets: 150-400",
  "attachments": []
}
```

Expected:
- `status`: Automatically changed to "completed"
- `reportedAt`: Set to current timestamp

### Get Patient Lab Tests
```bash
GET http://localhost:5000/api/lab-tests/patient/{patient-id}
Authorization: Bearer {any-user-token}
```

---

## 5. Reports & Analytics

### Financial Report
```bash
GET http://localhost:5000/api/reports/financial?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer {admin-token}
```

Response includes:
- Total revenue, paid, pending amounts
- Invoice count
- Breakdown by payment status
- Service-wise revenue (consultation, medicine, lab, etc.)

### Operational Report
```bash
GET http://localhost:5000/api/reports/operational?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer {admin-token}
```

Response includes:
- Appointment statistics and completion rate
- Patient statistics (total, new)
- Prescription statistics and dispensing rate
- Lab test statistics and completion rate

### Inventory Report
```bash
GET http://localhost:5000/api/reports/inventory?lowStockOnly=true
Authorization: Bearer {admin-token}
```

Response includes:
- Total medicines count
- Low stock alerts
- Out of stock count
- Total inventory value
- Category-wise breakdown
- List of low stock items

### Dashboard Summary
```bash
GET http://localhost:5000/api/reports/dashboard
Authorization: Bearer {admin-token}
```

Response includes:
- Today's appointments (total, completed, completion rate)
- Total patients
- Low stock alerts
- Today's revenue
- Pending invoices count

---

## 6. Audit Logs Verification

### Check Audit Logs in Database
```sql
SELECT * FROM audit_logs ORDER BY "createdAt" DESC LIMIT 10;
```

You should see logs for:
- All API calls you made
- User ID, action, resource, endpoint
- IP address, user agent
- Request body (sanitized)
- Response status
- Severity level

### Verify Sensitive Data Excluded
Check that logs do NOT contain:
- Passwords
- Access tokens
- Refresh tokens

---

## 7. Advanced Testing Scenarios

### Test Double-Booking Prevention
```bash
# Try to book the same time slot twice simultaneously

# Request 1
POST http://localhost:5000/api/appointments
{
  "patientId": "{patient1-id}",
  "doctorId": "{doctor-id}",
  "appointmentDate": "2026-02-10",
  "appointmentTime": "10:00:00",
  "type": "consultation"
}

# Request 2 (send immediately after Request 1)
POST http://localhost:5000/api/appointments
{
  "patientId": "{patient2-id}",
  "doctorId": "{doctor-id}",
  "appointmentDate": "2026-02-10",
  "appointmentTime": "10:00:00",
  "type": "consultation"
}
```

Expected: One succeeds, one fails with "Time slot already booked"

### Test Inventory Auto-Deduction
```bash
# 1. Check medicine stock
GET http://localhost:5000/api/medicines/{medicine-id}
# Note the current stock value

# 2. Create prescription with that medicine
POST http://localhost:5000/api/prescriptions
{
  "appointmentId": "{appt-id}",
  "patientId": "{patient-id}",
  "diagnosis": "Common Cold",
  "medications": [
    {
      "medicineId": "{medicine-id}",
      "medicineName": "Paracetamol",
      "quantity": 10,
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days"
    }
  ]
}

# 3. Dispense prescription
POST http://localhost:5000/api/prescriptions/{prescription-id}/dispense
Authorization: Bearer {receptionist-token}

# 4. Check medicine stock again
GET http://localhost:5000/api/medicines/{medicine-id}
# Stock should be reduced by 10
```

### Test Insufficient Stock Handling
```bash
# Try to dispense prescription with quantity > available stock
POST http://localhost:5000/api/prescriptions/{prescription-id}/dispense
Authorization: Bearer {receptionist-token}
```

Expected: Error "Insufficient stock for {medicine-name}"

### Test Payment Status Workflow
```bash
# Create invoice with total 3000
POST http://localhost:5000/api/invoices
{..., totalAmount: 3000}

# Pay 1000 (partial)
POST /api/invoices/{id}/payment
{"amount": 1000, "paymentMethod": "cash"}
# Status should be "partial", balanceDue: 2000

# Pay 1000 more (still partial)
POST /api/invoices/{id}/payment
{"amount": 1000, "paymentMethod": "card"}
# Status should be "partial", balanceDue: 1000

# Pay final 1000 (complete)
POST /api/invoices/{id}/payment
{"amount": 1000, "paymentMethod": "cash"}
# Status should be "paid", balanceDue: 0, paidAt set
```

---

## 8. RBAC Testing

### Test Unauthorized Access
```bash
# Try to create staff as non-admin
POST http://localhost:5000/api/staff
Authorization: Bearer {doctor-token}
# Expected: 403 Forbidden

# Try to view financial report as non-admin
GET http://localhost:5000/api/reports/financial
Authorization: Bearer {receptionist-token}
# Expected: 403 Forbidden

# Try to order lab test as non-doctor
POST http://localhost:5000/api/lab-tests
Authorization: Bearer {receptionist-token}
# Expected: 403 Forbidden
```

### Test Patient Access Control
```bash
# Patient A tries to view Patient B's invoices
GET http://localhost:5000/api/invoices/patient/{patientB-id}
Authorization: Bearer {patientA-token}
# Expected: 403 Unauthorized

# Patient tries to view their own invoices
GET http://localhost:5000/api/invoices/patient/{their-patient-id}
Authorization: Bearer {patient-token}
# Expected: 200 OK with data
```

---

## Quick Error Testing

### Test Validation Errors
```bash
# Missing required fields
POST http://localhost:5000/api/staff
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "email": "incomplete@hospital.com"
  // Missing password, firstName, lastName, role
}
# Expected: 400 Bad Request with validation errors

# Invalid role
POST http://localhost:5000/api/staff
{
  "email": "test@hospital.com",
  "password": "test123",
  "firstName": "Test",
  "lastName": "User",
  "role": "invalid-role"
}
# Expected: 400 Bad Request

# Doctor without specialization
POST http://localhost:5000/api/staff
{
  "email": "doctor@hospital.com",
  "password": "doctor123",
  "firstName": "Dr",
  "lastName": "Test",
  "role": "doctor"
  // Missing specialization and licenseNumber
}
# Expected: 400 Bad Request
```

---

## Monitoring & Verification

### Check Database Tables
Connect to your database and verify:

```sql
-- Check lab_tests table exists
SELECT * FROM lab_tests LIMIT 5;

-- Check audit_logs table exists
SELECT * FROM audit_logs ORDER BY "createdAt" DESC LIMIT 10;

-- Check invoice fields updated
SELECT "invoiceNumber", "totalAmount", "amountPaid", "balanceDue", "paymentStatus" 
FROM invoices LIMIT 5;

-- Check departments association
SELECT d.name, u."firstName", u."lastName" 
FROM departments d 
LEFT JOIN users u ON d."headOfDepartment" = u.id;
```

### Check API Routes Registered
```bash
# Test health check still works
GET http://localhost:5000/api/health

# Should return all routes available
```

### Verify Audit Logging Active
```bash
# Make any API call
GET http://localhost:5000/api/patients

# Check audit_logs table
SELECT action, resource, endpoint, "userId", "responseStatus" 
FROM audit_logs 
WHERE endpoint LIKE '%/patients%' 
ORDER BY "createdAt" DESC LIMIT 1;
```

Should show the GET request logged.

---

## Expected Database Schema

After migration, you should have these tables:
1. `users`
2. `patients`
3. `doctors`
4. `departments`
5. `appointments`
6. `prescriptions`
7. `medicines`
8. `invoices` (with updated columns)
9. `lab_tests` ⭐ NEW
10. `audit_logs` ⭐ NEW

---

## Troubleshooting

### Migration Issues
If migration fails:
```bash
# Check database connection
npm run db:migrate

# If needed, drop all tables and re-run
# (WARNING: This deletes all data)
```

### Route Not Found
If getting 404:
- Verify server restarted after adding new routes
- Check [routes/index.js](e:\ongoing projects\hospital management app\backend\src\routes\index.js) includes new routes
- Check route file exports correctly

### Validation Errors
If getting unexpected validation errors:
- Check request body matches schema in validators
- Verify Content-Type: application/json header
- Check field types (string vs number)

### Authorization Errors
If getting 403:
- Verify role in database matches expected
- Check token is valid (not expired)
- Verify user has correct role for endpoint

---

## Success Criteria

✅ **Your system is working correctly if:**

1. Staff Management
   - Can create doctor with all fields
   - Can list all staff as admin
   - Public can view doctors list
   - Cannot create staff as non-admin

2. Departments
   - Can create and list departments
   - Can assign head of department
   - Can view department doctors

3. Billing
   - Invoice created with auto-number
   - Totals calculated automatically
   - Partial payments update status correctly
   - Full payment sets status to "paid"

4. Lab Tests
   - Tests ordered with auto-number
   - Status workflow works
   - Results can be added
   - Patient can view their tests

5. Reports
   - All report endpoints return data
   - Date filtering works
   - Dashboard shows today's stats

6. Audit Logs
   - All API calls logged in database
   - User ID captured
   - Passwords excluded from logs

7. RBAC
   - Unauthorized roles get 403
   - Patients can only view own records
   - Admins have full access

---

## Next Steps

After successful testing:
1. ✅ Create test user accounts for each role
2. ✅ Import real data if available
3. ✅ Set up monitoring
4. ✅ Configure automated backups
5. ✅ Deploy to production

---

**Happy Testing! 🎉**

For detailed API documentation, see [NEW_FEATURES_API.md](e:\ongoing projects\hospital management app\NEW_FEATURES_API.md)
