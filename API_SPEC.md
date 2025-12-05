# Glytch Medical Platform - API Specification

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.glytch-med.com/api/v1
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user (Patient/Doctor/Admin)
```json
Request:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "patient",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}

Response (201):
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "email": "user@example.com",
      "role": "patient",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST /auth/login
Login user
```json
Request:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST /auth/refresh
Refresh access token
```json
Request:
{
  "refreshToken": "refresh_token_here"
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here"
  }
}
```

### POST /auth/logout
Logout user (invalidate refresh token)

---

## Patient Endpoints

### GET /patients
Get all patients (Admin/Doctor only)
Query params: `?page=1&limit=10&search=john&status=active`

### GET /patients/:id
Get single patient details

### POST /patients
Create new patient record (Admin only)

### PUT /patients/:id
Update patient information

### DELETE /patients/:id
Soft delete patient (Admin only)

### GET /patients/:id/history
Get patient medical history

---

## Appointment Endpoints

### GET /appointments
Get appointments (filtered by user role)
Query params: `?date=2025-12-05&doctor=doctorId&status=scheduled`

### GET /appointments/:id
Get single appointment

### POST /appointments
Book new appointment
```json
Request:
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "dateTime": "2025-12-10T10:00:00Z",
  "type": "consultation",
  "reason": "Regular checkup",
  "notes": "Patient experiencing mild symptoms"
}

Response (201):
{
  "success": true,
  "data": {
    "appointment": {
      "id": "appointment_id",
      "patient": { ... },
      "doctor": { ... },
      "dateTime": "2025-12-10T10:00:00Z",
      "status": "scheduled",
      "type": "consultation"
    }
  }
}
```

### PUT /appointments/:id
Update appointment (reschedule, cancel, complete)

### DELETE /appointments/:id
Cancel appointment

---

## Visit/Consultation Endpoints

### GET /visits
Get all visits

### GET /visits/:id
Get visit details with full notes

### POST /visits
Create visit record
```json
Request:
{
  "appointmentId": "appointment_id",
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "chiefComplaint": "Headache and fever",
  "vitals": {
    "bloodPressure": "120/80",
    "heartRate": 75,
    "temperature": 98.6,
    "weight": 70,
    "height": 175
  },
  "subjective": "Patient reports headache for 3 days",
  "objective": "No visible signs of distress",
  "assessment": "Likely viral infection",
  "plan": "Rest, hydration, follow-up in 3 days"
}
```

### PUT /visits/:id
Update visit notes

---

## Prescription Endpoints

### GET /prescriptions
Get prescriptions (filtered by user)

### GET /prescriptions/:id
Get prescription details

### POST /prescriptions
Create prescription
```json
Request:
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "visitId": "visit_id",
  "medications": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "Take after meals"
    }
  ],
  "notes": "Complete the full course"
}
```

### PUT /prescriptions/:id
Update prescription

---

## Medical Records/Documents Endpoints

### GET /records
Get medical records (lab results, imaging, documents)

### GET /records/:id
Get single record

### POST /records/upload
Upload medical document/image
```
Content-Type: multipart/form-data

Fields:
- file: <binary>
- patientId: string
- type: "lab_result" | "xray" | "scan" | "report" | "other"
- title: string
- description: string
- date: ISO date
```

### DELETE /records/:id
Delete medical record

---

## Doctor Dashboard Endpoints

### GET /dashboard/doctor/stats
Get doctor's statistics
```json
Response:
{
  "success": true,
  "data": {
    "todayAppointments": 8,
    "pendingAppointments": 3,
    "totalPatients": 156,
    "thisWeekVisits": 42
  }
}
```

### GET /dashboard/doctor/today
Get today's schedule and patient queue

---

## Admin Dashboard Endpoints

### GET /dashboard/admin/stats
Get platform statistics

### GET /dashboard/admin/users
Manage all users

### GET /dashboard/admin/audit-logs
View audit logs for compliance

---

## AI Dashboard Endpoints (Placeholder)

### GET /ai/status
Check AI service status
```json
Response:
{
  "success": true,
  "data": {
    "status": "coming_soon",
    "message": "AI features are being developed by the team"
  }
}
```

### POST /ai/predict
Reserved endpoint for AI predictions (to be implemented)

### GET /ai/insights
Reserved endpoint for AI-generated insights (to be implemented)

---

## Search Endpoints

### GET /search
Global search across patients, appointments, records
Query params: `?q=search_term&type=patient|appointment|record`

---

## Notification Endpoints

### GET /notifications
Get user notifications

### PUT /notifications/:id/read
Mark notification as read

### POST /notifications/send
Send notification (Admin/System only)

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 500: Internal Server Error

---

## Rate Limiting
- 100 requests per 15 minutes per IP
- 1000 requests per hour for authenticated users

## Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```
