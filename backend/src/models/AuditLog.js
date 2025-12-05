const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  userEmail: String,
  userRole: String,
  
  action: {
    type: String,
    required: true
  },
  
  resource: {
    type: String,
    required: true
  },
  
  resourceId: mongoose.Schema.Types.ObjectId,
  
  description: {
    type: String,
    required: true
  },
  
  changes: mongoose.Schema.Types.Mixed,
  
  ipAddress: String,
  userAgent: String,
  
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  
  errorMessage: String,
  
  isSecurityEvent: {
    type: Boolean,
    default: false
  },
  
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: false
});

// TTL index - keep logs for 1 year
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ isSecurityEvent: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
