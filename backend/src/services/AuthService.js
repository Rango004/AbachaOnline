const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/database');
const otpService = require('./OTPNotificationService');

class AuthService {
  /**
   * Generate a 6-digit OTP code
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Get carrier info for phone number
   * @param {string} phone - Phone number
   * @returns {Object} Carrier info
   */
  checkCarrier(phone) {
    return {
      carrier: otpService.getCarrier(phone)
    };
  }

  /**
   * Validate PIN format (6 digits, no sequential or repeated patterns)
   * @param {string} pin - PIN to validate
   * @returns {boolean} True if valid
   */
  validatePIN(pin) {
    if (!/^\d{6}$/.test(pin)) {
      return { valid: false, message: 'PIN must be exactly 6 digits' };
    }
    // Block sequential PINs
    const sequential = ['123456', '234567', '345678', '456789', '567890', '654321', '543210', '432109', '321098', '210987'];
    if (sequential.includes(pin)) {
      return { valid: false, message: 'PIN cannot be a sequential number' };
    }
    // Block repeated digits
    if (/^(\d)\1{5}$/.test(pin)) {
      return { valid: false, message: 'PIN cannot be all the same digit' };
    }
    return { valid: true };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Register a new user
   * @param {string} phone - Phone number in international format
   * @param {string} name - User's full name
   * @param {string} pin - 6-digit PIN for authentication
   * @param {string} role - User role (student, merchant, rider, admin)
   * @param {number} locationId - Location/dormitory ID (required for students)
   * @param {string} email - Optional email for account recovery
   * @returns {Promise<Object>} User ID and success message
   */
  async register(phone, name, pin, role = 'student', locationId = null, email = null) {
    // Validate PIN
    const pinValidation = this.validatePIN(pin);
    if (!pinValidation.valid) {
      throw new Error(pinValidation.message);
    }

    // Validate email if provided
    if (email && !this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const carrierInfo = this.checkCarrier(phone);
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Hash the PIN
      const pinHash = await bcrypt.hash(pin, 10);

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id, is_verified FROM users WHERE phone = $1',
        [phone]
      );

      // Check if email is already used by another user
      if (email) {
        const emailCheck = await client.query(
          'SELECT id FROM users WHERE email = $1 AND phone != $2',
          [email, phone]
        );
        if (emailCheck.rows.length > 0) {
          throw new Error('Email already registered to another account');
        }
      }

      let userId;
      const otp = this.generateOTP();

      // Location can be added later in user profile settings
      // Students can register without location and add it when ready

      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];

        if (user.is_verified) {
          throw new Error('User already registered. Please login.');
        }

        // Update unverified user with new OTP, PIN, and email
        const result = await client.query(
          `UPDATE users
           SET name = $1, role = $2, verification_code = $3, location_id = $4, password_hash = $5, email = $6, updated_at = NOW()
           WHERE phone = $7
           RETURNING id`,
          [name, role, otp, locationId, pinHash, email, phone]
        );
        userId = result.rows[0].id;
      } else {
        // Insert new user with PIN and email
        const result = await client.query(
          `INSERT INTO users (phone, name, role, verification_code, is_verified, location_id, password_hash, email)
           VALUES ($1, $2, $3, $4, false, $5, $6, $7)
           RETURNING id`,
          [phone, name, role, otp, locationId, pinHash, email]
        );
        userId = result.rows[0].id;

        // Initialize token credits for students
        if (role === 'student') {
          await client.query(
            'INSERT INTO token_credits (user_id, balance) VALUES ($1, 0.00)',
            [userId]
          );
        }
      }

      await client.query('COMMIT');

      // Send OTP via multi-channel service (WhatsApp, Flash Call, SMS, Email, or Fallback)
      const otpResult = await otpService.sendOTP(phone, otp, { userName: name, email: email });

