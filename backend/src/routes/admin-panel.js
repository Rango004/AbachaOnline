const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const AdminPanelService = require('../services/AdminPanelService');
const AuthService = require('../services/AuthService');
const SettingsService = require('../services/SettingsService');

const router = express.Router();

router.use(authenticate, authorize('admin'));

/**
 * @route   POST /api/v1/admin-panel/users
 * @desc    Admin creates merchant or rider account
 * @access  Private (Admin only)
 */
router.post('/users', async (req, res) => {
  try {
    const { phone, name, role } = req.body;

    if (!phone || !name || !role) {
      return res.status(400).json({ error: 'Phone, name, and role are required' });
    }

    if (!['merchant', 'rider'].includes(role)) {
      return res.status(400).json({ error: 'Role must be merchant or rider' });
    }

    const result = await AuthService.adminCreateUser(phone, name, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/admin-panel/merchants/create-with-email
 * @desc    Admin creates merchant account with email and temporary PIN
 * @access  Private (Admin only)
 */
router.post('/merchants/create-with-email', async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: 'Email and name are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    if (phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          error: 'Invalid phone format'
        });
      }
    }

    const result = await AuthService.adminCreateMerchantWithEmail(email, name, phone);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create merchant with email error:', error);

    if (error.message.includes('already registered')) {
      return res.status(409).json({ error: error.message });
    }

    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/v1/admin-panel/users/:id
 * @desc    Admin deletes merchant or rider account
 * @access  Private (Admin only)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await AuthService.adminDeleteUser(userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/admin-panel/merchants
 * @desc    Get detailed list of merchants
 * @access  Private (Admin only)
 */
router.get('/merchants', async (req, res) => {
  try {
    const { search, income_tier, limit, offset } = req.query;
    
    const merchants = await AdminPanelService.getMerchantsDetail({
      search,
      income_tier,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    });

    res.json({
      count: merchants.length,
      merchants
    });
  } catch (error) {
    console.error('Get merchants error:', error);
    res.status(500).json({
      error: 'Failed to fetch merchants',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin-panel/merchants/:id
 * @desc    Get detailed merchant information
 * @access  Private (Admin only)
 */
router.get('/merchants/:id', async (req, res) => {
  try {
    const merchantId = parseInt(req.params.id);
    
    if (isNaN(merchantId)) {
      return res.status(400).json({
        error: 'Invalid merchant ID'
      });
    }

    const detail = await AdminPanelService.getMerchantDetail(merchantId);

    if (!detail.merchant) {
      return res.status(404).json({
        error: 'Merchant not found'
      });
    }

    res.json(detail);
  } catch (error) {
    console.error('Get merchant detail error:', error);
    res.status(500).json({
      error: 'Failed to fetch merchant details',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin-panel/customers
 * @desc    Get detailed list of customers
 * @access  Private (Admin only)
 */
router.get('/customers', async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    
    const customers = await AdminPanelService.getCustomersDetail({
      search,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    });

    res.json({
      count: customers.length,
      customers
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'Failed to fetch customers',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin-panel/customers/:id
 * @desc    Get detailed customer information
 * @access  Private (Admin only)
 */
router.get('/customers/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    if (isNaN(customerId)) {
      return res.status(400).json({
        error: 'Invalid customer ID'
      });
    }

    const detail = await AdminPanelService.getCustomerDetail(customerId);

    if (!detail.customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    res.json(detail);
  } catch (error) {
    console.error('Get customer detail error:', error);
    res.status(500).json({
      error: 'Failed to fetch customer details',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin-panel/riders
 * @desc    Get detailed list of riders
 * @access  Private (Admin only)
 */
router.get('/riders', async (req, res) => {
  try {
    const { search, limit, offset } = req.query;

    const riders = await AdminPanelService.getRidersDetail({
      search,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    });

    res.json({
      count: riders.length,
      riders
    });
  } catch (error) {
    console.error('Get riders error:', error);
    res.status(500).json({
      error: 'Failed to fetch riders',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin-panel/settings
 * @desc    Get all system settings
 * @access  Private (Admin only)
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await SettingsService.getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/admin-panel/settings/:key
 * @desc    Update a system setting (e.g., rider_delivery_fee)
 * @access  Private (Admin only)
 */
router.put('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    const adminId = req.user.id;

    if (!key || value === undefined) {
      return res.status(400).json({
        error: 'Setting key and value are required'
      });
    }

    // Validate numeric value for rider_delivery_fee
    if (key === 'rider_delivery_fee' && (isNaN(value) || value < 0)) {
      return res.status(400).json({
        error: 'Rider delivery fee must be a non-negative number'
      });
    }

    const result = await SettingsService.updateSetting(
      key,
      value,
      adminId,
      description
    );

    res.json({
      message: `Setting '${key}' updated successfully`,
      setting: result
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      error: 'Failed to update setting',
      message: error.message
    });
  }
});

module.exports = router;