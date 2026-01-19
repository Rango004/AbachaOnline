const db = require('../config/database');
const FirebaseService = require('./FirebaseService');

class NotificationService {
  async getUserNotifications(userId, limit = 50, offset = 0) {
    try {
      const result = await db.query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) as count
         FROM notifications
         WHERE user_id = $1 AND is_read = false`,
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  async createNotification(userId, type, title, body, data = {}) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Create notification record
      const notifResult = await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, false, NOW())
         RETURNING *`,
        [userId, type, title, body, JSON.stringify(data)]
      );

      // Get user's device tokens
      const tokensResult = await client.query(
        'SELECT token FROM device_tokens WHERE user_id = $1',
        [userId]
      );

      const tokens = tokensResult.rows.map(row => row.token);

      if (tokens.length > 0) {
        // Send push notification via Firebase
        try {
          // Convert all data values to strings (Firebase requirement)
          const stringData = {};
          Object.keys(data).forEach(key => {
            stringData[key] = String(data[key]);
          });
          stringData.type = type; // Add notification type to data

          const response = await FirebaseService.sendToMultipleDevices(
            tokens,
            { title, body },
            stringData
          );

          // Handle failed tokens
          if (response?.failedTokens && response.failedTokens.length > 0) {
            await client.query(
              'DELETE FROM device_tokens WHERE token = ANY($1)',
              [response.failedTokens]
            );
            console.log(`[NotificationService] Cleaned up ${response.failedTokens.length} invalid tokens`);
          }
        } catch (firebaseError) {
          // Log but don't fail - notification record is still created
          console.error('[NotificationService] Firebase send failed:', firebaseError.message);
        }
      } else {
        console.log(`[NotificationService] No device tokens found for user ${userId}`);
      }

      await client.query('COMMIT');
      return notifResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[NotificationService] Create notification error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async markAsRead(notificationId, userId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const notification = await client.query(
        'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );

      if (notification.rows.length === 0) {
        throw new Error('Notification not found or unauthorized');
      }

      await client.query(
        `UPDATE notifications SET is_read = true WHERE id = $1`,
        [notificationId]
      );

      await client.query('COMMIT');
      return { message: 'Notification marked as read' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async markAllAsRead(userId) {
    try {
      await db.query(
        `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
        [userId]
      );
      return { message: 'All notifications marked as read' };
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const notification = await client.query(
        'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );

      if (notification.rows.length === 0) {
        throw new Error('Notification not found or unauthorized');
      }

      await client.query(
        `DELETE FROM notifications WHERE id = $1`,
        [notificationId]
      );

      await client.query('COMMIT');
      return { message: 'Notification deleted' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new NotificationService();
