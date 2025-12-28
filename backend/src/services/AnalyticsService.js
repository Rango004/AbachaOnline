const db = require('../config/database');

class AnalyticsService {
  async getMerchantAnalytics(merchantId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await db.query(
        `SELECT 
          COUNT(DISTINCT o.id)::INTEGER as total_orders,
          COUNT(DISTINCT CASE WHEN o.order_status = 'delivered' THEN o.id END)::INTEGER as completed_orders,
          COALESCE(SUM(CASE WHEN o.order_status = 'delivered' THEN o.total_amount ELSE 0 END), 0)::NUMERIC as total_revenue,
          COALESCE(AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating ELSE NULL END), 0)::NUMERIC as avg_rating,
          COUNT(DISTINCT r.id)::INTEGER as total_reviews
         FROM orders o
         LEFT JOIN reviews r ON o.id = r.order_id
         WHERE o.merchant_id = $1 AND o.created_at >= $2`,
        [merchantId, startDate]
      );

      const row = result.rows[0] || {
        total_orders: 0,
        completed_orders: 0,
        total_revenue: 0,
        avg_rating: 0,
        total_reviews: 0
      };

      // Normalize numeric/string types returned by pg for client-side ease
      return {
        total_orders: parseInt(row.total_orders, 10) || 0,
        completed_orders: parseInt(row.completed_orders, 10) || 0,
        total_revenue: Number(row.total_revenue) || 0,
        avg_rating: Number(row.avg_rating) || 0,
        total_reviews: parseInt(row.total_reviews, 10) || 0
      };
    } catch (error) {
      throw error;
    }
  }

  async getMerchantDailyRevenue(merchantId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await db.query(
        `SELECT 
          DATE(o.created_at) as date,
          COUNT(o.id)::INTEGER as orders,
          COALESCE(SUM(o.total_amount), 0)::NUMERIC as revenue
         FROM orders o
         WHERE o.merchant_id = $1 AND o.order_status = 'delivered' AND o.created_at >= $2
         GROUP BY DATE(o.created_at)
         ORDER BY date DESC`,
        [merchantId, startDate]
      );

      return result.rows.map(r => ({
        date: r.date,
        orders: parseInt(r.orders, 10) || 0,
        revenue: Number(r.revenue) || 0
      }));
    } catch (error) {
      throw error;
    }
  }

  async getTopProducts(merchantId, limit = 10) {
    try {
      const result = await db.query(
        `SELECT 
          p.id, p.name, p.price,
          COALESCE(COUNT(oi.id), 0)::INTEGER as times_ordered,
          COALESCE(SUM(oi.quantity), 0)::INTEGER as total_quantity,
          COALESCE(AVG(r.rating), 0)::NUMERIC as avg_rating
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
         LEFT JOIN orders o ON oi.order_id = o.id
         LEFT JOIN reviews r ON o.id = r.order_id
         WHERE p.merchant_id = $1
         GROUP BY p.id, p.name, p.price
         ORDER BY times_ordered DESC
         LIMIT $2`,
        [merchantId, limit]
      );

      return result.rows.map(r => ({
        id: r.id,
        name: r.name,
        price: Number(r.price) || 0,
        times_ordered: parseInt(r.times_ordered, 10) || 0,
        total_quantity: parseInt(r.total_quantity, 10) || 0,
        avg_rating: Number(r.avg_rating) || 0
      }));
    } catch (error) {
      throw error;
    }
  }

  async getCategoryStats(merchantId) {
    try {
      const result = await db.query(
        `SELECT 
          p.category,
          COUNT(DISTINCT oi.order_id)::INTEGER as orders,
          COALESCE(SUM(oi.quantity), 0)::INTEGER as items_sold,
          COALESCE(SUM(oi.subtotal), 0)::NUMERIC as revenue
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
         WHERE p.merchant_id = $1
         GROUP BY p.category
         ORDER BY revenue DESC`,
        [merchantId]
      );

      return result.rows.map(r => ({
        category: r.category,
        orders: parseInt(r.orders, 10) || 0,
        items_sold: parseInt(r.items_sold, 10) || 0,
        revenue: Number(r.revenue) || 0
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
