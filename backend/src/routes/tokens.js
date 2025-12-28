/**
 * Token Routes
 * Handles token credit operations and PIN management
 */

const express = require('express');
const router = express.Router();
const TokenService = require('../services/TokenService');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/v1/tokens/redeem
 * @desc    Redeem a token PIN
 * @access  Private (Students)
 */
router.post('/redeem', authenticate, async (req, res) => {
  try {
    const { pin_code } = req.body;
    const userId = req.user.id;

    if (!pin_code) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'PIN code is required'
      });
    }

    const result = await TokenService.redeemPIN(pin_code, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        amount: result.amount,
        newBalance: result.newBalance
      }
    });
  } catch (error) {
    console.error('Redeem PIN error:', error);
    res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/tokens/balance
 * @desc    Get user's token balance
 * @access  Private
 */
router.get('/balance', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await TokenService.getBalance(userId);

    res.status(200).json({
      success: true,
      balance: balance.balance,
      last_topup_at: balance.last_topup_at
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get token balance'
    });
  }
});

/**
 * @route   GET /api/v1/tokens/history
 * @desc    Get user's top-up history
 * @access  Private
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const history = await TokenService.getTopupHistory(userId, limit);

    res.status(200).json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get top-up history'
    });
  }
});

/**
 * @route   POST /api/v1/tokens/generate
 * @desc    Generate a new token PIN (Admin only)
 * @access  Private (Admin)
 */
router.post('/generate', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { amount, expires_at } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Valid amount is required'
      });
    }

    const createdBy = req.user.name || `Admin_${req.user.id}`;
    const expiresAt = expires_at ? new Date(expires_at) : null;

    const pin = await TokenService.generatePIN(amount, createdBy, expiresAt);

    res.status(201).json({
      success: true,
      message: 'PIN generated successfully',
      pin: {
        pin_code: pin.pin_code,
        amount: pin.amount,
        expires_at: pin.expires_at,
        created_at: pin.created_at
      }
    });
  } catch (error) {
    console.error('Generate PIN error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate PIN'
    });
  }
});

/**
 * @route   POST /api/v1/tokens/generate-bulk
 * @desc    Generate multiple PINs in bulk (Admin only)
 * @access  Private (Admin)
 */
router.post('/generate-bulk', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { count, amount } = req.body;

    if (!count || count <= 0 || count > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Count must be between 1 and 100'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Valid amount is required'
      });
    }

    const createdBy = req.user.name || `Admin_${req.user.id}`;
    const pins = await TokenService.bulkGeneratePINs(count, amount, createdBy);

    res.status(201).json({
      success: true,
      message: `${pins.length} PINs generated successfully`,
      pins: pins.map(p => ({
        pin_code: p.pin_code,
        amount: p.amount,
        created_at: p.created_at
      }))
    });
  } catch (error) {
    console.error('Bulk generate PINs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate PINs'
    });
  }
});

module.exports = router;
