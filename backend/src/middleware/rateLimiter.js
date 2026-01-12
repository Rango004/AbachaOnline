const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Authentication Endpoints
 * Prevents brute force attacks on login, registration, and OTP verification
 * Note: express-rate-limit v8.x requires proper IPv6 handling
 */

// Strict rate limiter for OTP verification (prevents brute force)
const otpVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per IP per 15 minutes
  message: {
    error: 'Too many OTP verification attempts',
    message: 'Please wait 15 minutes before trying again',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use phone number as key (no IP fallback to avoid IPv6 issues)
  keyGenerator: (req) => {
    return req.body.phone || `anonymous-${Date.now()}`; // Use phone number, no IP fallback
  },
  skipSuccessfulRequests: true, // Don't count successful verifications
  skipFailedRequests: false
});

// Rate limiter for PIN login
const pinLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per phone number per 15 minutes
  message: {
    error: 'Too many login attempts',
    message: 'Account temporarily locked. Please wait 15 minutes or use OTP login',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body.phone || `anonymous-${Date.now()}`; // Use phone number, no IP fallback
  },
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

// Rate limiter for registration (prevents spam accounts)
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Maximum 3 registrations per IP per hour
  message: {
    error: 'Too many registration attempts',
    message: 'Please wait before creating another account',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for OTP requests (prevents SMS bombing)
const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Maximum 10 OTP requests per phone per hour
  message: {
    error: 'Too many OTP requests',
    message: 'Please wait before requesting another code',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body.phone || `anonymous-${Date.now()}`; // Use phone number, no IP fallback
  }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per IP per 15 minutes
  message: {
    error: 'Too many requests',
    message: 'Please slow down and try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Aggressive rate limiter for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Maximum 20 uploads per hour per user
  message: {
    error: 'Too many upload attempts',
    message: 'Upload limit reached. Please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  otpVerificationLimiter,
  pinLoginLimiter,
  registrationLimiter,
  otpRequestLimiter,
  apiLimiter,
  uploadLimiter
};
