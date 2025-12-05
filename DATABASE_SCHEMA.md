# Glytch Medical Platform - MongoDB Schema Design

## Collections Overview
1. users
2. patients
3. appointments
4. visits
5. prescriptions
6. medicalRecords
7. notifications
8. auditLogs

---

## 1. users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'doctor', 'patient'], required),
  
  // Personal Info
  firstName: String (required),
  lastName: String (required),
  phone: String,
  dateOfBirth: Date,
  gender: String (enum: ['male', 'female', 'other']),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Profile
  profilePicture: String (URL),
  
  // Doctor-specific fields
  specialization: String, // Only for doctors
  licenseNumber: String, // Only for doctors
  department: String, // Only for doctors
  qualifications: [String], // Only for doctors
  consultationFee: Number, // Only for doctors
  availability: [{
    day: String (enum: ['Monday', 'Tuesday', ...]),
    startTime: String, // "09:00"
    endTime: String, // "17:00"
    isAvailable: Boolean
  }],
  
  // Patient-specific fields
  bloodGroup: String, // Only for patients
  allergies: [String], // Only for patients
  emergencyContact: { // Only for patients
    name: String,
    relationship: String,
    phone: String
  },
  
  // Auth tokens
  refreshTokens: [String],
  
  // Status
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ isActive: 1 })
```

---

## 2. patients Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users', required), // Link to user account
  
  // Patient Details
  patientId: String (unique, auto-generated: "PAT-00001"),
  
  // Medical History
  medicalHistory: {
    chronicConditions: [String],
    pastSurgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      notes: String
    }],
    familyHistory: [String],
    currentMedications: [String],
    immunizations: [{
      vaccine: String,
      date: Date,
      nextDue: Date
    }]
  },
  
  // Insurance (optional)
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    validUntil: Date
  },
  
  // Vitals (latest)
  latestVitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    recordedAt: Date
  },
  
  // Stats
  totalVisits: Number (default: 0),
  lastVisitDate: Date,
  
  // Status
  status: String (enum: ['active', 'inactive', 'deceased'], default: 'active'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.patients.createIndex({ userId: 1 }, { unique: true })
db.patients.createIndex({ patientId: 1 }, { unique: true })
db.patients.createIndex({ status: 1 })
```

---

## 3. appointments Collection

```javascript
{
  _id: ObjectId,
  appointmentId: String (unique, auto-generated: "APT-00001"),
  
  // Parties
  patientId: ObjectId (ref: 'patients', required),
  doctorId: ObjectId (ref: 'users', required),
  
  // Scheduling
  dateTime: Date (required),
  duration: Number (default: 30), // minutes
  
  // Details
  type: String (enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'], required),
  reason: String (required),
  symptoms: [String],
  notes: String,
  
  // Status
  status: String (enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'], default: 'scheduled'),
  cancelReason: String,
  
  // Notifications
  reminderSent: Boolean (default: false),
  reminderSentAt: Date,
  
  // Visit linking
  visitId: ObjectId (ref: 'visits'), // Created after appointment completion
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  cancelledAt: Date,
  completedAt: Date
}

// Indexes
db.appointments.createIndex({ appointmentId: 1 }, { unique: true })
db.appointments.createIndex({ patientId: 1 })
db.appointments.createIndex({ doctorId: 1 })
db.appointments.createIndex({ dateTime: 1 })
db.appointments.createIndex({ status: 1 })
db.appointments.createIndex({ dateTime: 1, status: 1 })
```

---

## 4. visits Collection

```javascript
{
  _id: ObjectId,
  visitId: String (unique, auto-generated: "VIS-00001"),
  
  // Parties
  patientId: ObjectId (ref: 'patients', required),
  doctorId: ObjectId (ref: 'users', required),
  appointmentId: ObjectId (ref: 'appointments'),
  
  // Visit Date
  visitDate: Date (required),
  
  // SOAP Notes
  chiefComplaint: String (required),
  
  subjective: String, // Patient's description
  objective: String, // Doctor's observations
  assessment: String, // Diagnosis
  plan: String, // Treatment plan
  
  // Vitals
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number
  },
  
  // Diagnosis
  diagnosis: [{
    icdCode: String,
    description: String,
    type: String (enum: ['primary', 'secondary'])
  }],
  
  // Tests/Labs ordered
  testsOrdered: [{
    testName: String,
    type: String,
    urgency: String (enum: ['routine', 'urgent', 'stat']),
    notes: String
  }],
  
  // Follow-up
  followUp: {
    required: Boolean,
    date: Date,
    notes: String
  },
  
  // Documents
  attachments: [{
    fileUrl: String,
    fileName: String,
    fileType: String,
    uploadedAt: Date
  }],
  
  // Prescription
  prescriptionId: ObjectId (ref: 'prescriptions'),
  
  // Status
  status: String (enum: ['draft', 'completed', 'archived'], default: 'draft'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.visits.createIndex({ visitId: 1 }, { unique: true })
db.visits.createIndex({ patientId: 1 })
db.visits.createIndex({ doctorId: 1 })
db.visits.createIndex({ visitDate: -1 })
db.visits.createIndex({ status: 1 })
```

---

## 5. prescriptions Collection

