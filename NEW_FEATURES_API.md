# Added Features - API Documentation

This document describes all the newly implemented endpoints to make the Hospital Management System fully spec-compliant.

## Table of Contents
1. [Staff Management](#staff-management)
2. [Department Management](#department-management)
3. [Billing & Invoicing](#billing--invoicing)
4. [Lab Tests](#lab-tests)
5. [Reports & Analytics](#reports--analytics)
6. [Audit Logging](#audit-logging)

---

## Staff Management

### Create Staff Member
**Endpoint:** `POST /api/staff`  
**Access:** Admin only  
**Description:** Create a new staff member (doctor, receptionist, or admin)

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "doctor",
  "phone": "+1234567890",
  "address": "123 Medical St",
  "dateOfBirth": "1980-01-15",
  "gender": "male",
  
  // Doctor-specific fields (required if role = "doctor")
  "specialization": "Cardiology",
  "licenseNumber": "MD12345",
  "departmentId": "uuid-here",
  "qualifications": ["MBBS", "MD Cardiology"],
  "experience": 10,
  "consultationFee": 1500,
  "availability": {
    "monday": ["09:00-17:00"],
    "tuesday": ["09:00-17:00"],
    "wednesday": ["09:00-17:00"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Staff member created successfully",
  "data": {
    "id": "uuid",
    "email": "doctor@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "doctor",
    "doctorProfile": {
      "specialization": "Cardiology",
      "licenseNumber": "MD12345",
      "consultationFee": 1500
    }
  }
}
```

### Get All Staff
**Endpoint:** `GET /api/staff`  
**Access:** Admin only  
**Query Parameters:** 
- `role` - Filter by role (doctor, receptionist, admin)
- `isActive` - Filter by active status (true/false)
- `departmentId` - Filter doctors by department

### Get All Doctors
**Endpoint:** `GET /api/staff/doctors`  
**Access:** All authenticated users  
**Query Parameters:**
- `departmentId` - Filter by department
- `specialization` - Filter by specialization
- `isAvailable` - Filter by availability

### Get Staff by ID
**Endpoint:** `GET /api/staff/:id`  
**Access:** Admin only

### Update Staff
**Endpoint:** `PUT /api/staff/:id`  
**Access:** Admin only

### Delete Staff (Deactivate)
**Endpoint:** `DELETE /api/staff/:id`  
**Access:** Admin only

---

## Department Management

### Create Department
**Endpoint:** `POST /api/departments`  
**Access:** Admin only

**Request Body:**
```json
{
  "name": "Cardiology",
  "description": "Heart and cardiovascular care",
  "headOfDepartment": "doctor-uuid"
}
```

### Get All Departments
**Endpoint:** `GET /api/departments`  
**Access:** All authenticated users  
**Query Parameters:**
- `isActive` - Filter by active status

### Get Department by ID
**Endpoint:** `GET /api/departments/:id`  
**Access:** All authenticated users

### Get Department Doctors
**Endpoint:** `GET /api/departments/:id/doctors`  
**Access:** All authenticated users

### Update Department
**Endpoint:** `PUT /api/departments/:id`  
**Access:** Admin only

### Delete Department
**Endpoint:** `DELETE /api/departments/:id`  
**Access:** Admin only  
**Note:** Cannot delete if department has assigned doctors

---

## Billing & Invoicing

### Create Invoice
**Endpoint:** `POST /api/invoices`  
**Access:** Admin, Receptionist

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "appointmentId": "appointment-uuid",
  "items": [
    {
      "description": "X-Ray Chest",
      "quantity": 1,
      "unitPrice": 500,
      "total": 500
    }
  ],
  "consultationFee": 1500,
  "medicineCharges": 250,
  "labCharges": 800,
  "roomCharges": 0,
  "otherCharges": 0,
  "discount": 50,
  "notes": "Follow-up in 2 weeks"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": "invoice-uuid",
    "invoiceNumber": "INV-20260208-0001",
    "patientId": "patient-uuid",
    "subtotal": 2550,
    "taxAmount": 0,
    "discount": 50,
    "totalAmount": 2500,
    "amountPaid": 0,
    "balanceDue": 2500,
    "paymentStatus": "pending"
  }
}
```

### Get All Invoices
**Endpoint:** `GET /api/invoices`  
**Access:** Admin, Receptionist  
**Query Parameters:**
- `patientId` - Filter by patient
- `paymentStatus` - Filter by status (pending, partial, paid, cancelled)
- `startDate` - Filter by date range
- `endDate` - Filter by date range

### Get Invoice by ID
**Endpoint:** `GET /api/invoices/:id`  
**Access:** All authenticated users (patients can only view their own)

### Get Patient Invoices
**Endpoint:** `GET /api/invoices/patient/:patientId`  
**Access:** All authenticated users (patients can only view their own)

### Update Invoice
**Endpoint:** `PUT /api/invoices/:id`  
**Access:** Admin, Receptionist  
**Note:** Cannot update paid invoices

### Process Payment
**Endpoint:** `POST /api/invoices/:id/payment`  
**Access:** Admin, Receptionist

**Request Body:**
```json
{
  "amount": 2500,
  "paymentMethod": "cash",
  "transactionId": "TXN123456"
}
```

### Cancel Invoice
**Endpoint:** `POST /api/invoices/:id/cancel`  
**Access:** Admin only

---

## Lab Tests

### Create Lab Test Order
**Endpoint:** `POST /api/lab-tests`  
**Access:** Doctor only

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "testName": "Complete Blood Count",
  "testType": "blood",
  "category": "Hematology",
  "priority": "routine",
  "instructions": "Fasting required",
  "cost": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lab test ordered successfully",
  "data": {
    "id": "labtest-uuid",
    "testNumber": "LAB-20260208-0001",
    "status": "ordered",
    "testName": "Complete Blood Count",
    "testType": "blood",
    "priority": "routine"
  }
}
```

### Get All Lab Tests
**Endpoint:** `GET /api/lab-tests`  
**Access:** Admin, Doctor, Receptionist  
**Query Parameters:**
- `patientId` - Filter by patient
- `doctorId` - Filter by doctor
- `status` - Filter by status
- `testType` - Filter by type
- `priority` - Filter by priority
- `startDate` - Date range filter
- `endDate` - Date range filter

### Get Lab Test by ID
**Endpoint:** `GET /api/lab-tests/:id`  
**Access:** All authenticated users (patients can only view their own)

### Get Patient Lab Tests
**Endpoint:** `GET /api/lab-tests/patient/:patientId`  
**Access:** All authenticated users (patients can only view their own)

### Update Lab Test Status
**Endpoint:** `PUT /api/lab-tests/:id/status`  
**Access:** Admin, Receptionist

**Request Body:**
```json
{
  "status": "sample-collected",
  "performedBy": "Lab Tech Name",
  "sampleCollectedAt": "2026-02-08T10:30:00Z"
}
```

### Add Lab Test Results
**Endpoint:** `POST /api/lab-tests/:id/results`  
**Access:** Admin, Doctor

**Request Body:**
```json
{
  "results": {
    "WBC": "7.5 x10^9/L",
    "RBC": "4.8 x10^12/L",
    "Hemoglobin": "14.2 g/dL",
    "Platelets": "250 x10^9/L"
  },
  "findings": "All values within normal range",
  "interpretation": "Normal complete blood count",
  "normalRange": "WBC: 4-11, RBC: 4.5-5.5, Hb: 13-17, Platelets: 150-400",
  "attachments": ["report-url-1.pdf"]
}
```

### Cancel Lab Test
**Endpoint:** `POST /api/lab-tests/:id/cancel`  
**Access:** Admin, Doctor

---

## Reports & Analytics

### Financial Report
**Endpoint:** `GET /api/reports/financial`  
**Access:** Admin only  
**Query Parameters:**
- `startDate` - Start date for report
- `endDate` - End date for report

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 150000,
      "totalPaid": 120000,
      "totalPending": 30000,
      "invoiceCount": 85
    },
    "byStatus": [
      {"paymentStatus": "paid", "count": 65, "amount": 120000},
      {"paymentStatus": "pending", "count": 15, "amount": 25000},
      {"paymentStatus": "partial", "count": 5, "amount": 5000}
    ],
    "serviceBreakdown": {
      "consultationRevenue": 75000,
      "medicineRevenue": 35000,
      "labRevenue": 25000,
      "roomRevenue": 10000,
      "otherRevenue": 5000
    }
  }
}
```

### Operational Report
**Endpoint:** `GET /api/reports/operational`  
**Access:** Admin only  
**Query Parameters:**
- `startDate` - Start date for report
- `endDate` - End date for report

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": {
      "total": 250,
      "completed": 215,
      "completionRate": "86.00",
      "byStatus": [...]
    },
    "patients": {
      "total": 450,
      "new": 35
    },
    "prescriptions": {
      "total": 200,
      "dispensed": 180,
      "dispensingRate": "90.00"
    },
    "labTests": {
      "total": 120,
      "completed": 100,
      "completionRate": "83.33"
    }
  }
}
```

### Inventory Report
**Endpoint:** `GET /api/reports/inventory`  
**Access:** Admin, Receptionist  
**Query Parameters:**
- `lowStockOnly` - Show only low stock items (true/false)

### Dashboard Summary
**Endpoint:** `GET /api/reports/dashboard`  
**Access:** Admin  
**Description:** Get today's statistics for admin dashboard

---

## Audit Logging

### Automatic Audit Logging
All API requests are automatically logged with:
- User ID and role
- Action performed
- Resource accessed
- Request method and endpoint
- IP address and user agent
- Request body (sanitized - excluding passwords/tokens)
- Response status
- Timestamp

### Logged Actions Include:
- Patient record access and modifications
- Prescription creation and dispensing
- Invoice creation and payments
- Appointment booking and modifications
- Lab test orders and results
- Medicine inventory changes
- Staff and department management

### Security Features:
- Sensitive data (passwords, tokens) automatically excluded
- Severity levels assigned (low, medium, high, critical)
- Immutable logs (no updates allowed)
- Compliance with medical record keeping requirements

---

## Key Features Implemented

### ✅ Fully Spec-Compliant Features:

1. **Admin Staff Management**
   - Create, read, update, delete staff members
   - Manage doctors, receptionists, and admins
   - Department assignment for doctors
   - Availability scheduling

2. **Department Management**
   - Full CRUD operations
   - Head of department assignment
   - Doctor assignment tracking
   - Active/inactive status

3. **Billing & Invoicing**
   - Invoice generation with auto-numbering
   - Multiple charge categories (consultation, medicine, lab, room)
   - Payment processing with partial payments
   - Payment status tracking
   - Multiple payment methods

4. **Lab Test Management**
   - Test ordering by doctors
   - Sample collection tracking
   - Results entry with attachments
   - Priority levels (routine, urgent, stat)
   - Multiple test types

5. **Audit Logging**
   - Automatic logging of all medical actions
   - Compliance with healthcare regulations
   - Security event tracking
   - User activity monitoring

6. **Financial Reports**
   - Revenue analysis
   - Payment status breakdown
   - Service-wise revenue breakdown
   - Operational statistics

7. **Appointment Slot Validation**
   - Database-level locking to prevent double-booking
   - Concurrent booking prevention
   - Real-time availability checking

8. **Automated Inventory Management**
   - Automatic stock deduction when prescriptions dispensed
   - Low stock alerts
   - Stock tracking with audit trail

---

## Migration & Setup

To initialize the new features:

```bash
# Run database migration
npm run db:migrate

# Seed initial data
npm run db:seed
```

All new tables will be created:
- `lab_tests`
- `audit_logs`
- Updated `invoices` table with new fields
- Updated `departments` table with associations

---

## Security Enhancements

1. **Role-Based Access Control (RBAC)**
   - All endpoints properly protected
   - Fine-grained permissions per role
   - Resource ownership verification

2. **Audit Trail**
   - All medical actions logged
   - Tamper-proof logging
   - Compliance ready

3. **Data Validation**
   - Comprehensive Joi schemas
   - Input sanitization
   - SQL injection prevention

4. **Transaction Safety**
   - Database transactions for critical operations
   - Automatic rollback on errors
   - Stock locking for inventory
   - Appointment slot locking

---

## Testing Recommendations

Test the following scenarios:

1. **Staff Management:**
   - Create doctor with all required fields
   - Update doctor availability
   - Deactivate staff member
   - Assign head of department

2. **Billing:**
   - Create invoice for appointment
   - Process partial payment
   - Process full payment
   - Cancel unpaid invoice

3. **Lab Tests:**
   - Order lab test as doctor
   - Update status to sample-collected
   - Add results
   - View patient lab history

4. **Reports:**
   - Generate financial report with date range
   - Check dashboard summary
   - View inventory report with low stock filter

5. **Concurrent Operations:**
   - Attempt double-booking same time slot
   - Dispense prescription with insufficient stock
   - Concurrent payment processing

---

## Compliance Achievement

The system now meets:
- ✅ RBAC requirements
- ✅ Audit logging for medical records
- ✅ Billing and invoicing
- ✅ Lab test management
- ✅ Inventory tracking
- ✅ Financial reporting
- ✅ Appointment double-booking prevention
- ✅ Staff management
- ✅ Department management

**System is now 100% spec-compliant!**
