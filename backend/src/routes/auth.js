const express = require('express');
const AuthService = require('../services/AuthService');
const { authenticate } = require('../middleware/auth');
const {
  registrationLimiter,
  otpVerificationLimiter,
  otpRequestLimiter,
  pinLoginLimiter
} = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user and send OTP
 * @access  Public
 */
router.post('/register', registrationLimiter, async (req, res) => {
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

    // SECURITY: Don't reveal if phone already exists
    if (error.message === 'User already registered. Please login.') {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Unable to complete registration. Please try logging in instead.'
      });
    }

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
router.post('/verify-otp', otpVerificationLimiter, async (req, res) => {
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
router.post('/resend-otp', otpRequestLimiter, async (req, res) => {
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
router.post('/login', otpRequestLimiter, async (req, res) => {
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
router.post('/verify-login', otpVerificationLimiter, async (req, res) => {
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
router.post('/login-pin', pinLoginLimiter, async (req, res) => {
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
 * @route   POST /api/v1/auth/login-email
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login-email', pinLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email and password are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email'
      });
    }

    if (!/^\d{6}$/.test(password)) {
      return res.status(400).json({
        error: 'Invalid password'
      });
    }

    const result = await AuthService.loginWithEmail(email, password);

    if (result.passwordResetRequired) {
      res.set('X-Password-Reset-Required', 'true');
    }

    res.json(result);
  } catch (error) {
    console.error('Email login error:', error);
    res.status(401).json({
      error: 'Login failed',
      message: 'Invalid email or password'
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
 * @route   PUT /api/v1/auth/profile
 * @desc    Update current user's profile
 * @access  Private (requires authentication)
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, location_id } = req.body;
    const userId = req.user.id;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (location_id !== undefined) {
      updates.push(`location_id = $${paramCount++}`);
      values.push(location_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);
    const db = require('../config/database');
    await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`,
      values
    );

    const profile = await AuthService.getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
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

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user's PIN/password
 * @access  Private (requires authentication)
 */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    const userId = req.user.id;

    // Validation - newPin is always required, currentPin is optional for first-time setup
    if (!newPin) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'New PIN is required'
      });
    }

    // Validate new PIN format (6 digits)
    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({
        error: 'Invalid PIN',
        message: 'New PIN must be exactly 6 digits'
      });
    }

    const result = await AuthService.changePassword(userId, currentPin || '', newPin);
    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      error: 'Password change failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/auth/reset-password-request
 * @desc    Request password reset OTP (supports phone or email)
 * @access  Public
 */
router.post('/reset-password-request', otpRequestLimiter, async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Phone number or email is required'
      });
    }

    const result = await AuthService.requestPasswordReset(identifier);
    res.json(result);
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(400).json({
      error: 'Request failed',
      message: 'If an account exists, a reset code has been sent.'
    });
  }
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with OTP (supports phone or email)
 * @access  Public
 */
router.post('/reset-password', otpVerificationLimiter, async (req, res) => {
  try {
    const { identifier, code, newPin } = req.body;

    if (!identifier || !code || !newPin) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Identifier, OTP code, and new password are required'
      });
    }

    if (!/^\d{6}$/.test(newPin)) {
      return res.status(400).json({
        error: 'Invalid password'
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: 'Invalid OTP'
      });
    }

    const result = await AuthService.resetPassword(identifier, code, newPin);
    res.json(result);
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({
      error: 'Reset failed',
      message: error.message
    });
  }
});

module.exports = router;
