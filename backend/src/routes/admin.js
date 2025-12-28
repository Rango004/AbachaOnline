const express = require('express');
const AdminAuditService = require('../services/AdminAuditService');
const OrderService = require('../services/OrderService');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await AdminAuditService.getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/merchants', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const merchants = await AdminAuditService.getMerchantAudit({ limit, offset });
    res.json({ merchants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/riders', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const riders = await AdminAuditService.getRiderAudit({ limit, offset });
    res.json({ riders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const customers = await AdminAuditService.getCustomerAudit({ limit, offset });
    res.json({ customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await AdminAuditService.getUserDetail(userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/orders', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, startDate, endDate, limit, offset } = req.query;
    const orders = await AdminAuditService.getOrderAudit({ status, startDate, endDate, limit, offset });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { is_verified } = req.body;
    const user = await AdminAuditService.toggleUserStatus(userId, is_verified);
    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/orders/:id/refund', authenticate, authorize('admin'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const result = await AdminAuditService.refundOrder(orderId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/refund-requests', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        r.id,
        r.order_id,
        r.customer_id,
        r.merchant_id,
        r.status,
        r.reason,
        r.created_at,
        o.total_amount as amount,
        c.name as customer_name,
        c.phone as customer_phone,
        m.name as merchant_name,
        m.phone as merchant_phone
      FROM refund_requests r
      LEFT JOIN users c ON r.customer_id = c.id
      LEFT JOIN users m ON r.merchant_id = m.id
      LEFT JOIN orders o ON r.order_id = o.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `);
    res.json({ refunds: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/refund-requests/escalated', authenticate, authorize('admin'), async (req, res) => {
  try {
    const escalatedRefunds = await OrderService.getEscalatedRefundRequests();
    res.json({ refunds: escalatedRefunds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refund-requests/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !['approved', 'rejected', 'pending', 'escalated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    await db.query(
      'UPDATE refund_requests SET status = $1 WHERE id = $2',
      [status, refundId]
    );

    const result = await db.query(
      'SELECT * FROM refund_requests WHERE id = $1',
      [refundId]
    );

    res.json({ message: 'Refund status updated', refund: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/refund-requests/:id/review', authenticate, authorize('admin'), async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const { decision, adminNotes } = req.body;

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be either approved or rejected' });
    }

    if (!adminNotes || !adminNotes.trim()) {
      return res.status(400).json({ error: 'Admin notes are required' });
    }

    const result = await OrderService.adminReviewRefund(refundId, req.user.id, decision, adminNotes);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route Optimization Admin Endpoints

/**
 * GET /api/v1/admin/routes/optimization-history
 * Returns recent route optimization history with filtering
 * Query params: limit (default 50), offset (default 0), source, algorithm
 */
router.get('/routes/optimization-history', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit = 50, offset = 0, source, algorithm } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 50, 500); // Max 500
    const parsedOffset = parseInt(offset) || 0;

    let query = `
      SELECT
        id,
        merchant_id,
        rider_id,
        optimization_source,
        optimization_algorithm,
        optimized_at,
        num_orders,
        total_distance_m,
        avg_distance_per_order,
        num_deliveries,
        status as route_status,
        created_at,
        updated_at
      FROM delivery_routes
      WHERE optimization_source IS NOT NULL
    `;

    const params = [];
    let paramCount = 1;

    // Add filters
    if (source) {
      query += ` AND optimization_source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }

    if (algorithm) {
      query += ` AND optimization_algorithm = $${paramCount}`;
      params.push(algorithm);
      paramCount++;
    }

    query += ` ORDER BY optimized_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parsedLimit, parsedOffset);

    const result = await db.query(query, params);
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM delivery_routes WHERE optimization_source IS NOT NULL`
    );

    res.json({
      history: result.rows,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        total: parseInt(countResult.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Error fetching optimization history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/admin/routes/optimization-stats
 * Returns aggregated route optimization statistics
 * Query params: startDate, endDate
 */
router.get('/routes/optimization-stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = ` WHERE optimized_at >= $1 AND optimized_at <= $2`;
        params.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = ` WHERE optimized_at >= $1`;
        params.push(startDate);
      } else if (endDate) {
        dateFilter = ` WHERE optimized_at <= $1`;
        params.push(endDate);
      }
    }

    // Get aggregated statistics
    const statsQuery = `
      SELECT
        COUNT(*) as total_optimizations,
        SUM(CASE WHEN optimization_source = 'rider_triggered' THEN 1 ELSE 0 END) as rider_triggered_count,
        SUM(CASE WHEN optimization_source = 'auto_generated' THEN 1 ELSE 0 END) as auto_generated_count,
        SUM(CASE WHEN optimization_source = 'merchant_specific' THEN 1 ELSE 0 END) as merchant_specific_count,
        SUM(CASE WHEN optimization_algorithm = 'clarke_wright' THEN 1 ELSE 0 END) as clarke_wright_count,
        SUM(CASE WHEN optimization_algorithm = 'nearest_neighbor' THEN 1 ELSE 0 END) as nearest_neighbor_count,
        AVG(total_distance_m) as avg_distance_m,
        SUM(total_distance_m) as total_distance_m,
        SUM(num_orders) as total_orders_optimized,
        SUM(num_deliveries) as total_deliveries,
        AVG(num_deliveries) as avg_deliveries_per_route,
        MIN(total_distance_m) as min_distance_m,
        MAX(total_distance_m) as max_distance_m
      FROM delivery_routes
      ${dateFilter}
    `;

    const result = await db.query(statsQuery, params);
    const stats = result.rows[0];

    // Format response
    const response = {
      summary: {
        total_optimizations: parseInt(stats.total_optimizations || 0),
        total_distance_m: Math.round(parseFloat(stats.total_distance_m || 0)),
        total_orders_optimized: parseInt(stats.total_orders_optimized || 0),
        total_deliveries: parseInt(stats.total_deliveries || 0)
      },
      by_source: {
        rider_triggered: parseInt(stats.rider_triggered_count || 0),
        auto_generated: parseInt(stats.auto_generated_count || 0),
        merchant_specific: parseInt(stats.merchant_specific_count || 0)
      },
      by_algorithm: {
        clarke_wright: parseInt(stats.clarke_wright_count || 0),
        nearest_neighbor: parseInt(stats.nearest_neighbor_count || 0)
      },
      metrics: {
        avg_distance_per_route_m: Math.round(parseFloat(stats.avg_distance_m || 0)),
        avg_deliveries_per_route: Math.round(parseFloat(stats.avg_deliveries_per_route || 0) * 100) / 100,
        min_distance_m: Math.round(parseFloat(stats.min_distance_m || 0)),
        max_distance_m: Math.round(parseFloat(stats.max_distance_m || 0))
      },
      date_range: {
        start: startDate || 'all-time',
        end: endDate || 'all-time'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching optimization stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/admin/routes/queue-status
 * Returns status of the route optimization job queue
 */
router.get('/routes/queue-status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const RouteOptimizationJobQueue = require('../services/RouteOptimizationJobQueue');
    const queueStats = await RouteOptimizationJobQueue.getQueueStats();

    res.json({
      queue: 'route-optimization',
      status: 'active',
      jobs: queueStats,
      configuration: {
        auto_optimization_interval_minutes: process.env.ROUTE_AUTO_OPTIMIZATION_INTERVAL || 5,
        auto_optimization_enabled: process.env.ROUTE_AUTO_OPTIMIZATION_ENABLED !== 'false',
        default_algorithm: process.env.ROUTE_DEFAULT_METHOD || 'clarke_wright'
      }
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/admin/routes/trigger-optimization
 * Manually trigger route optimization
 */
router.post('/routes/trigger-optimization', authenticate, authorize('admin'), async (req, res) => {
  try {
    const RouteOptimizationJobQueue = require('../services/RouteOptimizationJobQueue');
    const job = await RouteOptimizationJobQueue.triggerAutoOptimization();

    res.json({
      message: 'Route optimization triggered manually',
      job_id: job.id,
      status: 'queued',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering optimization:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/admin/routes/job-status/:jobId
 * Get status of a specific optimization job
 */
router.get('/routes/job-status/:jobId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const RouteOptimizationJobQueue = require('../services/RouteOptimizationJobQueue');
    const jobStatus = await RouteOptimizationJobQueue.getJobStatus(jobId);

    res.json(jobStatus);
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
