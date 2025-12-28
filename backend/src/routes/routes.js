const express = require('express');
const RouteOptimizationService = require('../services/RouteOptimizationService');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/merchant/routes
 * @desc    Get all routes for merchant
 * @access  Private (Merchants only)
 */
router.get('/merchant/routes', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { status } = req.query;

    const routes = await RouteOptimizationService.getMerchantRoutes(merchantId, status);

    res.json({
      count: routes.length,
      routes
    });
  } catch (error) {
    console.error('Get merchant routes error:', error);
    res.status(500).json({
      error: 'Failed to fetch routes',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/routes/:routeId
 * @desc    Get route details by ID
 * @access  Private (Merchants and Riders)
 */
router.get('/merchant/routes/:routeId', authenticate, authorize('merchant', 'rider'), async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId);

    if (isNaN(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID' });
    }

    const result = await db.query(
      `SELECT dr.*, u.name as rider_name, u.phone as rider_phone, u.email as rider_email,
              m.name as merchant_name, m.phone as merchant_phone
       FROM delivery_routes dr
       LEFT JOIN users u ON dr.rider_id = u.id
       LEFT JOIN users m ON dr.merchant_id = m.id
       WHERE dr.id = $1`,
      [routeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = result.rows[0];

    // Authorization check: Only merchant owner or assigned rider can view
    if (req.user.role === 'merchant' && route.merchant_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this route' });
    }

    if (req.user.role === 'rider' && route.rider_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this route' });
    }

    // Get order details for this route
    const ordersResult = await db.query(
      `SELECT o.id, o.tracking_number, o.delivery_address, o.total_amount,
              o.order_status, o.created_at,
              u.name as customer_name, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.student_id = u.id
       WHERE o.id = ANY($1::int[])
       ORDER BY o.created_at ASC`,
      [route.order_ids]
    );

    route.orders = ordersResult.rows;

    res.json({
      route
    });
  } catch (error) {
    console.error('Get route details error:', error);
    res.status(500).json({
      error: 'Failed to fetch route details',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/v1/merchant/routes/:routeId/status
 * @desc    Update route status
 * @access  Private (Merchants and Riders)
 */
router.patch('/merchant/routes/:routeId/status', authenticate, authorize('merchant', 'rider'), async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const { status } = req.body;

    if (isNaN(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Verify route ownership/assignment
    const checkResult = await db.query(
      'SELECT merchant_id, rider_id FROM delivery_routes WHERE id = $1',
      [routeId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = checkResult.rows[0];

    // Authorization: merchant can update their routes, rider can update assigned routes
    if (req.user.role === 'merchant' && route.merchant_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this route' });
    }

    if (req.user.role === 'rider' && route.rider_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this route' });
    }

    const updatedRoute = await RouteOptimizationService.updateRouteStatus(routeId, status);

    res.json({
      message: 'Route status updated successfully',
      route: updatedRoute
    });
  } catch (error) {
    console.error('Update route status error:', error);
    res.status(500).json({
      error: 'Failed to update route status',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/routes
 * @desc    Get routes assigned to the authenticated rider
 * @access  Private (Riders only)
 */
router.get('/rider/routes', authenticate, authorize('rider'), async (req, res) => {
  try {
    const riderId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT dr.*, u.name as merchant_name, u.phone as merchant_phone,
             array_agg(o.tracking_number) as tracking_numbers
      FROM delivery_routes dr
      LEFT JOIN users u ON dr.merchant_id = u.id
      LEFT JOIN orders o ON o.id = ANY(dr.order_ids)
      WHERE dr.rider_id = $1
    `;
    const params = [riderId];

    if (status) {
      query += ` AND dr.status = $2`;
      params.push(status);
    }

    query += `
      GROUP BY dr.id, u.name, u.phone
      ORDER BY dr.created_at DESC
    `;

    const result = await db.query(query, params);

    res.json({
      count: result.rows.length,
      routes: result.rows
    });
  } catch (error) {
    console.error('Get rider routes error:', error);
    res.status(500).json({
      error: 'Failed to fetch rider routes',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/routes/:routeId
 * @desc    Get route details for rider
 * @access  Private (Riders only)
 */
router.get('/rider/routes/:routeId', authenticate, authorize('rider'), async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const riderId = req.user.id;

    if (isNaN(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID' });
    }

    const result = await db.query(
      `SELECT dr.*, u.name as merchant_name, u.phone as merchant_phone, u.email as merchant_email
       FROM delivery_routes dr
       LEFT JOIN users u ON dr.merchant_id = u.id
       WHERE dr.id = $1 AND dr.rider_id = $2`,
      [routeId, riderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found or not assigned to you' });
    }

    const route = result.rows[0];

    // Get order details for this route
    const ordersResult = await db.query(
      `SELECT o.id, o.tracking_number, o.delivery_address, o.total_amount,
              o.order_status, o.pickup_code, o.created_at,
              u.name as customer_name, u.phone as customer_phone,
              sa.latitude, sa.longitude, sa.building_name, sa.room_number
       FROM orders o
       LEFT JOIN users u ON o.student_id = u.id
       LEFT JOIN student_addresses sa ON o.delivery_address = sa.address_label
                                      AND sa.student_id = o.student_id
       WHERE o.id = ANY($1::int[])
       ORDER BY o.created_at ASC`,
      [route.order_ids]
    );

    route.orders = ordersResult.rows;

    res.json({
      route
    });
  } catch (error) {
    console.error('Get rider route details error:', error);
    res.status(500).json({
      error: 'Failed to fetch route details',
      message: error.message
    });
  }
});

module.exports = router;
