const db = require('../config/database');

class PaymentService {
  /**
   * Process payment with fallback logic:
   * 1. Orange Money (primary)
   * 2. Token Credits (fallback)
   * 3. Cash on Delivery (final fallback)
   *
   * @param {number} orderId - Order ID
   * @param {number} userId - User making payment
   * @param {string} preferredMethod - Preferred payment method
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(orderId, userId, preferredMethod = 'orange_money') {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Get order details
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      // Verify user is the customer
      if (order.student_id !== userId) {
        throw new Error('Unauthorized: You can only pay for your own orders');
      }

      // Check if order is already paid
      if (order.payment_status === 'completed') {
        throw new Error('Order is already paid');
      }

      // Check if order is cancelled
      if (order.status === 'cancelled') {
        throw new Error('Cannot pay for a cancelled order');
      }

      const amount = parseFloat(order.total_amount);
      let paymentMethod = preferredMethod;
      let paymentResult;

      // Try payment methods in order
      if (preferredMethod === 'orange_money') {
        paymentResult = await this._processOrangeMoney(orderId, userId, amount, client);

        if (!paymentResult.success) {
          console.log('Orange Money failed, trying Token Credits...');
          paymentResult = await this._processTokenCredits(orderId, userId, amount, client);
          paymentMethod = 'token_credits';

          if (!paymentResult.success) {
            console.log('Token Credits failed, falling back to Cash...');
            paymentResult = await this._processCash(orderId, userId, amount, client);
            paymentMethod = 'cash';
          }
        }
      } else if (preferredMethod === 'token_credits') {
        paymentResult = await this._processTokenCredits(orderId, userId, amount, client);

        if (!paymentResult.success) {
          console.log('Token Credits failed, falling back to Cash...');
          paymentResult = await this._processCash(orderId, userId, amount, client);
          paymentMethod = 'cash';
        }
      } else if (preferredMethod === 'cash') {
        paymentResult = await this._processCash(orderId, userId, amount, client);
      } else {
        throw new Error('Invalid payment method. Use: orange_money, token_credits, or cash');
      }

      // Update order payment info
      const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'completed';

      await client.query(
        `UPDATE orders
         SET payment_method = $1, payment_status = $2, updated_at = NOW()
         WHERE id = $3`,
        [paymentMethod, paymentStatus, orderId]
      );

      // Create escrow entry if payment is completed (not cash)
      if (paymentStatus === 'completed') {
        await client.query(
          `INSERT INTO escrow (order_id, amount, status)
           VALUES ($1, $2, 'held')`,
          [orderId, amount]
        );
      }

      await client.query('COMMIT');

      return {
        success: true,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        amount: amount,
        message: paymentResult.message,
        order_id: orderId
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process Orange Money payment
   * @private
   */
  async _processOrangeMoney(orderId, userId, amount, client) {
    try {
      // TODO: Integrate with actual Orange Money API
      // For now, simulate Orange Money processing

      // Check if Orange Money credentials are configured
      if (!process.env.ORANGE_MONEY_API_KEY || !process.env.ORANGE_MONEY_MERCHANT_ID) {
        console.log('Orange Money not configured');
        return {
          success: false,
          message: 'Orange Money not configured. Trying next payment method...'
        };
      }

      // Simulate Orange Money API call
      // In production, this would call the actual Orange Money API
      const simulateSuccess = Math.random() > 0.3; // 70% success rate for demo

      if (simulateSuccess) {
        console.log(`✅ Orange Money payment successful for order ${orderId}`);
        return {
          success: true,
          message: 'Payment processed successfully via Orange Money',
          transaction_id: `OM${Date.now()}`
        };
      } else {
        console.log(`❌ Orange Money payment failed for order ${orderId}`);
        return {
          success: false,
          message: 'Orange Money transaction failed'
        };
      }
    } catch (error) {
      console.error('Orange Money error:', error);
      return {
        success: false,
        message: 'Orange Money service unavailable'
      };
    }
  }

