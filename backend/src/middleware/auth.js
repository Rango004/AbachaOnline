const jwt = require('jsonwebtoken');

/**
 * Authentication middleware - Verify JWT token
 * Adds user info to req.user if valid
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided. Please include Authorization header with Bearer token.'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
      phone: decoded.phone
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or malformed.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please refresh your token or login again.'
      });
    }

    return res.status(500).json({
      error: 'Authentication error',
      message: error.message
    });
  }
};

/**
 * Authorization middleware - Check user role
 * Use after authenticate middleware
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated. Please login first.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Optional authentication - Don't fail if no token, but decode if present
 * Useful for endpoints that behave differently for authenticated users
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user info
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      phone: decoded.phone
    };

    next();
  } catch (error) {
    // Token is invalid or expired, but we don't fail - continue without user
    next();
  }
};

/**
 * Middleware to check if password reset is required
 * Blocks access if password change is required
 */
const requirePasswordChange = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const db = require('../config/database');
    const result = await db.query(
      'SELECT password_reset_required, temp_password_expires_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.password_reset_required) {
      return res.status(403).json({
        error: 'Password change required',
        passwordResetRequired: true
      });
    }

    if (user.temp_password_expires_at) {
      const now = new Date();
      const expiresAt = new Date(user.temp_password_expires_at);

      if (now > expiresAt) {
        return res.status(403).json({
          error: 'Temporary password expired',
          passwordResetRequired: true
        });
      }
    }

    next();
  } catch (error) {
    console.error('Password reset check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requirePasswordChange
};
