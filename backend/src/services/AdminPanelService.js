const db = require('../config/database');

class AdminPanelService {
  /**
   * Get detailed merchant information with filters
   */
  async getMerchantsDetail(filters = {}) {
    try {
      const { search, income_tier, limit = 20, offset = 0 } = filters;
      
      let query = `
        SELECT 
          u.id,
          u.name,
          u.phone,
          u.created_at,
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(ms.total_amount), 0) as total_revenue,
          COALESCE(SUM(ms.net_amount), 0) as net_revenue,
          COALESCE(SUM(ms.commission_amount), 0) as total_commission,
          COUNT(DISTINCT CASE WHEN o.order_status = 'delivered' THEN o.id END) as delivered_orders,
          COUNT(DISTINCT CASE WHEN o.order_status = 'cancelled' THEN o.id END) as cancelled_orders,
          CASE 
            WHEN COALESCE(SUM(ms.total_amount), 0) >= 10000 THEN 'High'
            WHEN COALESCE(SUM(ms.total_amount), 0) >= 5000 THEN 'Medium'
            WHEN COALESCE(SUM(ms.total_amount), 0) >= 1000 THEN 'Low'
            ELSE 'New'
          END as income_tier
        FROM users u
        LEFT JOIN products p ON u.id = p.merchant_id
        LEFT JOIN orders o ON u.id = o.merchant_id
        LEFT JOIN merchant_sales ms ON u.id = ms.merchant_id AND ms.status = 'confirmed'
        WHERE u.role = 'merchant'
      `;
      
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (u.name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` GROUP BY u.id, u.name, u.phone, u.created_at`;

      if (income_tier) {
        query += ` HAVING CASE 
          WHEN COALESCE(SUM(ms.total_amount), 0) >= 10000 THEN 'High'
          WHEN COALESCE(SUM(ms.total_amount), 0) >= 5000 THEN 'Medium'
          WHEN COALESCE(SUM(ms.total_amount), 0) >= 1000 THEN 'Low'
          ELSE 'New'
        END = $${paramIndex}`;
        params.push(income_tier);
        paramIndex++;
      }

      query += ` ORDER BY total_revenue DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed customer information with order history
   */
  async getCustomersDetail(filters = {}) {
    try {
      const { search, limit = 20, offset = 0 } = filters;
      
      let query = `
        SELECT 
          u.id,
          u.name,
          u.phone,
          u.created_at,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(o.total_amount), 0) as total_spent,
          COUNT(DISTINCT CASE WHEN o.order_status = 'delivered' THEN o.id END) as completed_orders,
          COUNT(DISTINCT CASE WHEN o.order_status = 'cancelled' THEN o.id END) as cancelled_orders,
          MAX(o.created_at) as last_order_date
        FROM users u
        LEFT JOIN orders o ON u.id = o.student_id
        WHERE u.role = 'student'
      `;
      
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (u.name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` GROUP BY u.id, u.name, u.phone, u.created_at`;
      query += ` ORDER BY total_spent DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get merchant detail with all transactions
   */
  async getMerchantDetail(merchantId) {
    try {
      const [merchant, sales, products, payouts] = await Promise.all([
        db.query(`
          SELECT 
            u.id, u.name, u.phone, u.created_at,
            COUNT(DISTINCT p.id) as total_products,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(ms.total_amount), 0) as total_revenue,
            COALESCE(SUM(ms.net_amount), 0) as net_revenue
          FROM users u
          LEFT JOIN products p ON u.id = p.merchant_id
          LEFT JOIN orders o ON u.id = o.merchant_id
          LEFT JOIN merchant_sales ms ON u.id = ms.merchant_id AND ms.status = 'confirmed'
          WHERE u.id = $1 AND u.role = 'merchant'
          GROUP BY u.id, u.name, u.phone, u.created_at
        `, [merchantId]),
        
        db.query(`
          SELECT 
            DATE(ms.sale_date) as date,
            COUNT(*) as transactions,
            SUM(ms.total_amount) as daily_revenue,
            SUM(ms.commission_amount) as commission,
            SUM(ms.net_amount) as net_amount
          FROM merchant_sales ms
          WHERE ms.merchant_id = $1 AND ms.status = 'confirmed'
          GROUP BY DATE(ms.sale_date)
          ORDER BY date DESC
          LIMIT 30
        `, [merchantId]),
        
        db.query(`
          SELECT id, name, price, stock_quantity, is_active, created_at
          FROM products
          WHERE merchant_id = $1
          ORDER BY created_at DESC
        `, [merchantId]),
        
        db.query(`
          SELECT * FROM merchant_payouts
          WHERE merchant_id = $1
          ORDER BY created_at DESC
          LIMIT 10
        `, [merchantId])
      ]);

      return {
        merchant: merchant.rows[0],
        sales_history: sales.rows,
        products: products.rows,
        payouts: payouts.rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get customer detail with order history
   */
  async getCustomerDetail(customerId) {
    try {
      const [customer, orders] = await Promise.all([
        db.query(`
          SELECT 
            u.id, u.name, u.phone, u.created_at,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.student_id
          WHERE u.id = $1 AND u.role = 'student'
          GROUP BY u.id, u.name, u.phone, u.created_at
        `, [customerId]),
        
        db.query(`
          SELECT 
            o.id, o.tracking_number, o.total_amount, o.order_status,
            o.created_at, o.delivered_at,
            m.name as merchant_name,
            COUNT(oi.id) as item_count
          FROM orders o
          LEFT JOIN users m ON o.merchant_id = m.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          WHERE o.student_id = $1
          GROUP BY o.id, o.tracking_number, o.total_amount, o.order_status,
                   o.created_at, o.delivered_at, m.name
          ORDER BY o.created_at DESC
        `, [customerId])
      ]);

      return {
        customer: customer.rows[0],
        orders: orders.rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all riders with performance metrics
   */
  async getRidersDetail(filters = {}) {
    try {
      const { search, limit = 20, offset = 0 } = filters;
      
      let query = `
        SELECT 
          u.id, u.name, u.phone, u.created_at,
          COUNT(DISTINCT o.id) as total_deliveries,
          COUNT(DISTINCT CASE WHEN o.order_status = 'delivered' THEN o.id END) as completed_deliveries,
          COUNT(DISTINCT CASE WHEN o.order_status IN ('in_transit', 'ready') THEN o.id END) as active_deliveries,
          AVG(EXTRACT(EPOCH FROM (o.delivered_at - o.assigned_at))/60) as avg_delivery_time_minutes,
          COUNT(DISTINCT CASE WHEN o.delivered_at <= (o.assigned_at + INTERVAL '60 minutes') THEN o.id END) as on_time_deliveries
        FROM users u
        LEFT JOIN orders o ON u.id = o.rider_id
        WHERE u.role = 'rider'
      `;
      
      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (u.name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` GROUP BY u.id, u.name, u.phone, u.created_at`;
      query += ` ORDER BY completed_deliveries DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminPanelService();