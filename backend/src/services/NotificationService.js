const db = require('../config/database');

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