```javascript
{
  _id: ObjectId,
  prescriptionId: String (unique, auto-generated: "PRX-00001"),
  
  // Parties
  patientId: ObjectId (ref: 'patients', required),
  doctorId: ObjectId (ref: 'users', required),
  visitId: ObjectId (ref: 'visits'),
  
  // Prescription Date
  prescribedDate: Date (required),
  validUntil: Date,
  
  // Medications
  medications: [{
    name: String (required),
    genericName: String,
    dosage: String (required), // "500mg"
    form: String, // "tablet", "syrup", "injection"
    frequency: String (required), // "Twice daily"
    duration: String (required), // "5 days"
    quantity: Number,
    instructions: String, // "Take after meals"
    refillsAllowed: Number (default: 0)
  }],
  
  // Additional Notes
  notes: String,
  warnings: [String],
  
  // Status
  status: String (enum: ['active', 'completed', 'cancelled'], default: 'active'),
  
  // Pharmacy (optional)
  pharmacyFilled: {
    pharmacyName: String,
    filledDate: Date,
    pharmacistName: String
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.prescriptions.createIndex({ prescriptionId: 1 }, { unique: true })
db.prescriptions.createIndex({ patientId: 1 })
db.prescriptions.createIndex({ doctorId: 1 })
db.prescriptions.createIndex({ status: 1 })
db.prescriptions.createIndex({ prescribedDate: -1 })
```

---

## 6. medicalRecords Collection

```javascript
{
  _id: ObjectId,
  recordId: String (unique, auto-generated: "REC-00001"),
  
  // Owner
  patientId: ObjectId (ref: 'patients', required),
  uploadedBy: ObjectId (ref: 'users', required),
  
  // Document Details
  type: String (enum: ['lab_result', 'xray', 'ct_scan', 'mri', 'ultrasound', 'report', 'prescription', 'other'], required),
  title: String (required),
  description: String,
  
  // File
  fileUrl: String (required), // S3 or GridFS URL
  fileName: String (required),
  fileSize: Number, // bytes
  mimeType: String,
  
  // Metadata
  recordDate: Date (required), // Date of the test/scan
  
  // Associated entities
  visitId: ObjectId (ref: 'visits'),
  doctorId: ObjectId (ref: 'users'),
  
  // Access control
  isConfidential: Boolean (default: false),
  sharedWith: [ObjectId], // Array of user IDs with access
  
  // Status
  status: String (enum: ['active', 'archived', 'deleted'], default: 'active'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.medicalRecords.createIndex({ recordId: 1 }, { unique: true })
db.medicalRecords.createIndex({ patientId: 1 })
db.medicalRecords.createIndex({ type: 1 })
db.medicalRecords.createIndex({ status: 1 })
db.medicalRecords.createIndex({ recordDate: -1 })
```

---

## 7. notifications Collection

```javascript
{
  _id: ObjectId,
  
  // Recipient
  userId: ObjectId (ref: 'users', required),
  
  // Content
  type: String (enum: ['appointment_reminder', 'appointment_confirmation', 'prescription_ready', 'test_result', 'message', 'system'], required),
  title: String (required),
  message: String (required),
  
  // Action link (optional)
  actionUrl: String,
  actionText: String,
  
  // Related entities
  relatedId: ObjectId, // Can be appointment, prescription, etc.
  relatedModel: String, // 'Appointment', 'Prescription', etc.
  
  // Status
  isRead: Boolean (default: false),
  readAt: Date,
  
  // Priority
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  
  // Delivery
  channels: [String], // ['in-app', 'email', 'sms']
  emailSent: Boolean (default: false),
  smsSent: Boolean (default: false),
  
  // Timestamps
  createdAt: Date,
  expiresAt: Date
}

// Indexes
db.notifications.createIndex({ userId: 1, isRead: 1 })
db.notifications.createIndex({ createdAt: -1 })
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index
```

---

## 8. auditLogs Collection

```javascript
{
  _id: ObjectId,
  
  // Actor
  userId: ObjectId (ref: 'users', required),
  userEmail: String,
  userRole: String,
  
  // Action
  action: String (required), // "CREATE", "UPDATE", "DELETE", "VIEW", "LOGIN", "LOGOUT"
  resource: String (required), // "Patient", "Appointment", "Prescription"
  resourceId: ObjectId,
  
  // Details
  description: String (required),
  changes: Object, // For updates, store before/after
  
  // Request metadata
  ipAddress: String,
  userAgent: String,
  
  // Result
  status: String (enum: ['success', 'failure'], required),
  errorMessage: String,
  
  // Compliance
  isSecurityEvent: Boolean (default: false),
  severity: String (enum: ['info', 'warning', 'critical'], default: 'info'),
  
  // Timestamp
  timestamp: Date (required, default: Date.now)
}

// Indexes
db.auditLogs.createIndex({ userId: 1, timestamp: -1 })
db.auditLogs.createIndex({ action: 1 })
db.auditLogs.createIndex({ resource: 1 })
db.auditLogs.createIndex({ timestamp: -1 })
db.auditLogs.createIndex({ isSecurityEvent: 1 })
db.auditLogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 }) // Keep for 1 year
```

---

## Relationships Summary

```
users (1) ----< (many) appointments
users (1) ----< (many) visits
users (1) ----< (many) prescriptions
users (1) ----< (many) medicalRecords
users (1) ----< (many) notifications
users (1) ----< (many) auditLogs

patients (1) ---- (1) users
patients (1) ----< (many) appointments
patients (1) ----< (many) visits
patients (1) ----< (many) prescriptions
patients (1) ----< (many) medicalRecords

appointments (1) ---- (0-1) visits
visits (1) ---- (0-1) prescriptions
```

---

## Data Retention Policy

- **Active Records**: Unlimited retention
- **Deleted Records**: Soft delete (status = 'deleted'), hard delete after 90 days
- **Audit Logs**: Retain for 1 year (TTL index)
- **Notifications**: Auto-expire after 90 days
- **Archived Medical Records**: Retain for 7 years (compliance)
