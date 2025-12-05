const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Get medical records
router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get medical records endpoint' });
});

// Get single record
router.get('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get single medical record endpoint' });
});

// Upload medical record
router.post('/upload', protect, (req, res) => {
  res.status(201).json({ success: true, message: 'Upload medical record endpoint - Multer integration pending' });
});

// Delete record
router.delete('/:id', protect, authorize('admin', 'doctor'), (req, res) => {
  res.status(200).json({ success: true, message: 'Delete medical record endpoint' });
});

module.exports = router;
