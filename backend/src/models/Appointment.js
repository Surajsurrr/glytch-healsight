const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
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
  
  dateTime: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number,
    default: 30 // minutes
  },
  
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    required: true
  },
  
  reason: {
    type: String,
    required: true
  },
  
  symptoms: [String],
  
  notes: String,
  
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  cancelReason: String,
  
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  reminderSentAt: Date,
  
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit'
  },
  
  // Medical details after appointment
  diagnosis: String,
  
  prescriptions: [{
    medicationName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  
  // Lab reports and documents
  reports: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    description: String
  }],
  
  // Video call details
  videoCallRoomId: String,
  videoCallLink: String,
  
  cancelledAt: Date,
  completedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate appointmentId
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ dateTime: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
