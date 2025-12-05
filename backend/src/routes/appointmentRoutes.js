const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Get appointments
router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get appointments endpoint' });
});

// Get single appointment
router.get('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get single appointment endpoint' });
});

// Book appointment
router.post('/', protect, (req, res) => {
  res.status(201).json({ success: true, message: 'Book appointment endpoint' });
});

// Update appointment
router.put('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Update appointment endpoint' });
});

// Cancel appointment
router.delete('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Cancel appointment endpoint' });
});

module.exports = router;
