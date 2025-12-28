const express = require('express');
const OSRMService = require('../services/OSRMService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/osrm/route
 * @desc    Get route between two points
 * @access  Private
 */
router.get('/route', authenticate, async (req, res) => {
  try {
    const { start_lat, start_lng, end_lat, end_lng } = req.query;

    if (!start_lat || !start_lng || !end_lat || !end_lng) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    const route = await OSRMService.getRoute(
      parseFloat(start_lat),
      parseFloat(start_lng),
      parseFloat(end_lat),
      parseFloat(end_lng)
    );

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/osrm/distance-matrix
 * @desc    Get distance matrix between multiple points
 * @access  Private
 */
router.post('/distance-matrix', authenticate, async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      return res.status(400).json({ error: 'At least 2 coordinates required' });
    }

    const matrix = await OSRMService.getDistanceMatrix(coordinates);
    res.json(matrix);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/osrm/optimize-route
 * @desc    Optimize route for multiple deliveries
 * @access  Private (Riders)
 */
router.post('/optimize-route', authenticate, authorize('rider', 'admin'), async (req, res) => {
  try {
    const { start, deliveries } = req.body;

    if (!start || !deliveries || !Array.isArray(deliveries)) {
      return res.status(400).json({ error: 'Start point and deliveries array required' });
    }

    const optimized = await OSRMService.optimizeRoute(start, deliveries);
    res.json(optimized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/osrm/delivery-estimate
 * @desc    Get delivery time estimate
 * @access  Private
 */
router.get('/delivery-estimate', authenticate, async (req, res) => {
  try {
    const { merchant_lat, merchant_lng, delivery_lat, delivery_lng } = req.query;

    if (!merchant_lat || !merchant_lng || !delivery_lat || !delivery_lng) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    const estimate = await OSRMService.getDeliveryEstimate(
      parseFloat(merchant_lat),
      parseFloat(merchant_lng),
      parseFloat(delivery_lat),
      parseFloat(delivery_lng)
    );

    res.json(estimate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
