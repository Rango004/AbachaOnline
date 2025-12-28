const express = require('express');
const db = require('../config/database');
const AnalyticsService = require('../services/AnalyticsService');
const ReviewService = require('../services/ReviewService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ============== ADMIN ANALYTICS ENDPOINTS ==============

// Get system health and performance metrics
router.get('/admin/system-health', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE order_status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE order_status IN ('confirmed', 'preparing', 'ready', 'in_delivery')) as active_orders,
        (SELECT COUNT(*) FROM refund_requests WHERE status IN ('pending', 'escalated')) as pending_refunds,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'cancelled') as cancelled_orders,
        (SELECT COUNT(*) FROM users WHERE role = 'rider' AND is_verified = true) as active_riders,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '24 hours') as deliveries_24h,
        (SELECT COALESCE(AVG(CASE WHEN order_status = 'delivered' THEN EXTRACT(EPOCH FROM (delivered_at - assigned_at))/3600 END), 0)
         FROM orders WHERE order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '7 days') as avg_delivery_hours_7d,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '24 hours') as revenue_24h,
        (SELECT COUNT(*) FROM orders WHERE order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '24 hours' AND delivered_at <= assigned_at + INTERVAL '60 minutes') as on_time_24h
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ error: 'Failed to fetch system health', message: error.message });
  }
});

// Get refund analytics for alerts
router.get('/admin/refunds', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COALESCE((SELECT COUNT(*) FROM refund_requests), 0) as requested_count,
        COALESCE((SELECT COUNT(*) FROM refund_requests WHERE id > 0), 0) as escalated_count,
        COALESCE((SELECT COUNT(*) FROM refund_requests WHERE id > 0), 0) as approved_count,
        COALESCE((SELECT COUNT(*) FROM refund_requests WHERE id > 0), 0) as rejected_count,
        COALESCE((SELECT COUNT(*)::FLOAT / NULLIF((SELECT COUNT(*) FROM refund_requests), 0) * 100 FROM refund_requests WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as refund_approval_rate,
        COALESCE(
          (SELECT COUNT(*)::FLOAT /
           NULLIF((SELECT COUNT(*) FROM orders WHERE order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '30 days'), 0) * 100
           FROM refund_requests WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
          0
        ) as refund_rate
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Refund analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch refund analytics', message: error.message });
  }
});

// Get merchant performance analytics
router.get('/admin/merchants/performance', authenticate, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await db.query(`
      SELECT
        u.id,
        u.name,
        u.phone,
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(DISTINCT CASE WHEN o.order_status = 'delivered' THEN o.id END) as completed_orders,
        COALESCE(SUM(CASE WHEN o.order_status = 'delivered' THEN o.total_amount END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN o.order_status = 'delivered' THEN EXTRACT(EPOCH FROM (o.delivered_at - o.created_at))/3600 END), 0) as avg_fulfillment_hours,
        COALESCE(COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END)::FLOAT / NULLIF(COUNT(o.id), 0) * 100, 0) as completion_rate,
        (SELECT COUNT(*) FROM refund_requests WHERE refund_requests.merchant_id = u.id AND refund_requests.created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_refunds
      FROM users u
      LEFT JOIN orders o ON u.id = o.merchant_id
      WHERE u.role = 'merchant'
      GROUP BY u.id, u.name, u.phone
      ORDER BY total_revenue DESC
      LIMIT $1
    `, [limit]);
    res.json({ merchants: result.rows });
  } catch (error) {
    console.error('Merchant performance error:', error);
    res.status(500).json({ error: 'Failed to fetch merchant performance', message: error.message });
  }
});

