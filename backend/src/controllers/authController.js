const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenHelper');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const userData = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Create user
    const user = await User.create(userData);

    // If patient, create patient record
    if (user.role === 'patient') {
      await Patient.create({
        userId: user._id,
        medicalHistory: {
          chronicConditions: [],
          pastSurgeries: [],
          familyHistory: [],
          currentMedications: userData.currentMedications || [],
          immunizations: []
        }
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshTokens = [refreshToken];
    await user.save();

    // Create audit log
    await createAuditLog({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'REGISTER',
      resource: 'User',
      resourceId: user._id,
      description: `New user registered: ${user.email}`,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Remove sensitive data
    user.password = undefined;
    user.refreshTokens = undefined;

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password +refreshTokens');

    if (!user) {
      await createAuditLog({
        userId: null,
        userEmail: email,
        action: 'LOGIN_FAILED',
        resource: 'User',
        description: `Failed login attempt for non-existent user: ${email}`,
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        isSecurityEvent: true,
        severity: 'warning'
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      await createAuditLog({
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN_FAILED',
        resource: 'User',
        description: `Failed login attempt - incorrect password for: ${email}`,
        status: 'failure',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        isSecurityEvent: true,
        severity: 'warning'
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated'
        }
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Add refresh token to user's tokens
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);

    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    user.lastLogin = new Date();
    await user.save();

    // Create audit log
    await createAuditLog({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'LOGIN',
      resource: 'User',
      description: `User logged in: ${user.email}`,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Remove sensitive data
    user.password = undefined;
    user.refreshTokens = undefined;

    res.status(200).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'Refresh token is required'
        }
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      });
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token not found or has been revoked'
        }
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove the specific refresh token
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user && user.refreshTokens) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
      }
    }

    // Create audit log
    await createAuditLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'LOGOUT',
      resource: 'User',
      description: `User logged out: ${req.user.email}`,
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    // If patient, populate patient details
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user._id });
      return res.status(200).json({
        success: true,
        data: {
          user,
          patient
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe
};
