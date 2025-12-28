const db = require('../config/database');

class MerchantFinancialService {
  /**
   * Get merchant sales summary
   * @param {number} merchantId - Merchant user ID
   * @param {Object} filters - Date range and other filters
   * @returns {Promise<Object>} Sales summary
   */
  async getMerchantSalesSummary(merchantId, filters = {}) {
    try {
      const { start_date, end_date, status = 'confirmed' } = filters;
      
      let query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as gross_revenue,
          SUM(commission_amount) as total_commission,
          SUM(net_amount) as net_revenue,
          AVG(total_amount) as avg_order_value
        FROM merchant_sales 
        WHERE merchant_id = $1 AND status = $2
      `;
      const params = [merchantId, status];
      let paramIndex = 3;

      if (start_date) {
        query += ` AND sale_date >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND sale_date <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed merchant sales
   * @param {number} merchantId - Merchant user ID
   * @param {Object} filters - Pagination and filters
   * @returns {Promise<Array>} Detailed sales records
   */
  async getMerchantSales(merchantId, filters = {}) {
    try {
      const { start_date, end_date, status, limit = 50, offset = 0 } = filters;
      
      let query = `
        SELECT 
          ms.*,
          p.name as product_name,
          o.tracking_number,
          o.created_at as order_date,
          u.name as customer_name
        FROM merchant_sales ms
        LEFT JOIN products p ON ms.product_id = p.id
        LEFT JOIN orders o ON ms.order_id = o.id
        LEFT JOIN users u ON o.student_id = u.id
        WHERE ms.merchant_id = $1
      `;
      const params = [merchantId];
      let paramIndex = 2;

      if (status) {
        query += ` AND ms.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (start_date) {
        query += ` AND ms.sale_date >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND ms.sale_date <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      query += ` ORDER BY ms.sale_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get merchant payout history
   * @param {number} merchantId - Merchant user ID
   * @returns {Promise<Array>} Payout history
   */
  async getMerchantPayouts(merchantId) {
    try {
      const result = await db.query(
        `SELECT * FROM merchant_payouts 
         WHERE merchant_id = $1 
         ORDER BY created_at DESC`,
        [merchantId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate pending payout for merchant
   * @param {number} merchantId - Merchant user ID
   * @returns {Promise<Object>} Pending payout details
   */
  async calculatePendingPayout(merchantId) {
    try {
      // Get all confirmed sales not yet included in payouts
      const result = await db.query(
        `SELECT 
          COUNT(*) as pending_orders,
          SUM(total_amount) as gross_amount,
          SUM(commission_amount) as total_commission,
          SUM(net_amount) as net_payout
         FROM merchant_sales ms
         WHERE ms.merchant_id = $1 
           AND ms.status = 'confirmed'
           AND ms.id NOT IN (
             SELECT DISTINCT pi.sale_id 
             FROM payout_items pi 
             JOIN merchant_payouts mp ON pi.payout_id = mp.id 
             WHERE mp.merchant_id = $1 AND mp.status != 'failed'
           )`,
        [merchantId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process payout for merchant
   * @param {number} merchantId - Merchant user ID
   * @param {Object} payoutData - Payout details
   * @returns {Promise<Object>} Created payout record
   */
  async processPayout(merchantId, payoutData = {}) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Calculate pending payout
      const pendingResult = await client.query(
        `SELECT 
          ms.id as sale_id,
          ms.net_amount,
          SUM(ms.total_amount) OVER() as gross_total,
          SUM(ms.commission_amount) OVER() as commission_total,
          SUM(ms.net_amount) OVER() as net_total
         FROM merchant_sales ms
         WHERE ms.merchant_id = $1 
           AND ms.status = 'confirmed'
           AND ms.id NOT IN (
             SELECT DISTINCT pi.sale_id 
             FROM payout_items pi 
             JOIN merchant_payouts mp ON pi.payout_id = mp.id 
             WHERE mp.merchant_id = $1 AND mp.status != 'failed'
           )`,
        [merchantId]
      );

      if (pendingResult.rows.length === 0) {
        throw new Error('No pending sales to payout');
      }

      const sales = pendingResult.rows;
      const totalGross = parseFloat(sales[0].gross_total);
      const totalCommission = parseFloat(sales[0].commission_total);
      const netPayout = parseFloat(sales[0].net_total);

      // Create payout record
      const payoutResult = await client.query(
        `INSERT INTO merchant_payouts (
          merchant_id, total_amount, commission_deducted, net_payout, 
          payout_method, status
        ) VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING *`,
        [merchantId, totalGross, totalCommission, netPayout, payoutData.payout_method || 'bank_transfer']
      );

      const payout = payoutResult.rows[0];

      // Create payout items
      for (const sale of sales) {
        await client.query(
          `INSERT INTO payout_items (payout_id, sale_id, amount)
           VALUES ($1, $2, $3)`,
          [payout.id, sale.sale_id, sale.net_amount]
        );
      }

      await client.query('COMMIT');
      return payout;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get merchant financial dashboard data
   * @param {number} merchantId - Merchant user ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getMerchantDashboard(merchantId) {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const [summary, pending, recentSales, transactions, returns] = await Promise.all([
        this.getMerchantSalesSummary(merchantId, { 
          start_date: currentMonth.toISOString() 
        }),
        this.calculatePendingPayout(merchantId),
        this.getMerchantSales(merchantId, { limit: 10 }),
        this.getTransactionDetails(merchantId),
        this.getReturnDetails(merchantId)
      ]);

      return {
        current_month_summary: summary,
        pending_payout: pending,
        recent_sales: recentSales,
        transactions: transactions,
        returns: returns
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed transaction information
   */
  async getTransactionDetails(merchantId) {
    try {
      const result = await db.query(`
        SELECT 
          DATE(ms.sale_date) as transaction_date,
          COUNT(*) as transaction_count,
          SUM(ms.total_amount) as daily_revenue,
          SUM(ms.commission_amount) as daily_commission,
          SUM(ms.net_amount) as daily_net,
          AVG(ms.total_amount) as avg_transaction_value
        FROM merchant_sales ms
        WHERE ms.merchant_id = $1 
          AND ms.status = 'confirmed'
          AND ms.sale_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(ms.sale_date)
        ORDER BY transaction_date DESC
      `, [merchantId]);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get return/cancellation details
   */
  async getReturnDetails(merchantId) {
    try {
      const result = await db.query(`
        SELECT 
          o.id as order_id,
          o.tracking_number,
          o.total_amount,
          o.order_status,
          o.updated_at as cancelled_at,
          u.name as customer_name,
          osh.notes as cancellation_reason
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN order_status_history osh ON o.id = osh.order_id AND osh.status = 'cancelled'
        WHERE o.merchant_id = $1 
          AND o.order_status = 'cancelled'
          AND o.updated_at >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY o.updated_at DESC
      `, [merchantId]);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get sales by product for merchant
   * @param {number} merchantId - Merchant user ID
   * @param {Object} filters - Date filters
   * @returns {Promise<Array>} Product sales breakdown
   */
  async getProductSalesBreakdown(merchantId, filters = {}) {
    try {
      const { start_date, end_date } = filters;
      
      let query = `
        SELECT 
          p.id,
          p.name,
          p.category,
          p.stock_quantity,
          COUNT(ms.id) as total_orders,
          SUM(ms.quantity) as total_quantity_sold,
          SUM(ms.total_amount) as gross_revenue,
          SUM(ms.net_amount) as net_revenue,
          AVG(ms.unit_price) as avg_price,
          COUNT(CASE WHEN o.order_status = 'cancelled' THEN 1 END) as returns_count
        FROM products p
        LEFT JOIN merchant_sales ms ON p.id = ms.product_id AND ms.status = 'confirmed'
        LEFT JOIN orders o ON ms.order_id = o.id
        WHERE p.merchant_id = $1
      `;
      const params = [merchantId];
      let paramIndex = 2;

      if (start_date) {
        query += ` AND (ms.sale_date IS NULL OR ms.sale_date >= $${paramIndex})`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND (ms.sale_date IS NULL OR ms.sale_date <= $${paramIndex})`;
        params.push(end_date);
        paramIndex++;
      }

      query += ` GROUP BY p.id, p.name, p.category, p.stock_quantity ORDER BY gross_revenue DESC NULLS LAST`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MerchantFinancialService();