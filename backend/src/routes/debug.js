const express = require('express');
const db = require('../config/database');

const router = express.Router();

/**
 * @route   GET /api/v1/debug/route-optimization
 * @desc    Diagnostic endpoint for route optimization issues
 * @access  Public (for debugging only - remove in production)
 */
router.get('/route-optimization', async (req, res) => {
  try {
    const diagnostics = {};

    // 1. Check order status distribution
    const statusResult = await db.query(
      `SELECT order_status, COUNT(*) as count
       FROM orders
       GROUP BY order_status
       ORDER BY count DESC`
    );
    diagnostics.order_status_distribution = statusResult.rows;

    // 2. Check ready orders with GPS (unassigned)
    const readyUnassignedResult = await db.query(
      `SELECT o.id, o.order_status, o.rider_id, u.name, u.latitude, u.longitude
       FROM orders o
       LEFT JOIN users u ON o.student_id = u.id
       WHERE o.order_status = 'ready'
         AND o.rider_id IS NULL
         AND u.latitude IS NOT NULL
         AND u.longitude IS NOT NULL
       LIMIT 10`
    );
    diagnostics.ready_orders_unassigned = readyUnassignedResult.rows;

    // 3. Check ready orders assigned to riders
    const readyAssignedResult = await db.query(
      `SELECT o.id, o.order_status, o.rider_id, r.name as rider_name, u.name as customer_name, u.latitude, u.longitude
       FROM orders o
       LEFT JOIN users u ON o.student_id = u.id
       LEFT JOIN users r ON o.rider_id = r.id
       WHERE o.order_status = 'ready'
         AND o.rider_id IS NOT NULL
       LIMIT 10`
    );
    diagnostics.ready_orders_assigned = readyAssignedResult.rows;

    // 4. Check confirmed orders
    const confirmedResult = await db.query(
      `SELECT o.id, o.order_status, o.rider_id, u.name as customer_name, u.latitude, u.longitude
       FROM orders o
       LEFT JOIN users u ON o.student_id = u.id
       WHERE o.order_status = 'confirmed'
       LIMIT 10`
    );
    diagnostics.confirmed_orders = confirmedResult.rows;

    // 5. Check riders with GPS
    const ridersResult = await db.query(
      `SELECT u.id, u.name, u.latitude, u.longitude, u.is_verified, COUNT(o.id) as active_orders
       FROM users u
       LEFT JOIN orders o ON u.id = o.rider_id AND o.order_status IN ('ready', 'in_delivery')
       WHERE u.role = 'rider'
       GROUP BY u.id, u.name, u.latitude, u.longitude, u.is_verified
       LIMIT 10`
    );
    diagnostics.riders_with_gps = ridersResult.rows;

    // 6. Check customers with GPS
    const customersResult = await db.query(
      `SELECT u.id, u.name, u.latitude, u.longitude, COUNT(o.id) as order_count
       FROM users u
       LEFT JOIN orders o ON u.id = o.student_id
       WHERE u.role = 'student'
         AND u.latitude IS NOT NULL
         AND u.longitude IS NOT NULL
       GROUP BY u.id, u.name, u.latitude, u.longitude
       LIMIT 10`
    );
    diagnostics.customers_with_gps = customersResult.rows;

    res.json({
      message: 'Route optimization diagnostics',
      diagnostics
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message
    });
  }
});

module.exports = router;
