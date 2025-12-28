const db = require('../config/database');

class AdminDashboardService {
  /**
   * Get admin dashboard with merchant income segregation
   */
  async getAdminDashboard() {
    try {
      const [merchantStats, orderStats, riderStats, revenueStats] = await Promise.all([
        this.getMerchantsByIncome(),
        this.getOrderStatistics(),
        this.getRiderStatistics(),
        this.getRevenueStatistics()
      ]);

      return {
        merchants: merchantStats,
        orders: orderStats,
        riders: riderStats,
        revenue: revenueStats
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get merchants segregated by income levels
   */
  async getMerchantsByIncome() {
    try {
      const result = await db.query(`
        SELECT 
          u.id,
          u.name,
          u.phone,
          u.created_at,
          COALESCE(SUM(ms.total_amount), 0) as total_revenue,
          COALESCE(SUM(ms.net_amount), 0) as net_revenue,
          COUNT(DISTINCT ms.order_id) as total_orders,
          COUNT(DISTINCT p.id) as total_products,
          CASE 
            WHEN COALESCE(SUM(ms.total_amount), 0) >= 10000 THEN 'High'
            WHEN COALESCE(SUM(ms.total_amount), 0) >= 5000 THEN 'Medium'
            WHEN COALESCE(SUM(ms.total_amount), 0) >= 1000 THEN 'Low'
            ELSE 'New'
          END as income_tier
        FROM users u
        LEFT JOIN products p ON u.id = p.merchant_id
        LEFT JOIN merchant_sales ms ON u.id = ms.merchant_id AND ms.status = 'confirmed'
        WHERE u.role = 'merchant'
        GROUP BY u.id, u.name, u.phone, u.created_at
        ORDER BY total_revenue DESC
      `);

      const merchants = result.rows;
      
      // Group by income tier
      const tiers = {
        High: merchants.filter(m => m.income_tier === 'High'),
        Medium: merchants.filter(m => m.income_tier === 'Medium'),
        Low: merchants.filter(m => m.income_tier === 'Low'),
        New: merchants.filter(m => m.income_tier === 'New')
      };

      return {
        total_merchants: merchants.length,
        by_tier: tiers,
        summary: {
          high_performers: tiers.High.length,
          medium_performers: tiers.Medium.length,
          low_performers: tiers.Low.length,
          new_merchants: tiers.New.length
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
          COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders,
          COUNT(CASE WHEN rider_id IS NULL THEN 1 END) as unassigned_orders,
          AVG(total_amount) as avg_order_value,
          SUM(total_amount) as total_order_value
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get rider statistics
   */
  async getRiderStatistics() {
    try {
      const result = await db.query(`
        SELECT 
          u.id,
          u.name,
          u.phone,
          COUNT(o.id) as total_deliveries,
          COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as completed_deliveries,
          COUNT(CASE WHEN o.order_status IN ('in_transit', 'ready') THEN 1 END) as active_deliveries,
          AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.assigned_at))/60) as avg_delivery_time_minutes
        FROM users u
        LEFT JOIN orders o ON u.id = o.rider_id
        WHERE u.role = 'rider'
        GROUP BY u.id, u.name, u.phone
        ORDER BY completed_deliveries DESC
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStatistics() {
    try {
      const result = await db.query(`
        SELECT 
          SUM(total_amount) as total_revenue,
          SUM(commission_amount) as platform_commission,
          SUM(net_amount) as merchant_earnings,
          COUNT(*) as total_transactions,
          AVG(total_amount) as avg_transaction_value
        FROM merchant_sales
        WHERE status = 'confirmed'
          AND sale_date >= CURRENT_DATE - INTERVAL '30 days'
      `);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminDashboardService();