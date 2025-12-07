const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPublicProducts,
  getPublicProduct,
  recommendByDisease,
  recommendPersonalized,
} = require('../controllers/publicProductController');

// Public product listing
router.get('/', getPublicProducts);
router.get('/:id', getPublicProduct);

// Recommendations
router.post('/recommend/disease', recommendByDisease);
router.get('/recommend/personalized', protect, recommendPersonalized);

module.exports = router;
