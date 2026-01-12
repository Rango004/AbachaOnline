const express = require('express');
const NotificationService = require('../services/NotificationService');
const FirebaseService = require('../services/FirebaseService');
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Initialize Firebase on module load
FirebaseService.initialize();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const notifications = await NotificationService.getUserNotifications(req.user.id, limit, offset);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to fetch unread count',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const result = await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(400).json({
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await NotificationService.deleteNotification(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(400).json({
      error: 'Failed to delete notification',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/notifications/register-device
 * @desc    Register device token for push notifications
 * @access  Private
 */
router.post('/register-device', authenticate, async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Device token is required'
      });
    }

    // Create device_tokens table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        platform VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert or update device token
    await db.query(`
      INSERT INTO device_tokens (user_id, token, platform, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (token)
      DO UPDATE SET user_id = $1, platform = $3, updated_at = NOW()
    `, [userId, token, platform]);

    console.log(`[Notifications] Device token registered for user ${userId}`);

    res.json({
      success: true,
      message: 'Device token registered successfully'
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({
      error: 'Failed to register device',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/notifications/unregister-device
 * @desc    Remove device token (on logout)
 * @access  Private
 */
router.delete('/unregister-device', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Device token is required'
      });
    }

    await db.query(
      'DELETE FROM device_tokens WHERE user_id = $1 AND token = $2',
      [userId, token]
    );

    console.log(`[Notifications] Device token unregistered for user ${userId}`);

    res.json({
      success: true,
      message: 'Device token removed successfully'
    });
  } catch (error) {
    console.error('Unregister device error:', error);
    res.status(500).json({
      error: 'Failed to unregister device',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/notifications/test-push
 * @desc    Send test push notification (for testing)
 * @access  Private
 */
router.post('/test-push', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's device tokens
    const result = await db.query(
      'SELECT token FROM device_tokens WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No devices registered',
        message: 'Please login on a mobile device first'
      });
    }

    const tokens = result.rows.map(row => row.token);

    // Send test notification
    const response = await FirebaseService.sendToMultipleDevices(
      tokens,
      {
        title: 'Test Notification',
        body: 'Push notifications are working! 🎉'
      },
      {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: `Test notification sent to ${tokens.length} device(s)`,
      details: response
    });
  } catch (error) {
    console.error('Test push error:', error);
    res.status(500).json({
      error: 'Failed to send test notification',
      message: error.message
    });
  }
});

module.exports = router;
