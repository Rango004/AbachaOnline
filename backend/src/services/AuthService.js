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
   * Check if phone number is Africell (blocked carrier)
   * @param {string} phone - Phone number
   * @returns {Object} Carrier info and blocked status
   */
  checkCarrier(phone) {
    return {
      isBlocked: otpService.isAfricellNumber(phone),
      carrier: otpService.getCarrier(phone),
      isSupported: otpService.isSupportedCarrier(phone)
    };
  }

  /**
   * Register a new user
   * @param {string} phone - Phone number in international format
   * @param {string} name - User's full name
   * @param {string} role - User role (student, merchant, rider, admin)
   * @param {number} locationId - Location/dormitory ID (required for students)
   * @returns {Promise<Object>} User ID and success message
   */
  async register(phone, name, role = 'student', locationId = null) {
    const carrierInfo = this.checkCarrier(phone);
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id, is_verified FROM users WHERE phone = $1',
        [phone]
      );

      let userId;
      const otp = this.generateOTP();

      // Location can be added later in user profile settings
      // Students can register without location and add it when ready

      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];

        if (user.is_verified) {
          throw new Error('User already registered. Please login.');
        }

        // Update unverified user with new OTP
        const result = await client.query(
          `UPDATE users
           SET name = $1, role = $2, verification_code = $3, location_id = $4, updated_at = NOW()
           WHERE phone = $5
           RETURNING id`,
          [name, role, otp, locationId, phone]
        );
        userId = result.rows[0].id;
      } else {
        // Insert new user
        const result = await client.query(
          `INSERT INTO users (phone, name, role, verification_code, is_verified, location_id)
           VALUES ($1, $2, $3, $4, false, $5)
           RETURNING id`,
          [phone, name, role, otp, locationId]
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

      // Send OTP via SMS
      const otpResult = await otpService.sendSMS(phone, otp);

      return {
        user_id: userId,
        message: 'OTP sent to your phone. Please check your messages.',
        carrier: carrierInfo.carrier,
        // In development, include OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp })
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
        'SELECT id, is_verified, name FROM users WHERE phone = $1',
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

      // Send OTP via SMS
      await otpService.sendSMS(phone, otp);

      return {
        message: 'OTP resent to your phone',
        ...(process.env.NODE_ENV === 'development' && { otp })
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
        'SELECT id, is_verified, name, role FROM users WHERE phone = $1',
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

      // Send OTP via SMS
      await otpService.sendSMS(phone, otp);

      return {
        message: 'Login OTP sent to your phone. Please check your messages.',
        user_id: user.id,
        ...(process.env.NODE_ENV === 'development' && { otp })
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
}

module.exports = new AuthService();
