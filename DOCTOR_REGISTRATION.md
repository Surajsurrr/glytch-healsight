# Doctor Registration with Document Verification

## Overview
Doctors registering on the Glytch Medical Platform must now upload verification documents during signup. This ensures only qualified medical professionals can access doctor-specific features.

## Required Documents

When signing up as a doctor, users must provide:

1. **Qualification Certificate** (Required)
   - Medical degree certificate
   - Formats: PDF, JPG, JPEG, PNG
   - Max size: 5MB

2. **Specialization Certificate** (Required)
   - Certificate proving specialization (e.g., Cardiology, Neurology)
   - Formats: PDF, JPG, JPEG, PNG
   - Max size: 5MB

3. **Experience Proof** (Required)
   - Employment letters, practice certificates, or experience documents
   - Formats: PDF, JPG, JPEG, PNG
   - Max size: 5MB

## Required Fields

- **Email** (required)
- **Password** (required, min 8 characters)
- **First Name** (required)
- **Last Name** (required)
- **Specialization** (required) - e.g., "Cardiologist", "Neurologist"
- **License Number** (required) - Medical council registration number
- **Years of Experience** (optional)
- **Phone** (optional)
- **Date of Birth** (optional)
- **Gender** (optional)

## Verification Process

1. **Registration**: Doctor fills the form and uploads all three required documents
2. **Pending Status**: Account is created with `verificationStatus: 'pending'`
3. **Admin Review**: Admin views documents in the verification dashboard
4. **Approval/Rejection**: Admin approves or rejects the application
5. **Access Granted**: Once approved, doctor can access full platform features

## Technical Implementation

### Frontend (React)
- **Component**: `frontend/src/pages/auth/Register.jsx`
- File upload buttons appear when role="doctor"
- FormData submission for multipart/form-data
- Client-side validation ensures all documents are uploaded

### Backend (Node.js/Express)
- **Controller**: `backend/src/controllers/authController.js`
- **Routes**: `backend/src/routes/authRoutes.js`
- Uses Multer middleware for file uploads
- Files stored in `backend/uploads/doctor-verification/`
- Document metadata saved in `User.verificationDocuments` array

### Database Schema
```javascript
verificationDocuments: [{
  documentType: String, // 'degree', 'specialization', 'experience'
  fileName: String,
  fileUrl: String,
  uploadedAt: Date
}],
verificationStatus: String, // 'pending', 'approved', 'rejected'
verificationNotes: String,
verifiedBy: ObjectId,
verifiedAt: Date,
rejectionReason: String
```

## API Endpoint

### POST /api/v1/auth/register
**Content-Type**: multipart/form-data

**Form Fields**:
- email, password, firstName, lastName, role, specialization, licenseNumber, yearOfExperience, phone, dateOfBirth, gender

**File Fields**:
- qualificationCertificate (file)
- specializationCertificate (file)
- experienceProof (file)

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "doctor@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "doctor",
      "specialization": "Cardiologist",
      "verificationStatus": "pending",
      "verificationDocuments": [...]
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Admin Verification Dashboard

Admins can review pending doctor verifications at:
- **Route**: `/admin/doctors` or Admin Dashboard
- **Features**:
  - View uploaded documents
  - Approve with verification notes
  - Reject with rejection reason
  - Email notifications (future enhancement)

## Error Handling

### Frontend Validation
- All three documents must be uploaded before submission
- File size must be ≤ 5MB
- Only PDF, JPG, JPEG, PNG allowed

### Backend Validation
- Joi schema validates required fields
- Multer validates file types and sizes
- Returns appropriate error messages

## Security Considerations

- Files stored in secure backend directory (not publicly accessible)
- Only admins can view verification documents
- Doctor accounts remain pending until admin approval
- Audit logs track all registration and verification actions

## Future Enhancements

1. Email notifications for verification status changes
2. AWS S3 storage for scalability
3. Automatic OCR/AI validation of documents
4. Expiry tracking for licenses and certificates
5. Re-verification reminders
