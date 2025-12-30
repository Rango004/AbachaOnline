const express = require('express');
const AuthService = require('../services/AuthService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user and send OTP
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { phone, name, pin, role, location_id, email } = req.body;

    // Validation
    if (!phone || !name || !pin) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number, name, and PIN are required'
      });
    }

    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        error: 'Invalid PIN',
        message: 'PIN must be exactly 6 digits'
      });
    }

    // Validate phone format (basic international format check)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number',
        message: 'Phone number must be in international format (e.g., +23276123456)'
      });
    }

    // Validate email format if provided (optional)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email',
          message: 'Please enter a valid email address'
        });
      }
    }

    // Validate role if provided
    const validRoles = ['student', 'merchant', 'rider', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    const result = await AuthService.register(phone, name, pin, role, location_id, email);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP code and get JWT tokens
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number and OTP code are required'
      });
    }

    // Validate code is 6 digits
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'OTP must be a 6-digit number'
      });
    }

    const result = await AuthService.verifyOTP(phone, code);
    res.json(result);
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(401).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP code to user
 * @access  Public
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number is required'
      });
    }

    const result = await AuthService.resendOTP(phone);
    res.json(result);
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(400).json({
      error: 'Resend failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Request login OTP for returning users
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number is required'
      });
    }

    const result = await AuthService.requestLoginOTP(phone);
    res.json(result);
  } catch (error) {
    console.error('Login OTP request error:', error);
    res.status(400).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/verify-login
 * @desc    Verify login OTP for returning users
 * @access  Public
 */
router.post('/verify-login', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number and OTP code are required'
      });
    }

    // Validate code is 6 digits
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'OTP must be a 6-digit number'
      });
    }

    const result = await AuthService.verifyLoginOTP(phone, code);
    res.json(result);
  } catch (error) {
    console.error('Login OTP verification error:', error);
    res.status(401).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/login-pin
 * @desc    Login with phone and 6-digit PIN
 * @access  Public
 */
router.post('/login-pin', async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number and PIN are required'
      });
    }

    // Validate PIN is 6 digits
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        error: 'Invalid PIN',
        message: 'PIN must be a 6-digit number'
      });
    }

    const result = await AuthService.loginWithPIN(phone, pin);
    res.json(result);
  } catch (error) {
    console.error('PIN login error:', error);
    res.status(401).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/auth/check-user
 * @desc    Check if user exists and has PIN set
 * @access  Public
 */
router.get('/check-user', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number is required'
      });
    }

    const result = await AuthService.checkHasPIN(phone);
    res.json(result);
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      error: 'Check failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Refresh token is required'
      });
    }

    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user's profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const profile = await AuthService.getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/auth/test
 * @desc    Test authentication middleware
 * @access  Private (requires authentication)
 */
router.get('/test', authenticate, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    user: req.user
  });
});

module.exports = router;