      return {
        user_id: userId,
        message: otpResult.message || 'Verification code sent. Please check your messages.',
        carrier: carrierInfo.carrier,
        method: otpResult.method
        // OTP is never sent to frontend for security - check Railway logs if needed for testing
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify OTP and generate JWT tokens
   * @param {string} phone - Phone number
   * @param {string} code - OTP code
   * @returns {Promise<Object>} Access token, refresh token, and user info
   */
  async verifyOTP(phone, code) {
    try {
      const result = await db.query(
        `UPDATE users
         SET is_verified = true, verification_code = NULL, updated_at = NOW()
         WHERE phone = $1 AND verification_code = $2 AND is_verified = false
         RETURNING id, phone, name, role, zone_id`,
        [phone, code]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid OTP or user already verified');
      }

      const user = result.rows[0];
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          zone_id: user.zone_id
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login with phone and password (for users who set password)
   * @param {string} phone - Phone number
   * @param {string} password - User password
   * @returns {Promise<Object>} Tokens and user info
   */
  async login(phone, password) {
    try {
      const result = await db.query(
        `SELECT id, phone, name, role, zone_id, password_hash, is_verified
         FROM users
         WHERE phone = $1`,
        [phone]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      if (!user.is_verified) {
        throw new Error('Please verify your account first');
      }

      if (!user.password_hash) {
        throw new Error('Please use OTP login');
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          zone_id: user.zone_id
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate access token (short-lived)
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        phone: user.phone
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Generate refresh token (long-lived)
   * @param {Object} user - User object
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      const result = await db.query(
        'SELECT id, phone, name, role, zone_id, is_verified FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      if (!user.is_verified) {
        throw new Error('Account not verified');
      }

      const newAccessToken = this.generateAccessToken(user);

      return {
        accessToken: newAccessToken
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  /**
   * Resend OTP code (for unverified users during registration)
   * @param {string} phone - Phone number
   * @returns {Promise<Object>} Success message
   */
  async resendOTP(phone) {
    try {
      const result = await db.query(
        'SELECT id, is_verified, name, email FROM users WHERE phone = $1',
        [phone]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found. Please register first.');
      }

      const user = result.rows[0];

      if (user.is_verified) {
        throw new Error('User already verified. Please use login instead.');
      }

      const otp = this.generateOTP();

      await db.query(
        'UPDATE users SET verification_code = $1, updated_at = NOW() WHERE id = $2',
        [otp, user.id]
      );

      // Send OTP via multi-channel service
      const otpResult = await otpService.sendOTP(phone, otp, { userName: user.name, email: user.email });

      return {
        message: otpResult.message || 'OTP resent. Please check your messages.',
        method: otpResult.method
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request login OTP for verified users
   * @param {string} phone - Phone number
   * @returns {Promise<Object>} Success message with OTP
   */
  async requestLoginOTP(phone) {
    try {
      const result = await db.query(
        'SELECT id, is_verified, name, role, email FROM users WHERE phone = $1',
        [phone]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found. Please register first.');
      }

      const user = result.rows[0];

      if (!user.is_verified) {
        throw new Error('Please complete registration first by verifying your OTP.');
      }

      const otp = this.generateOTP();

      // Store OTP for login (reuse verification_code field)
      await db.query(
        'UPDATE users SET verification_code = $1, updated_at = NOW() WHERE id = $2',
        [otp, user.id]
      );

      // Send OTP via multi-channel service
      const otpResult = await otpService.sendOTP(phone, otp, { userName: user.name, email: user.email });

      return {
        message: otpResult.message || 'Login OTP sent. Please check your messages.',
        user_id: user.id,
        method: otpResult.method
        // OTP is never sent to frontend for security - check Railway logs if needed for testing
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify login OTP for returning users
   * @param {string} phone - Phone number
   * @param {string} code - OTP code
   * @returns {Promise<Object>} Tokens and user info
   */
  async verifyLoginOTP(phone, code) {
    try {
      const result = await db.query(
        `SELECT id, phone, name, role, zone_id, verification_code
         FROM users
         WHERE phone = $1 AND is_verified = true`,
        [phone]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found or not verified');
      }

      const user = result.rows[0];

      if (user.verification_code !== code) {
        throw new Error('Invalid OTP code');
      }

      // Clear the OTP after successful login
      await db.query(
        'UPDATE users SET verification_code = NULL, updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          zone_id: user.zone_id
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login with phone and 6-digit PIN
   * @param {string} phone - Phone number
   * @param {string} pin - 6-digit PIN
   * @returns {Promise<Object>} Tokens and user info
   */
  async loginWithPIN(phone, pin) {
    try {
      // Validate PIN format
      if (!/^\d{6}$/.test(pin)) {
        throw new Error('PIN must be exactly 6 digits');
      }

      const result = await db.query(
        `SELECT id, phone, name, role, zone_id, password_hash, is_verified
         FROM users
         WHERE phone = $1`,
        [phone]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      if (!user.is_verified) {
        throw new Error('Please verify your account first');
      }

      if (!user.password_hash) {
        throw new Error('PIN not set. Please use OTP login.');
      }

      const isValidPin = await bcrypt.compare(pin, user.password_hash);
      if (!isValidPin) {
        throw new Error('Invalid PIN');
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          zone_id: user.zone_id
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user exists and has a PIN set
   * @param {string} phone - Phone number
   * @returns {Promise<Object>} User existence and PIN status
   */
  async checkHasPIN(phone) {
    try {
      const result = await db.query(
        `SELECT id, is_verified, password_hash IS NOT NULL as has_pin
         FROM users
         WHERE phone = $1`,
        [phone]
      );

      if (result.rows.length === 0) {
        return { exists: false, isVerified: false, hasPIN: false };
      }

      const user = result.rows[0];
      return {
        exists: true,
        isVerified: user.is_verified,
        hasPIN: user.has_pin
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin creates merchant or rider account (no OTP required)
   * @param {string} phone - Phone number
   * @param {string} name - User's full name
   * @param {string} role - User role (merchant or rider)
   * @returns {Promise<Object>} Created user info
   */
  async adminCreateUser(phone, name, role) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id, role FROM users WHERE phone = $1',
        [phone]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this phone number already exists');
      }

      // Insert new user (already verified)
      const result = await client.query(
        `INSERT INTO users (phone, name, role, is_verified)
         VALUES ($1, $2, $3, true)
         RETURNING id, phone, name, role`,
        [phone, name, role]
      );

      const user = result.rows[0];

      await client.query('COMMIT');

      return {
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Admin deletes merchant or rider account
   * @param {number} userId - User ID to delete
   * @returns {Promise<Object>} Success message
   */
  async adminDeleteUser(userId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        'SELECT id, role, name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      if (!['merchant', 'rider'].includes(user.role)) {
        throw new Error('Can only delete merchant or rider accounts');
      }

      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      await client.query('COMMIT');

      return {
        success: true,
        message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account deleted successfully`
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user profile
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    try {
      const result = await db.query(
        `SELECT u.id, u.phone, u.name, u.role, u.zone_id, u.is_verified, u.created_at,
                z.name as zone_name,
                tc.balance as token_balance
         FROM users u
         LEFT JOIN zones z ON u.zone_id = z.id
         LEFT JOIN token_credits tc ON u.id = tc.user_id
         WHERE u.id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user's PIN/password
   * @param {number} userId - User ID
   * @param {string} currentPin - Current PIN
   * @param {string} newPin - New PIN
   * @returns {Promise<Object>} Success message
   */
  async changePassword(userId, currentPin, newPin) {
    try {
      // Validate new PIN
      const pinValidation = this.validatePIN(newPin);
      if (!pinValidation.valid) {
        throw new Error(pinValidation.message);
      }

      // Get current user
      const result = await db.query(
        'SELECT id, password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Handle first-time PIN setup (no current PIN exists)
      if (!user.password_hash || user.password_hash === '') {
        // First-time setup - no current PIN required
        const newPinHash = await bcrypt.hash(newPin, 10);
        await db.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [newPinHash, userId]
        );

        return {
          success: true,
          message: 'PIN set successfully',
          firstTimeSetup: true
        };
      }

      // Verify current PIN for existing users
      const isValidPin = await bcrypt.compare(currentPin, user.password_hash);
      if (!isValidPin) {
        throw new Error('Current PIN is incorrect');
      }

      // Check new PIN is different from current
      const isSamePin = await bcrypt.compare(newPin, user.password_hash);
      if (isSamePin) {
        throw new Error('New PIN must be different from current PIN');
      }

      // Hash and save new PIN
      const newPinHash = await bcrypt.hash(newPin, 10);
      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPinHash, userId]
      );

      return {
        success: true,
        message: 'PIN changed successfully',
        firstTimeSetup: false
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset OTP
   * @param {string} phone - Phone number
   * @returns {Promise<Object>} Success message
   */
  async requestPasswordReset(phone) {
    try {
      const result = await db.query(
        'SELECT id, name, is_verified, email FROM users WHERE phone = $1',
        [phone]
      );

      if (result.rows.length === 0) {
        throw new Error('No account found with this phone number');
      }

      const user = result.rows[0];

      if (!user.is_verified) {
        throw new Error('Account not verified. Please complete registration first.');
      }

      const otp = this.generateOTP();

      // Store OTP for password reset
      await db.query(
        'UPDATE users SET verification_code = $1, updated_at = NOW() WHERE id = $2',
        [otp, user.id]
      );

      // Send OTP via multi-channel service
      const otpResult = await otpService.sendOTP(phone, otp, { userName: user.name, email: user.email });

      return {
        success: true,
        message: otpResult.message || 'Password reset OTP sent. Please check your messages.',
        method: otpResult.method
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with OTP
   * @param {string} phone - Phone number
   * @param {string} code - OTP code
   * @param {string} newPin - New PIN
   * @returns {Promise<Object>} Success message
   */
  async resetPassword(phone, code, newPin) {
    try {
      // Validate new PIN
      const pinValidation = this.validatePIN(newPin);
      if (!pinValidation.valid) {
        throw new Error(pinValidation.message);
      }

      // Verify OTP
      const result = await db.query(
        'SELECT id, verification_code FROM users WHERE phone = $1 AND is_verified = true',
        [phone]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found or not verified');
      }

      const user = result.rows[0];

      if (user.verification_code !== code) {
        throw new Error('Invalid OTP code');
      }

      // Hash and save new PIN, clear OTP
      const newPinHash = await bcrypt.hash(newPin, 10);
      await db.query(
        'UPDATE users SET password_hash = $1, verification_code = NULL, updated_at = NOW() WHERE id = $2',
        [newPinHash, user.id]
      );

      return {
        success: true,
        message: 'PIN reset successfully. You can now login with your new PIN.'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
