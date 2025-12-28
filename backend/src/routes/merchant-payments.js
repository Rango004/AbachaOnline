const express = require('express');
const MerchantPaymentService = require('../services/MerchantPaymentService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/merchant-payments/balance
 * @desc    Get merchant balance
 * @access  Private (Merchant)
 */
router.get('/balance', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const balance = await MerchantPaymentService.getMerchantBalance(req.user.id);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/merchant-payments/transactions
 * @desc    Get merchant transaction history
 * @access  Private (Merchant)
 */
router.get('/transactions', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await MerchantPaymentService.getMerchantTransactions(req.user.id, limit);
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
