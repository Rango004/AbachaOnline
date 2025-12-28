const express = require('express');
const MerchantFinancialService = require('../services/MerchantFinancialService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/merchant/dashboard
 * @desc    Get merchant financial dashboard
 * @access  Private (Merchants only)
 */
router.get('/dashboard', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const dashboard = await MerchantFinancialService.getMerchantDashboard(req.user.id);
    
    res.json({
      message: 'Dashboard data retrieved successfully',
      data: dashboard
    });
  } catch (error) {
    console.error('Get merchant dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/sales
 * @desc    Get merchant sales records
 * @access  Private (Merchants only)
 */
router.get('/sales', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { start_date, end_date, status, limit, offset } = req.query;
    
    const filters = {
      start_date,
      end_date,
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    const sales = await MerchantFinancialService.getMerchantSales(req.user.id, filters);
    
    res.json({
      count: sales.length,
      sales
    });
  } catch (error) {
    console.error('Get merchant sales error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/sales/summary
 * @desc    Get merchant sales summary
 * @access  Private (Merchants only)
 */
router.get('/sales/summary', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;
    
    const filters = {
      start_date,
      end_date,
      status: status || 'confirmed'
    };

    const summary = await MerchantFinancialService.getMerchantSalesSummary(req.user.id, filters);
    
    res.json({
      message: 'Sales summary retrieved successfully',
      summary
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales summary',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/sales/products
 * @desc    Get product sales breakdown
 * @access  Private (Merchants only)
 */
router.get('/sales/products', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const filters = {
      start_date,
      end_date
    };

    const breakdown = await MerchantFinancialService.getProductSalesBreakdown(req.user.id, filters);
    
    res.json({
      message: 'Product sales breakdown retrieved successfully',
      products: breakdown
    });
  } catch (error) {
    console.error('Get product breakdown error:', error);
    res.status(500).json({
      error: 'Failed to fetch product sales breakdown',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/payouts
 * @desc    Get merchant payout history
 * @access  Private (Merchants only)
 */
router.get('/payouts', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const payouts = await MerchantFinancialService.getMerchantPayouts(req.user.id);
    
    res.json({
      count: payouts.length,
      payouts
    });
  } catch (error) {
    console.error('Get merchant payouts error:', error);
    res.status(500).json({
      error: 'Failed to fetch payout history',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/payouts/pending
 * @desc    Get pending payout amount
 * @access  Private (Merchants only)
 */
router.get('/payouts/pending', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const pending = await MerchantFinancialService.calculatePendingPayout(req.user.id);

    res.json({
      message: 'Pending payout calculated successfully',
      pending_amount: pending?.net_payout || 0,
      pending_orders: pending?.pending_orders || 0,
      gross_amount: pending?.gross_amount || 0,
      commission: pending?.total_commission || 0
    });
  } catch (error) {
    console.error('Calculate pending payout error:', error);
    res.status(500).json({
      error: 'Failed to calculate pending payout',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/merchant/payouts/request
 * @desc    Request payout (admin approval required)
 * @access  Private (Merchants only)
 */
router.post('/payouts/request', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { payout_method } = req.body;
    
    const payoutData = {
      payout_method: payout_method || 'bank_transfer'
    };

    const payout = await MerchantFinancialService.processPayout(req.user.id, payoutData);
    
    res.status(201).json({
      message: 'Payout request created successfully',
      payout
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(400).json({
      error: 'Failed to request payout',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/orders
 * @desc    Get merchant's orders
 * @access  Private (Merchants only)
 */
router.get('/orders', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const OrderService = require('../services/OrderService');
    const { status, limit, offset } = req.query;

    const filters = {
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    const orders = await OrderService.getMerchantOrders(req.user.id, filters);

    res.json({
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get merchant orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/merchant/settings/basic-info
 * @desc    Update merchant basic information
 * @access  Private (Merchants only)
 */
router.put('/settings/basic-info', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const AuthService = require('../services/AuthService');

    const updated = await AuthService.updateMerchantProfile(req.user.id, {
      name,
      email
    });

    res.json({
      message: 'Basic information updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update basic info error:', error);
    res.status(400).json({
      error: 'Failed to update basic information',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/merchant/settings/bank-details
 * @desc    Update merchant bank details
 * @access  Private (Merchants only)
 */
router.put('/settings/bank-details', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const db = require('../db');
    const { account_holder_name, account_number, bank_name, branch_code } = req.body;

    if (!account_holder_name || !account_number || !bank_name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'account_holder_name, account_number, and bank_name are required'
      });
    }

    const result = await db.query(
      `UPDATE users
       SET merchant_settings = jsonb_set(
         COALESCE(merchant_settings, '{}'::jsonb),
         '{bank_account}',
         $1::jsonb
       ),
       updated_at = NOW()
       WHERE id = $2 AND role = 'merchant'
       RETURNING *`,
      [
        JSON.stringify({
          account_holder_name,
          account_number,
          bank_name,
          branch_code: branch_code || null
        }),
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Merchant not found'
      });
    }

    res.json({
      message: 'Bank details updated successfully',
      data: {
        id: result.rows[0].id,
        bank_account: JSON.parse(result.rows[0].merchant_settings || '{}').bank_account
      }
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(400).json({
      error: 'Failed to update bank details',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/merchant/settings/location
 * @desc    Update merchant location
 * @access  Private (Merchants only)
 */
router.put('/settings/location', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const db = require('../db');
    const { address, city, region } = req.body;

    if (!address || !city) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'address and city are required'
      });
    }

    const result = await db.query(
      `UPDATE users
       SET merchant_settings = jsonb_set(
         COALESCE(merchant_settings, '{}'::jsonb),
         '{location}',
         $1::jsonb
       ),
       updated_at = NOW()
       WHERE id = $2 AND role = 'merchant'
       RETURNING *`,
      [
        JSON.stringify({
          address,
          city,
          region: region || null
        }),
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Merchant not found'
      });
    }

    res.json({
      message: 'Location updated successfully',
      data: {
        id: result.rows[0].id,
        location: JSON.parse(result.rows[0].merchant_settings || '{}').location
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(400).json({
      error: 'Failed to update location',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/merchant/settings/business-hours
 * @desc    Update merchant business hours
 * @access  Private (Merchants only)
 */
router.put('/settings/business-hours', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const db = require('../db');
    const businessHours = req.body;

    const result = await db.query(
      `UPDATE users
       SET merchant_settings = jsonb_set(
         COALESCE(merchant_settings, '{}'::jsonb),
         '{business_hours}',
         $1::jsonb
       ),
       updated_at = NOW()
       WHERE id = $2 AND role = 'merchant'
       RETURNING *`,
      [JSON.stringify(businessHours), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Merchant not found'
      });
    }

    res.json({
      message: 'Business hours updated successfully',
      data: {
        id: result.rows[0].id,
        business_hours: JSON.parse(result.rows[0].merchant_settings || '{}').business_hours
      }
    });
  } catch (error) {
    console.error('Update business hours error:', error);
    res.status(400).json({
      error: 'Failed to update business hours',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/settings
 * @desc    Get all merchant settings
 * @access  Private (Merchants only)
 */
router.get('/settings', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const db = require('../db');

    const result = await db.query(
      'SELECT id, name, phone, email, merchant_settings FROM users WHERE id = $1 AND role = $2',
      [req.user.id, 'merchant']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Merchant not found'
      });
    }

    const merchant = result.rows[0];
    const settings = merchant.merchant_settings ? JSON.parse(merchant.merchant_settings) : {};

    res.json({
      message: 'Merchant settings retrieved successfully',
      data: {
        name: merchant.name,
        phone: merchant.phone,
        email: merchant.email,
        bank_account: settings.bank_account || {},
        location: settings.location || {},
        business_hours: settings.business_hours || {}
      }
    });
  } catch (error) {
    console.error('Get merchant settings error:', error);
    res.status(500).json({
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

module.exports = router;