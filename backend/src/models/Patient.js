const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  patientId: {
    type: String,
    unique: true
  },
  
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
  
  // Insurance
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    validUntil: Date
  },
  
  // Latest Vitals
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
  totalVisits: {
    type: Number,
    default: 0
  },
  lastVisitDate: Date,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate patientId before saving
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual populate for user details
patientSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Indexes
patientSchema.index({ userId: 1 });
patientSchema.index({ patientId: 1 });
patientSchema.index({ status: 1 });

module.exports = mongoose.model('Patient', patientSchema);
