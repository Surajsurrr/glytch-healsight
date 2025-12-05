const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Global search
router.get('/', protect, (req, res) => {
  const { q, type } = req.query;
  res.status(200).json({ 
    success: true, 
    message: `Search endpoint - query: ${q}, type: ${type || 'all'}`,
    data: {
      results: []
    }
  });
});

module.exports = router;
