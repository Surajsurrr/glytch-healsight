const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
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
  
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit'
  },
  
  prescribedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  validUntil: Date,
  
  medications: [{
    name: {
      type: String,
      required: true
    },
    genericName: String,
    dosage: {
      type: String,
      required: true
    },
    form: String,
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    quantity: Number,
    instructions: String,
    refillsAllowed: {
      type: Number,
      default: 0
    }
  }],
  
  notes: String,
  warnings: [String],
  
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  
  pharmacyFilled: {
    pharmacyName: String,
    filledDate: Date,
    pharmacistName: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate prescriptionId
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `PRX-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
prescriptionSchema.index({ prescriptionId: 1 });
prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ prescribedDate: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
