/**
 * Token Service
 * Handles token credit operations including PIN-based top-ups
 */

const db = require('../config/database');

class TokenService {
  /**
   * Generate a new token PIN
   * @param {number} amount - Amount of credits
   * @param {string} createdBy - Who created this PIN
   * @param {Date} expiresAt - Optional expiration date
   * @returns {Promise<Object>} Generated PIN details
   */
  async generatePIN(amount, createdBy = 'SYSTEM', expiresAt = null) {
    try {
      // Generate a 17-digit PIN
      const pin = this.generate17DigitPIN();

      const query = `
        INSERT INTO token_pins (pin_code, amount, created_by, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await db.query(query, [pin, amount, createdBy, expiresAt]);
      return result.rows[0];
    } catch (error) {
      console.error('Generate PIN error:', error);
      throw new Error('Failed to generate PIN');
    }
  }

  /**
   * Generate a 17-digit PIN
   * @returns {string} 17-digit PIN
   */
  generate17DigitPIN() {
    // Generate a random 17-digit number
    let pin = '';
    for (let i = 0; i < 17; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    return pin;
  }

  /**
   * Validate and redeem a token PIN
   * @param {string} pinCode - The 17-digit PIN code
   * @param {number} userId - User redeeming the PIN
   * @returns {Promise<Object>} Top-up result
   */
  async redeemPIN(pinCode, userId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Validate PIN code format
      if (!/^\d{17}$/.test(pinCode)) {
        throw new Error('Invalid PIN format. Must be exactly 17 digits.');
      }

      // Find the PIN
      const pinQuery = `
        SELECT * FROM token_pins
        WHERE pin_code = $1
        FOR UPDATE
      `;
      const pinResult = await client.query(pinQuery, [pinCode]);

      if (pinResult.rows.length === 0) {
        throw new Error('Invalid PIN code');
      }

      const pin = pinResult.rows[0];

      // Check if already used
      if (pin.is_used) {
        throw new Error('PIN code has already been used');
      }

      // Check if expired
      if (pin.expires_at && new Date(pin.expires_at) < new Date()) {
        throw new Error('PIN code has expired');
      }

      // Mark PIN as used
      const updatePinQuery = `
        UPDATE token_pins
        SET is_used = true,
            used_by = $1,
            used_at = NOW()
        WHERE id = $2
      `;
      await client.query(updatePinQuery, [userId, pin.id]);

      // Get or create user's token credits account
      let tokenAccount = await this.getOrCreateTokenAccount(client, userId);

      // Add credits to user's account
      const newBalance = parseFloat(tokenAccount.balance) + parseFloat(pin.amount);
      const updateBalanceQuery = `
        UPDATE token_credits
        SET balance = $1,
            last_topup_at = NOW()
        WHERE user_id = $2
        RETURNING *
      `;
      const balanceResult = await client.query(updateBalanceQuery, [newBalance, userId]);

      await client.query('COMMIT');

      return {
        success: true,
        message: `Successfully added ${pin.amount} token credits`,
        amount: parseFloat(pin.amount),
        newBalance: parseFloat(balanceResult.rows[0].balance)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Redeem PIN error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get or create token credits account for user
   * @param {Object} client - Database client
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Token account
   */
  async getOrCreateTokenAccount(client, userId) {
    // Try to get existing account
    const getQuery = 'SELECT * FROM token_credits WHERE user_id = $1';
    const getResult = await client.query(getQuery, [userId]);

    if (getResult.rows.length > 0) {
      return getResult.rows[0];
    }

    // Create new account
    const createQuery = `
      INSERT INTO token_credits (user_id, balance)
      VALUES ($1, 0)
      RETURNING *
    `;
    const createResult = await client.query(createQuery, [userId]);
    return createResult.rows[0];
  }

  /**
   * Get user's token balance
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Token balance info
   */
  async getBalance(userId) {
    try {
      const query = `
        SELECT balance, last_topup_at
        FROM token_credits
        WHERE user_id = $1
      `;
      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        return { balance: 0, last_topup_at: null };
      }

      return {
        balance: parseFloat(result.rows[0].balance),
        last_topup_at: result.rows[0].last_topup_at
      };
    } catch (error) {
      console.error('Get balance error:', error);
      throw new Error('Failed to get token balance');
    }
  }

  /**
   * Get user's top-up history
   * @param {number} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Top-up history
   */
  async getTopupHistory(userId, limit = 20) {
    try {
      const query = `
        SELECT pin_code, amount, used_at
        FROM token_pins
        WHERE used_by = $1
        ORDER BY used_at DESC
        LIMIT $2
      `;
      const result = await db.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Get topup history error:', error);
      throw new Error('Failed to get top-up history');
    }
  }

  /**
   * Deduct tokens from user's account (for payment processing)
   * @param {number} userId - User ID
   * @param {number} amount - Amount to deduct
   * @returns {Promise<Object>} Updated balance
   */
  async deductTokens(userId, amount) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Get current balance
      const balanceQuery = `
        SELECT balance FROM token_credits
        WHERE user_id = $1
        FOR UPDATE
      `;
      const balanceResult = await client.query(balanceQuery, [userId]);

      if (balanceResult.rows.length === 0) {
        throw new Error('Token account not found');
      }

      const currentBalance = parseFloat(balanceResult.rows[0].balance);

      if (currentBalance < amount) {
        throw new Error(`Insufficient token credits. Required: ${amount}, Available: ${currentBalance}`);
      }

      // Deduct amount
      const newBalance = currentBalance - amount;
      const updateQuery = `
        UPDATE token_credits
        SET balance = $1
        WHERE user_id = $2
        RETURNING *
      `;
      const updateResult = await client.query(updateQuery, [newBalance, userId]);

      await client.query('COMMIT');

      return {
        success: true,
        previousBalance: currentBalance,
        amountDeducted: amount,
        newBalance: parseFloat(updateResult.rows[0].balance)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Admin: Generate multiple PINs in bulk
   * @param {number} count - Number of PINs to generate
   * @param {number} amount - Amount per PIN
   * @param {string} createdBy - Who created these PINs
   * @returns {Promise<Array>} Generated PINs
   */
  async bulkGeneratePINs(count, amount, createdBy = 'ADMIN') {
    const pins = [];

    for (let i = 0; i < count; i++) {
      try {
        const pin = await this.generatePIN(amount, createdBy);
        pins.push(pin);
      } catch (error) {
        console.error(`Failed to generate PIN ${i + 1}:`, error);
      }
    }

    return pins;
  }
}

module.exports = new TokenService();
