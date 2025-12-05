const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Get prescriptions
router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get prescriptions endpoint' });
});

// Get single prescription
router.get('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get single prescription endpoint' });
});

// Create prescription
router.post('/', protect, authorize('doctor'), (req, res) => {
  res.status(201).json({ success: true, message: 'Create prescription endpoint' });
});

// Update prescription
router.put('/:id', protect, authorize('doctor'), (req, res) => {
  res.status(200).json({ success: true, message: 'Update prescription endpoint' });
});

module.exports = router;
