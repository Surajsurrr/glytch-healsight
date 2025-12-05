const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Get visits
router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get visits endpoint' });
});

// Get single visit
router.get('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get single visit endpoint' });
});

// Create visit
router.post('/', protect, authorize('doctor'), (req, res) => {
  res.status(201).json({ success: true, message: 'Create visit endpoint' });
});

// Update visit
router.put('/:id', protect, authorize('doctor'), (req, res) => {
  res.status(200).json({ success: true, message: 'Update visit endpoint' });
});

module.exports = router;
