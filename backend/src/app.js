const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Configure Content Security Policy to allow Cloudinary images, data URIs,
// and the Railway websocket host used in production.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'https://res.cloudinary.com', 'data:'],
      connectSrc: ["'self'", 'https://abachaonline.up.railway.app', 'wss://abachaonline.up.railway.app'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  // Enforce HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },
  // Hide X-Powered-By header
  hidePoweredBy: true
}));

app.use(cors({
  origin: function(origin, callback) {
    // Define a whitelist of allowed origins.
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
      'https://abacha-online.vercel.app'  // Production Vercel frontend
    ];

    // In a production environment, add URLs from the FRONTEND_URLS environment variable.
    // This allows for a flexible list of allowed domains (e.g., for production, staging, and preview deployments).
    if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URLS) {
      const frontendUrls = process.env.FRONTEND_URLS.split(',').map(url => url.trim());
      allowedOrigins.push(...frontendUrls);
    }

    // SECURITY: In production, only allow whitelisted origins
    // In development, allow no-origin for testing with curl/Postman
    if (!origin && process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else if (!origin) {
      // Production: reject requests with no origin header
      callback(new Error('Not allowed by CORS - Origin header required'));
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Block requests from non-whitelisted origins.
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CSRF protection middleware (excludes GET requests and health checks)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Use 'lax' for cross-origin production (Vercel + Railway) while still preventing CSRF
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health/db', async (req, res) => {
  try {
    const db = require('./config/database');
    const result = await db.query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].postgres_version
    });
  } catch (err) {
    console.error('Database health check failed:', err);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

app.get('/api/v1', (req, res) => {
  res.json({
    name: 'AbachaOnline Delivery API',
    version: '1.0.0',
    description: 'AI-powered campus delivery platform',
    endpoints: {
      auth: '/api/v1/auth',
      admin: '/api/v1/admin',
      admin_panel: '/api/v1/admin-panel',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      tokens: '/api/v1/tokens',
      merchant: '/api/v1/merchant',
      rider: '/api/v1/rider',
      notifications: '/api/v1/notifications',
      analytics: '/api/v1/analytics',
      reviews: '/api/v1/reviews',
      predictions: '/api/v1/merchant/predictions'
    }
  });
});

// CSRF token endpoint - GET request to retrieve token for form submission
app.get('/api/v1/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Google Maps API key endpoint - REMOVED FOR SECURITY
// Use server-side geocoding instead via /api/v1/geocode endpoint
// If frontend needs Google Maps, configure API key directly in Vercel environment
// and restrict by HTTP referrer in Google Cloud Console

// Geocoding proxy endpoint - calls Google Maps API from backend
app.get('/api/v1/geocode', async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Google Maps API key not configured'
      });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      error: 'Geocoding failed',
      message: error.message
    });
  }
});

// Apply CSRF protection to all state-changing requests (POST, PUT, DELETE, PATCH)
// SECURITY: Skip CSRF for JWT-authenticated requests (JWT + CORS provides equivalent protection)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // ONLY skip CSRF for truly public auth endpoints (before user is logged in)
    const publicAuthPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/login-pin',
      '/api/v1/auth/register',
      '/api/v1/auth/verify-otp',
      '/api/v1/auth/verify-login',
      '/api/v1/auth/resend-otp',
      '/api/v1/auth/refresh',
      '/api/v1/auth/reset-password-request',
      '/api/v1/auth/reset-password'
    ];

    // Skip CSRF for health checks and public auth endpoints
    if (req.path === '/health' || req.path === '/health/db' ||
        publicAuthPaths.includes(req.path)) {
      return next();
    }

    // Skip CSRF for requests with Bearer token (JWT-authenticated requests)
    // For SPA + API architecture, JWT + CORS provides equivalent CSRF protection:
    // 1. JWT must be explicitly sent in Authorization header (can't be auto-sent like cookies)
    // 2. CORS prevents cross-origin requests from unauthorized domains
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return next();
    }

    // All other state-changing requests require CSRF protection
    csrfProtection(req, res, next);
  } else {
    next();
  }
});

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const bulkImportRoutes = require('./routes/products-bulk');
const orderRoutes = require('./routes/orders');
const tokenRoutes = require('./routes/tokens');
const adminRoutes = require('./routes/admin');
const adminPanelRoutes = require('./routes/admin-panel');
const merchantRoutes = require('./routes/merchant');
const riderRoutes = require('./routes/rider');
const riderWorkflowRoutes = require('./routes/rider-workflow');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const reviewRoutes = require('./routes/reviews');
const recommendationRoutes = require('./routes/recommendations');
const merchantPaymentRoutes = require('./routes/merchant-payments');
const locationRoutes = require('./routes/locations');
const osrmRoutes = require('./routes/osrm');
const tileRoutes = require('./routes/tiles');
const wishlistRoutes = require('./routes/wishlists');
const addressRoutes = require('./routes/addresses');
const predictionsRoutes = require('./routes/predictions');
const routeOptimizationRoutes = require('./routes/routes');
const debugRoutes = require('./routes/debug');
const dashboardRoutes = require('./routes/dashboard');
const userRoleRoutes = require('./routes/user-role');
const chatRoutes = require('./routes/chat');
const chatbotRoutes = require('./routes/chatbot');
const imageRoutes = require('./routes/images');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/products', bulkImportRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/tokens', tokenRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin-panel', adminPanelRoutes);
app.use('/api/v1/merchant', merchantRoutes);
app.use('/api/v1/rider', riderRoutes);
app.use('/api/v1/rider-workflow', riderWorkflowRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/merchant-payments', merchantPaymentRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/osrm', osrmRoutes);
app.use('/api/v1/tiles', tileRoutes);
app.use('/api/v1/wishlists', wishlistRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1', predictionsRoutes);
app.use('/api/v1', routeOptimizationRoutes);
app.use('/api/v1/debug', debugRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/user', userRoleRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/images', imageRoutes);

// Serve static diagnostic tools from frontend/public
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend/public')));

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: ['/health', '/health/db', '/api/v1']
  });
});

// CSRF error handler
app.use((err, req, res, next) => {
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Image must be less than 1MB'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files',
      message: 'Maximum 5 images allowed'
    });
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message
    });
  }

  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF token error:', {
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      referer: req.headers.referer
    });
    return res.status(403).json({
      error: 'Invalid or missing CSRF token',
      message: 'Please refresh the page and try again',
      code: 'EBADCSRFTOKEN'
    });
  }

  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
