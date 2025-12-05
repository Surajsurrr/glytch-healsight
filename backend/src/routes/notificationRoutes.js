const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get user notifications
router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get notifications endpoint' });
});

// Mark notification as read
router.put('/:id/read', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Mark notification as read endpoint' });
});

// Send notification (Admin only)
router.post('/send', protect, (req, res) => {
  res.status(201).json({ success: true, message: 'Send notification endpoint' });
});

module.exports = router;
