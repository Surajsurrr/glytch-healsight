const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['appointment_reminder', 'appointment_confirmation', 'prescription_ready', 'test_result', 'message', 'system'],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  actionUrl: String,
  actionText: String,
  
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: String,
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: Date,
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  channels: {
    type: [String],
    default: ['in-app']
  },
  
  emailSent: {
    type: Boolean,
    default: false
  },
  
  smsSent: {
    type: Boolean,
    default: false
  },
  
  expiresAt: Date
}, {
  timestamps: true
});

// TTL index for auto-deletion
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
