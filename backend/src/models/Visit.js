const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  visitId: {
    type: String,
    unique: true,
    required: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  chiefComplaint: {
    type: String,
    required: true
  },
  
  // SOAP Notes
  subjective: String,
  objective: String,
  assessment: String,
  plan: String,
  
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
    type: {
      type: String,
      enum: ['primary', 'secondary']
    }
  }],
  
  // Tests/Labs ordered
  testsOrdered: [{
    testName: String,
    type: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat']
    },
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
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  
  status: {
    type: String,
    enum: ['draft', 'completed', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate visitId
visitSchema.pre('save', async function(next) {
  if (!this.visitId) {
    const count = await mongoose.model('Visit').countDocuments();
    this.visitId = `VIS-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate BMI if height and weight provided
visitSchema.pre('save', function(next) {
  if (this.vitals && this.vitals.weight && this.vitals.height) {
    const heightInMeters = this.vitals.height / 100;
    this.vitals.bmi = parseFloat((this.vitals.weight / (heightInMeters * heightInMeters)).toFixed(2));
  }
  next();
});

// Indexes
visitSchema.index({ visitId: 1 });
visitSchema.index({ patientId: 1 });
visitSchema.index({ doctorId: 1 });
visitSchema.index({ visitDate: -1 });
visitSchema.index({ status: 1 });

module.exports = mongoose.model('Visit', visitSchema);
