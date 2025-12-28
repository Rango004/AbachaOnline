const express = require('express');
const RecommendationService = require('../services/RecommendationService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/recommendations
 * @desc    Get personalized product recommendations
 * @access  Private (Students only)
 */
router.get('/', authenticate, async (req, res) => {
  // Only allow customers/students to access recommendations
  if (req.user.role !== 'customer' && req.user.role !== 'student') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Recommendations are only available for customers'
    });
  }
  
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recommendations = await RecommendationService.getRecommendations(req.user.id, limit);
    
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/recommendations/forecast/:productId
 * @desc    Get demand forecast for a product
 * @access  Private (Merchants)
 */
router.get('/forecast/:productId', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const forecast = await RecommendationService.getDemandForecast(req.params.productId, days);
    
    res.json({ forecast });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/recommendations/inventory
 * @desc    Get inventory recommendations for merchant
 * @access  Private (Merchants)
 */
router.get('/inventory', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const recommendations = await RecommendationService.getInventoryRecommendations(req.user.id);
    
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
