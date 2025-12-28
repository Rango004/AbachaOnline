const db = require('../config/database');

class ReviewService {
  async createReview(orderId, customerId, rating, comment) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const order = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND student_id = $2 AND order_status = $3',
        [orderId, customerId, 'delivered']
      );

      if (order.rows.length === 0) {
        throw new Error('Only delivered orders can be reviewed');
      }

      const existing = await client.query(
        'SELECT id FROM reviews WHERE order_id = $1',
        [orderId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Order already reviewed');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const result = await client.query(
        `INSERT INTO reviews (order_id, customer_id, merchant_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [orderId, customerId, order.rows[0].merchant_id, rating, comment || '']
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMerchantReviews(merchantId, limit = 50, offset = 0) {
    try {
      const result = await db.query(
        `SELECT r.*, u.name as customer_name, o.tracking_number
         FROM reviews r
         JOIN users u ON r.customer_id = u.id
         JOIN orders o ON r.order_id = o.id
         WHERE r.merchant_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [merchantId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getOrderReview(orderId) {
    try {
      const result = await db.query(
        'SELECT * FROM reviews WHERE order_id = $1',
        [orderId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async getMerchantRating(merchantId) {
    try {
      const result = await db.query(
        `SELECT 
          AVG(rating) as avg_rating,
          COUNT(*) as total_reviews,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
         FROM reviews
         WHERE merchant_id = $1`,
        [merchantId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReviewService();