  /**
   * Process Token Credits payment
   * @private
   */
  async _processTokenCredits(orderId, userId, amount, client) {
    try {
      // Check user's token balance
      const balanceResult = await client.query(
        'SELECT balance FROM token_credits WHERE user_id = $1',
        [userId]
      );

      if (balanceResult.rows.length === 0) {
        // Create token credits account with 0 balance
        await client.query(
          'INSERT INTO token_credits (user_id, balance) VALUES ($1, 0.00)',
          [userId]
        );

        return {
          success: false,
          message: 'Insufficient token credits. Balance: 0.00'
        };
      }

      const balance = parseFloat(balanceResult.rows[0].balance);

      if (balance < amount) {
        console.log(`❌ Insufficient token credits. Required: ${amount}, Available: ${balance}`);
        return {
          success: false,
          message: `Insufficient token credits. Required: ${amount}, Available: ${balance}`
        };
      }

      // Deduct from balance
      await client.query(
        `UPDATE token_credits
         SET balance = balance - $1
         WHERE user_id = $2`,
        [amount, userId]
      );

      // Calculate new balance
      const newBalance = balance - amount;

      // Record transaction
      await client.query(
        `INSERT INTO token_transactions (user_id, amount, type, reference_id, balance_after)
         VALUES ($1, $2, 'debit', $3, $4)`,
        [userId, amount, orderId, newBalance]
      );

      console.log(`✅ Token Credits payment successful for order ${orderId}`);
      return {
        success: true,
        message: `Payment processed successfully via Token Credits. New balance: ${balance - amount}`,
        new_balance: balance - amount
      };
    } catch (error) {
      console.error('Token Credits error:', error);
      return {
        success: false,
        message: 'Token Credits service unavailable'
      };
    }
  }

  /**
   * Process Cash on Delivery
   * @private
   */
  async _processCash(orderId, userId, amount, client) {
    // Cash on delivery always succeeds but payment is marked as pending
    console.log(`💵 Cash on Delivery selected for order ${orderId}`);
    return {
      success: true,
      message: `Order placed. Pay ${amount} in cash upon delivery.`
    };
  }

  /**
   * Add token credits to user account
   * @param {number} userId - User ID
   * @param {number} amount - Amount to add
   * @param {string} description - Transaction description
   * @returns {Promise<Object>} New balance
   */
  async addTokenCredits(userId, amount, description = 'Token credit top-up') {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Check if user has token credits account
      const checkResult = await client.query(
        'SELECT balance FROM token_credits WHERE user_id = $1',
        [userId]
      );

      let newBalance;

      if (checkResult.rows.length === 0) {
        // Create account
        const result = await client.query(
          'INSERT INTO token_credits (user_id, balance) VALUES ($1, $2) RETURNING balance',
          [userId, amount]
        );
        newBalance = parseFloat(result.rows[0].balance);
      } else {
        // Update balance
        const result = await client.query(
          `UPDATE token_credits
           SET balance = balance + $1, last_topup_at = NOW()
           WHERE user_id = $2
           RETURNING balance`,
          [amount, userId]
        );
        newBalance = parseFloat(result.rows[0].balance);
      }

      // Record transaction
      await client.query(
        `INSERT INTO token_transactions (user_id, amount, type, balance_after)
         VALUES ($1, $2, 'credit', $3)`,
        [userId, amount, newBalance]
      );

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Token credits added successfully',
        amount_added: amount,
        new_balance: newBalance
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user's token balance and transaction history
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Balance and transactions
   */
  async getTokenCreditsInfo(userId) {
    try {
      // Get balance
      const balanceResult = await db.query(
        'SELECT balance, created_at, updated_at FROM token_credits WHERE user_id = $1',
        [userId]
      );

      let balance = 0;
      let account = null;

      if (balanceResult.rows.length > 0) {
        balance = parseFloat(balanceResult.rows[0].balance);
        account = balanceResult.rows[0];
      }

      // Get recent transactions
      const transactionsResult = await db.query(
        `SELECT * FROM token_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [userId]
      );

      return {
        balance,
        account,
        transactions: transactionsResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment information for an order
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Payment and escrow info
   */
  async getPaymentInfo(orderId) {
    try {
      const orderResult = await db.query(
        'SELECT id, total_amount, payment_method, payment_status FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      // Get escrow info if exists
      const escrowResult = await db.query(
        'SELECT * FROM escrow WHERE order_id = $1',
        [orderId]
      );

      return {
        order_id: order.id,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        escrow: escrowResult.rows.length > 0 ? escrowResult.rows[0] : null
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PaymentService();
