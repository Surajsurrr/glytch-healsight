const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    unique: true,
    required: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['lab_result', 'xray', 'ct_scan', 'mri', 'ultrasound', 'report', 'prescription', 'other'],
    required: true
  },
  
  // AI-powered categorization fields
  aiCategory: {
    type: String,
    enum: [
      'Blood Test',
      'Lab Report', 
      'X-Ray',
      'CT Scan',
      'MRI Scan',
      'Ultrasound',
      'ECG/EKG',
      'Pathology Report',
      'Biopsy Report',
      'Diagnosis Report',
      'Prescription',
      'Surgical Report',
      'Discharge Summary',
      'Vaccination Record',
      'Allergy Report',
      'Test Report',
      'Scan Report',
      'Medical Certificate',
      'Other'
    ],
    default: 'Other'
  },
  
  aiCategoryConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  
  aiDetectedKeywords: [String],
  
  isAICategorized: {
    type: Boolean,
    default: false
  },
  
  manualCategoryOverride: {
    type: Boolean,
    default: false
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  fileUrl: {
    type: String,
    required: true
  },
  
  fileName: {
    type: String,
    required: true
  },
  
  fileSize: Number,
  mimeType: String,
  
  recordDate: {
    type: Date,
    required: true
  },
  
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit'
  },
  
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isConfidential: {
    type: Boolean,
    default: false
  },
  
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate recordId
medicalRecordSchema.pre('save', async function(next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    this.recordId = `REC-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
medicalRecordSchema.index({ recordId: 1 });
medicalRecordSchema.index({ patientId: 1 });
medicalRecordSchema.index({ type: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ recordDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
