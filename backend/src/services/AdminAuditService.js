const db = require('../config/database');

class AdminAuditService {
  async getSystemStats() {
    try {
      const result = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_customers,
          (SELECT COUNT(*) FROM users WHERE role = 'merchant') as total_merchants,
          (SELECT COUNT(*) FROM users WHERE role = 'rider') as total_riders,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COUNT(*) FROM orders WHERE order_status = 'delivered') as completed_orders,
          (SELECT COUNT(*) FROM orders WHERE order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'in_delivery')) as active_orders,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'delivered') as total_revenue,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'delivered' AND delivered_at >= CURRENT_DATE) as today_revenue
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getMerchantAudit(filters = {}) {
    try {
      const { limit = 50, offset = 0 } = filters;
      const result = await db.query(`
        SELECT 
          u.id,
          u.name,
          u.phone,
          u.is_verified,
          u.created_at,
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT o.id) as total_orders,
          COUNT(DISTINCT CASE WHEN o.order_status = 'delivered' THEN o.id END) as completed_orders,
          COALESCE(SUM(CASE WHEN o.order_status = 'delivered' THEN o.total_amount END), 0) as total_sales,
          COALESCE(AVG(CASE WHEN o.order_status = 'delivered' THEN EXTRACT(EPOCH FROM (o.delivered_at - o.created_at))/3600 END), 0) as avg_fulfillment_hours
        FROM users u
        LEFT JOIN products p ON u.id = p.merchant_id
        LEFT JOIN orders o ON u.id = o.merchant_id
        WHERE u.role = 'merchant'
        GROUP BY u.id, u.name, u.phone, u.is_verified, u.created_at
        ORDER BY total_sales DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getRiderAudit(filters = {}) {
    try {
      const { limit = 50, offset = 0 } = filters;
      const result = await db.query(`
        SELECT 
          u.id,
          u.name,
          u.phone,
          u.is_verified,
          u.created_at,
          COUNT(o.id) as total_deliveries,
          COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as completed_deliveries,
          COUNT(CASE WHEN o.order_status IN ('ready', 'in_delivery') THEN 1 END) as active_deliveries,
          COALESCE(AVG(CASE WHEN o.order_status = 'delivered' THEN EXTRACT(EPOCH FROM (o.delivered_at - o.assigned_at))/60 END), 0) as avg_delivery_minutes,
          COUNT(CASE WHEN o.order_status = 'delivered' AND o.delivered_at <= (o.assigned_at + INTERVAL '60 minutes') THEN 1 END) as on_time_deliveries,
          MAX(o.delivered_at) as last_delivery
        FROM users u
        LEFT JOIN orders o ON u.id = o.rider_id
        WHERE u.role = 'rider'
        GROUP BY u.id, u.name, u.phone, u.is_verified, u.created_at
        ORDER BY completed_deliveries DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerAudit(filters = {}) {
    try {
      const { limit = 50, offset = 0 } = filters;
      const result = await db.query(`
        SELECT 
          u.id,
          u.name,
          u.phone,
          u.is_verified,
          u.created_at,
          COUNT(o.id) as total_orders,
          COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN o.order_status = 'cancelled' THEN 1 END) as cancelled_orders,
          COALESCE(SUM(CASE WHEN o.order_status = 'delivered' THEN o.total_amount END), 0) as total_spent,
          COALESCE(AVG(CASE WHEN o.order_status = 'delivered' THEN o.total_amount END), 0) as avg_order_value,
          MAX(o.created_at) as last_order_date
        FROM users u
        LEFT JOIN orders o ON u.id = o.student_id
        WHERE u.role = 'student'
        GROUP BY u.id, u.name, u.phone, u.is_verified, u.created_at
        ORDER BY total_spent DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getUserDetail(userId) {
    try {
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) throw new Error('User not found');
      
      const user = userResult.rows[0];
      let details = { ...user };

      if (user.role === 'merchant') {
        const products = await db.query('SELECT * FROM products WHERE merchant_id = $1 ORDER BY created_at DESC', [userId]);
        const orders = await db.query(`
          SELECT o.*, u.name as customer_name 
          FROM orders o 
          LEFT JOIN users u ON o.student_id = u.id 
          WHERE o.merchant_id = $1 
          ORDER BY o.created_at DESC LIMIT 20
        `, [userId]);
        const salesStats = await db.query(`
          SELECT 
            COALESCE(SUM(CASE WHEN o.order_status = 'delivered' AND o.delivered_at >= CURRENT_DATE THEN o.total_amount END), 0) as today_sales,
            COALESCE(SUM(CASE WHEN o.order_status = 'delivered' AND o.delivered_at >= CURRENT_DATE - INTERVAL '7 days' THEN o.total_amount END), 0) as week_sales,
            COALESCE(SUM(CASE WHEN o.order_status = 'delivered' AND o.delivered_at >= CURRENT_DATE - INTERVAL '30 days' THEN o.total_amount END), 0) as month_sales
          FROM orders o WHERE o.merchant_id = $1
        `, [userId]);
        const dailySales = await db.query(`
          SELECT DATE(delivered_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
          FROM orders
          WHERE merchant_id = $1 AND order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(delivered_at)
          ORDER BY date DESC
        `, [userId]);
        details.products = products.rows;
        details.orders = orders.rows;
        details.sales_stats = salesStats.rows[0];
        details.daily_sales = dailySales.rows;
      } else if (user.role === 'rider') {
        const deliveries = await db.query(`
          SELECT o.*, u.name as customer_name, m.name as merchant_name
          FROM orders o
          LEFT JOIN users u ON o.student_id = u.id
          LEFT JOIN users m ON o.merchant_id = m.id
          WHERE o.rider_id = $1
          ORDER BY o.created_at DESC LIMIT 20
        `, [userId]);
        details.deliveries = deliveries.rows;
      } else if (user.role === 'student') {
        const orders = await db.query(`
          SELECT o.*, m.name as merchant_name, r.name as rider_name
          FROM orders o
          LEFT JOIN users m ON o.merchant_id = m.id
          LEFT JOIN users r ON o.rider_id = r.id
          WHERE o.student_id = $1
          ORDER BY o.created_at DESC LIMIT 20
        `, [userId]);
        details.orders = orders.rows;
      }

      return details;
    } catch (error) {
      throw error;
    }
  }

  async refundOrder(orderId, adminId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      const order = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      if (order.rows.length === 0) throw new Error('Order not found');
      
      await client.query(
        `UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );
      
      await client.query(
        `UPDATE escrow SET status = 'refunded', released_at = NOW() WHERE order_id = $1`,
        [orderId]
      );
      
      await client.query(
        `UPDATE products p SET stock_quantity = stock_quantity + oi.quantity
         FROM order_items oi
         WHERE p.id = oi.product_id AND oi.order_id = $1 AND p.stock_quantity IS NOT NULL`,
        [orderId]
      );
      
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, 'cancelled', 'Refunded by admin', $2, 'admin')`,
        [orderId, adminId]
      );
      
      await client.query('COMMIT');
      return { message: 'Order refunded successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrderAudit(filters = {}) {
    try {
      const { status, startDate, endDate, limit = 50, offset = 0 } = filters;
      let query = `
        SELECT 
          o.*,
          u.name as customer_name,
          u.phone as customer_phone,
          m.name as merchant_name,
          r.name as rider_name,
          EXTRACT(EPOCH FROM (o.delivered_at - o.created_at))/3600 as fulfillment_hours
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN users m ON o.merchant_id = m.id
        LEFT JOIN users r ON o.rider_id = r.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND o.order_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      if (startDate) {
        query += ` AND o.created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }
      if (endDate) {
        query += ` AND o.created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async toggleUserStatus(userId, isVerified) {
    try {
      const result = await db.query(
        'UPDATE users SET is_verified = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [isVerified, userId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminAuditService();
