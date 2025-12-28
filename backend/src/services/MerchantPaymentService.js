const db = require('../config/database');

class MerchantPaymentService {
  async processMerchantPayment(orderId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Check if payment already processed for this order (idempotency)
      const existingPayment = await client.query(
        'SELECT id, amount FROM merchant_transactions WHERE order_id = $1 AND type = $2',
        [orderId, 'credit']
      );

      if (existingPayment.rows.length > 0) {
        // Payment already processed - return success to prevent double-charging
        await client.query('COMMIT');
        return {
          success: true,
          merchant_id: null,
          amount_credited: existingPayment.rows[0].amount,
          message: 'Merchant payment already processed for this order'
        };
      }

      // Get order details
      const orderResult = await client.query(
        `SELECT o.*, e.amount as escrow_amount, e.status as escrow_status
         FROM orders o
         LEFT JOIN escrow e ON o.id = e.order_id
         WHERE o.id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      // Only process if order is delivered and escrow is held
      if (order.order_status !== 'delivered') {
        throw new Error('Order must be delivered before merchant payment');
      }

      if (order.escrow_status !== 'held') {
        throw new Error('Escrow not held for this order');
      }

      const amount = parseFloat(order.total_amount);
      const merchantId = order.merchant_id;

      // Create or update merchant balance
      const balanceCheck = await client.query(
        'SELECT balance FROM merchant_balances WHERE merchant_id = $1',
        [merchantId]
      );

      if (balanceCheck.rows.length === 0) {
        await client.query(
          'INSERT INTO merchant_balances (merchant_id, balance) VALUES ($1, $2)',
          [merchantId, amount]
        );
      } else {
        await client.query(
          'UPDATE merchant_balances SET balance = balance + $1, updated_at = NOW() WHERE merchant_id = $2',
          [amount, merchantId]
        );
      }

      // Record transaction
      await client.query(
        `INSERT INTO merchant_transactions (merchant_id, order_id, amount, type, balance_after)
         VALUES ($1, $2, $3, 'credit', (SELECT balance FROM merchant_balances WHERE merchant_id = $1))`,
        [merchantId, orderId, amount]
      );

      // Update escrow status
      await client.query(
        `UPDATE escrow SET status = 'released', released_at = NOW() WHERE order_id = $1`,
        [orderId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        merchant_id: merchantId,
        amount_credited: amount,
        message: 'Merchant payment processed successfully'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMerchantBalance(merchantId) {
    try {
      const result = await db.query(
        'SELECT balance, updated_at FROM merchant_balances WHERE merchant_id = $1',
        [merchantId]
      );

      if (result.rows.length === 0) {
        return { balance: 0, updated_at: null };
      }

      return {
        balance: parseFloat(result.rows[0].balance),
        updated_at: result.rows[0].updated_at
      };
    } catch (error) {
      throw error;
    }
  }

  async getMerchantTransactions(merchantId, limit = 50) {
    try {
      const result = await db.query(
        `SELECT mt.*, o.tracking_number
         FROM merchant_transactions mt
         LEFT JOIN orders o ON mt.order_id = o.id
         WHERE mt.merchant_id = $1
         ORDER BY mt.created_at DESC
         LIMIT $2`,
        [merchantId, limit]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MerchantPaymentService();
