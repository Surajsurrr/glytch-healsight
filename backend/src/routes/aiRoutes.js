const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getComprehensiveInsights,
  getProductAnalytics,
  getDoctorAnalytics,
  getPatientAnalytics,
  getScalabilityAnalysis,
  getBusinessAnalysis,
  getRecommendations,
  getAIStatus
} = require('../controllers/aiAnalyticsController');

// AI Analytics Routes
router.get('/status', protect, getAIStatus);
router.get('/insights', protect, authorize('admin'), getComprehensiveInsights);
router.get('/products', protect, authorize('admin'), getProductAnalytics);
router.get('/doctors', protect, authorize('admin'), getDoctorAnalytics);
router.get('/patients', protect, authorize('admin'), getPatientAnalytics);
router.get('/scalability', protect, authorize('admin'), getScalabilityAnalysis);
router.get('/business', protect, authorize('admin'), getBusinessAnalysis);
router.get('/recommendations', protect, authorize('admin'), getRecommendations);

// Legacy placeholders for ML integration
router.post('/predict', protect, authorize('doctor'), (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'ML prediction feature reserved for future integration.'
    }
  });
});

router.post('/train', protect, authorize('admin'), (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'ML model training endpoint reserved for future integration.'
    }
  });
});

module.exports = router;
