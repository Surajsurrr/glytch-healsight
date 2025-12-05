const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Not authorized to access this route - No token provided'
        }
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password -refreshTokens');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account is inactive'
          }
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Not authorized - Invalid token'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize based on roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      createAuditLog({
        userId: req.user._id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.baseUrl,
        description: `User with role ${req.user.role} attempted to access ${req.method} ${req.originalUrl}`,
        status: 'failure',
        ipAddress: req.ip,
        isSecurityEvent: true,
        severity: 'warning'
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `User role '${req.user.role}' is not authorized to access this route`
        }
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
