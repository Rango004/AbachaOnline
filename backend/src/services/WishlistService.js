const db = require('../config/database');

class WishlistService {
  /**
   * Add product to user's wishlist
   */
  static async addToWishlist(userId, productId) {
    try {
      const result = await db.query(
        `INSERT INTO wishlists (user_id, product_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, product_id) DO NOTHING
         RETURNING *`,
        [userId, productId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to add to wishlist: ${error.message}`);
    }
  }

  /**
   * Remove product from user's wishlist
   */
  static async removeFromWishlist(userId, productId) {
    try {
      const result = await db.query(
        `DELETE FROM wishlists
         WHERE user_id = $1 AND product_id = $2
         RETURNING *`,
        [userId, productId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to remove from wishlist: ${error.message}`);
    }
  }

  /**
   * Get user's wishlist with pagination
   */
  static async getWishlist(userId, limit = 20, offset = 0) {
    try {
      const result = await db.query(
        `SELECT
           w.id,
           w.user_id,
           w.product_id,
           w.created_at,
           p.name,
           p.description,
           p.price,
           p.image_url,
           p.category,
           p.stock_quantity,
           p.merchant_id,
           u.name as merchant_name
         FROM wishlists w
         JOIN products p ON w.product_id = p.id
         JOIN users u ON p.merchant_id = u.id
         WHERE w.user_id = $1
         ORDER BY w.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      // Get total count
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM wishlists WHERE user_id = $1`,
        [userId]
      );

      return {
        items: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset
      };
    } catch (error) {
      throw new Error(`Failed to fetch wishlist: ${error.message}`);
    }
  }

  /**
   * Check if product is in user's wishlist
   */
  static async isInWishlist(userId, productId) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as count FROM wishlists
         WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );
      return result.rows[0].count > 0;
    } catch (error) {
      throw new Error(`Failed to check wishlist: ${error.message}`);
    }
  }

  /**
   * Get wishlist count for user
   */
  static async getWishlistCount(userId) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as count FROM wishlists WHERE user_id = $1`,
        [userId]
      );
      return result.rows[0].count;
    } catch (error) {
      throw new Error(`Failed to get wishlist count: ${error.message}`);
    }
  }

  /**
   * Clear entire wishlist for user
   */
  static async clearWishlist(userId) {
    try {
      const result = await db.query(
        `DELETE FROM wishlists WHERE user_id = $1 RETURNING *`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to clear wishlist: ${error.message}`);
    }
  }

  /**
   * Get wishlist items by product IDs (useful for bulk operations)
   */
  static async getWishlistByProductIds(userId, productIds) {
    try {
      if (productIds.length === 0) return [];

      const placeholders = productIds.map((_, i) => `$${i + 2}`).join(',');
      const query = `
        SELECT product_id FROM wishlists
        WHERE user_id = $1 AND product_id IN (${placeholders})
      `;

      const result = await db.query(query, [userId, ...productIds]);
      return result.rows.map(row => row.product_id);
    } catch (error) {
      throw new Error(`Failed to fetch wishlist items: ${error.message}`);
    }
  }
}

module.exports = WishlistService;
