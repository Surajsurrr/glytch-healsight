const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllMedicalRecords,
  aiCategorizeRecord,
  batchAICategorize,
  autoCategorizeAll,
  suggestCategory,
  getCategories,
  getAIStats
} = require('../controllers/medicalRecordController');

// Admin routes for medical records management
router.get('/admin/records', protect, authorize('admin'), getAllMedicalRecords);
router.get('/admin/records/categories', protect, authorize('admin'), getCategories);
router.get('/admin/records/stats', protect, authorize('admin'), getAIStats);
router.post('/admin/records/suggest-category', protect, authorize('admin'), suggestCategory);
router.post('/admin/records/:id/ai-categorize', protect, authorize('admin'), aiCategorizeRecord);
router.post('/admin/records/batch-categorize', protect, authorize('admin'), batchAICategorize);
router.post('/admin/records/auto-categorize-all', protect, authorize('admin'), autoCategorizeAll);

// Get medical records (patient/doctor access)
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
