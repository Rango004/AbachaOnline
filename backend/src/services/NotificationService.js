const db = require('../config/database');
const FirebaseService = require('./FirebaseService');

class NotificationService {
  constructor() {
    this.wsService = null;
  }

  /**
   * Set WebSocket service instance for real-time notifications
   * @param {WebSocketService} wsService - WebSocket service instance
   */
  setWebSocketService(wsService) {
    this.wsService = wsService;
    console.log('[NotificationService] WebSocket service configured');
  }

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
    let notification = null;

    // Step 1: Create notification record in database
    try {
      const notifResult = await db.query(
        `INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, false, NOW())
         RETURNING *`,
        [userId, type, title, body, JSON.stringify(data)]
      );
      notification = notifResult.rows[0];
      console.log(`[NotificationService] Notification created for user ${userId}: ${title}`);
    } catch (dbError) {
      console.error('[NotificationService] Failed to create notification in DB:', dbError.message);
      throw dbError;
    }

    // Step 2: Send real-time WebSocket notification (independent of DB)
    if (this.wsService) {
      try {
        this.wsService.io.to(`user:${userId}`).emit('notification:new', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: data,
          is_read: false,
          created_at: notification.created_at,
          timestamp: new Date()
        });
        console.log(`[NotificationService] WebSocket notification sent to user ${userId}`);
      } catch (wsError) {
        console.error('[NotificationService] WebSocket notification failed:', wsError.message);
      }
    } else {
      console.warn('[NotificationService] No WebSocket service - real-time notification skipped');
    }

    // Step 3: Send push notification via Firebase (independent, non-blocking)
    try {
      const tokensResult = await db.query(
        'SELECT token FROM device_tokens WHERE user_id = $1',
        [userId]
      );

      const tokens = tokensResult.rows.map(row => row.token);

      if (tokens.length > 0) {
        const stringData = {};
        Object.keys(data).forEach(key => {
          stringData[key] = String(data[key]);
        });
        stringData.type = type;

        const response = await FirebaseService.sendToMultipleDevices(
          tokens,
          { title, body },
          stringData
        );

        if (response?.failedTokens && response.failedTokens.length > 0) {
          await db.query(
            'DELETE FROM device_tokens WHERE token = ANY($1)',
            [response.failedTokens]
          );
          console.log(`[NotificationService] Cleaned up ${response.failedTokens.length} invalid tokens`);
        }
      }
    } catch (pushError) {
      // Push notification failure should never prevent notification creation
      console.log(`[NotificationService] Push notification skipped: ${pushError.message}`);
    }

    return notification;
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
