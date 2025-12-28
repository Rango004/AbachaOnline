const express = require('express');
const NotificationService = require('../services/NotificationService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

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

module.exports = router;
