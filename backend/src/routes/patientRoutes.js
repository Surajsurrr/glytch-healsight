const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Get all patients (Admin/Doctor)
router.get('/', protect, authorize('admin', 'doctor'), (req, res) => {
  res.status(200).json({ success: true, message: 'Get all patients endpoint' });
});

// Get single patient
router.get('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get single patient endpoint' });
});

// Create patient
router.post('/', protect, authorize('admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Create patient endpoint' });
});

// Update patient
router.put('/:id', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Update patient endpoint' });
});

// Delete patient
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Delete patient endpoint' });
});

// Get patient medical history
router.get('/:id/history', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get patient history endpoint' });
});

module.exports = router;
