const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/dashboard
 * @desc    Get role-specific dashboard data
 * @access  Private (All authenticated users)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    switch (userRole) {
      case 'rider':
        const RiderDashboardService = require('../services/RiderDashboardService');
        const riderData = await RiderDashboardService.getRiderDashboard(req.user.id);
        return res.json({ role: 'rider', data: riderData });

      case 'merchant':
        const MerchantFinancialService = require('../services/MerchantFinancialService');
        const merchantData = await MerchantFinancialService.getMerchantDashboard(req.user.id);
        return res.json({ role: 'merchant', data: merchantData });

      case 'admin':
        return res.json({ role: 'admin', redirect: '/admin-panel' });

      case 'student':
      case 'customer':
        // Students and customers see products/recommendations
        return res.json({ role: userRole, redirect: '/products' });

      default:
        return res.status(400).json({
          error: 'Invalid user role',
          message: 'Unable to determine appropriate dashboard'
        });
    }
  } catch (error) {
    console.error('Dashboard routing error:', error);
    res.status(500).json({
      error: 'Failed to load dashboard',
      message: error.message
    });
  }
});

module.exports = router;