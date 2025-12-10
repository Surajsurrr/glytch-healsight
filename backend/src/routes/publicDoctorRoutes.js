const express = require('express');
const router = express.Router();
const { getPublicDoctors } = require('../controllers/publicDoctorController');

// Public doctors listing
router.get('/', getPublicDoctors);

module.exports = router;