// Get revenue data with date range filtering
router.get('/admin/revenue', authenticate, authorize('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = req.query.startDate || `CURRENT_DATE - INTERVAL '${days} days'`;
    const endDate = req.query.endDate || 'CURRENT_DATE';

    const result = await db.query(`
      SELECT
        DATE(delivered_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as daily_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COUNT(DISTINCT merchant_id) as merchant_count,
        COUNT(DISTINCT student_id) as customer_count
      FROM orders
      WHERE order_status = 'delivered'
        AND delivered_at >= ${startDate}
        AND delivered_at <= ${endDate}
      GROUP BY DATE(delivered_at)
      ORDER BY date DESC
    `);

    res.json({
      data: result.rows,
      summary: {
        total_days: result.rows.length,
        total_revenue: result.rows.reduce((sum, row) => sum + parseFloat(row.daily_revenue || 0), 0),
        avg_daily_revenue: result.rows.length > 0 ? result.rows.reduce((sum, row) => sum + parseFloat(row.daily_revenue || 0), 0) / result.rows.length : 0,
        total_orders: result.rows.reduce((sum, row) => sum + parseInt(row.order_count || 0), 0)
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics', message: error.message });
  }
});

// Get order status breakdown
router.get('/admin/orders/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        order_status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COUNT(*)::FLOAT / (SELECT COUNT(*) FROM orders) * 100 as percentage
      FROM orders
      GROUP BY order_status
      ORDER BY count DESC
    `);
    res.json({ statusBreakdown: result.rows });
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({ error: 'Failed to fetch order status breakdown', message: error.message });
  }
});

// Get rider performance analytics
router.get('/admin/riders/performance', authenticate, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await db.query(`
      SELECT
        u.id,
        u.name,
        u.phone,
        COUNT(o.id) as total_deliveries,
        COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as completed_deliveries,
        COUNT(CASE WHEN o.order_status IN ('ready', 'in_delivery') THEN 1 END) as active_deliveries,
        COALESCE(AVG(CASE WHEN o.order_status = 'delivered' THEN EXTRACT(EPOCH FROM (o.delivered_at - o.assigned_at))/60 END), 0) as avg_delivery_minutes,
        COUNT(CASE WHEN o.order_status = 'delivered' AND o.delivered_at <= (o.assigned_at + INTERVAL '60 minutes') THEN 1 END) as on_time_deliveries,
        COALESCE(COUNT(CASE WHEN o.order_status = 'delivered' AND o.delivered_at <= (o.assigned_at + INTERVAL '60 minutes') THEN 1 END)::FLOAT / NULLIF(COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END), 0) * 100, 0) as on_time_rate
      FROM users u
      LEFT JOIN orders o ON u.id = o.rider_id
      WHERE u.role = 'rider'
      GROUP BY u.id, u.name, u.phone
      ORDER BY completed_deliveries DESC
      LIMIT $1
    `, [limit]);
    res.json({ riders: result.rows });
  } catch (error) {
    console.error('Rider performance error:', error);
    res.status(500).json({ error: 'Failed to fetch rider performance', message: error.message });
  }
});

// ============== MERCHANT ANALYTICS ENDPOINTS ==============

router.get('/merchant', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const analytics = await AnalyticsService.getMerchantAnalytics(req.user.id, days);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
  }
});

router.get('/merchant/daily-revenue', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await AnalyticsService.getMerchantDailyRevenue(req.user.id, days);
    res.json({ data });
  } catch (error) {
    console.error('Daily revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch daily revenue', message: error.message });
  }
});

router.get('/merchant/top-products', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await AnalyticsService.getTopProducts(req.user.id, limit);
    res.json({ products });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ error: 'Failed to fetch top products', message: error.message });
  }
});

router.get('/merchant/categories', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const stats = await AnalyticsService.getCategoryStats(req.user.id);
    res.json({ stats });
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({ error: 'Failed to fetch category stats', message: error.message });
  }
});

router.get('/merchant/reviews', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const reviews = await ReviewService.getMerchantReviews(req.user.id, limit, offset);
    const rating = await ReviewService.getMerchantRating(req.user.id);
    res.json({ reviews, rating });
  } catch (error) {
    console.error('Merchant reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
  }
});

module.exports = router;
