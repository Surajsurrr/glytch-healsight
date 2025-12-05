const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken, logout, getMe } = require('../controllers/authController');
const { validate } = require('../middleware/validator');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validators/authValidator');
const { protect } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
