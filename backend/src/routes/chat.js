const express = require('express');
const rateLimit = require('express-rate-limit');
const ChatService = require('../services/ChatService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper to generate rate limit key (user ID or normalized IP)
const getRateLimitKey = (req) => {
  if (req.user?.id) {
    return `user_${req.user.id}`;
  }
  // Normalize IP for IPv6 compatibility
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  return `ip_${ip.replace(/^::ffff:/, '')}`;
};

// Rate limiter for chat messages (60 messages per minute per user)
const messageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: 'Too many messages sent. Please slow down.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  validate: { xForwardedForHeader: false }
});

// Rate limiter for conversation creation (10 per 15 minutes)
const conversationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many conversation requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  validate: { xForwardedForHeader: false }
});

// General rate limiter for chat endpoints (100 requests per minute)
const generalChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  validate: { xForwardedForHeader: false }
});

// =====================================================
// CONVERSATION ROUTES
// =====================================================

/**
 * @route   GET /api/v1/chat/conversations
 * @desc    Get user's conversations list
 * @access  Private (Customer or Merchant)
 */
router.get('/conversations', authenticate, generalChatLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 20;

    let conversations;

    if (userRole === 'customer' || userRole === 'student') {
      conversations = await ChatService.getCustomerConversations(userId, limit);
    } else if (userRole === 'merchant' || userRole === 'admin') {
      // Admins use merchant conversations (they're in merchant_id position)
      conversations = await ChatService.getMerchantConversations(userId, limit);
    } else {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only customers, merchants, and admins can access chat'
      });
    }

    res.json({
      success: true,
      conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('[Chat API] Error getting conversations:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversations',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route   POST /api/v1/chat/conversations
 * @desc    Start or get existing conversation with merchant
 * @access  Private (Customer only)
 */
router.post('/conversations', authenticate, conversationRateLimiter, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { merchantId, productId } = req.body;

    // Validate required fields
    if (!merchantId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'merchantId is required'
      });
    }

    // Only customers can start conversations
    if (req.user.role !== 'customer' && req.user.role !== 'student') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only customers can start conversations'
      });
    }

    // Validate merchant exists
    const db = require('../config/database');
    const merchantCheck = await db.query(
      'SELECT id, role FROM users WHERE id = $1',
      [merchantId]
    );

    if (merchantCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Merchant not found'
      });
    }

    // Allow conversations with both merchants and admins (for support)
    if (merchantCheck.rows[0].role !== 'merchant' && merchantCheck.rows[0].role !== 'admin') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'User is not a merchant or admin'
      });
    }

    // Validate product if provided
    if (productId) {
      const productCheck = await db.query(
        'SELECT id, merchant_id FROM products WHERE id = $1',
        [productId]
      );

      if (productCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Product not found'
        });
      }

      // Verify product belongs to merchant
      if (productCheck.rows[0].merchant_id !== merchantId) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Product does not belong to specified merchant'
        });
      }
    }

    const conversation = await ChatService.createOrGetConversation(
      customerId,
      merchantId,
      productId || null
    );

    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('[Chat API] Error creating conversation:', error);
    res.status(500).json({
      error: 'Failed to create conversation',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route   GET /api/v1/chat/conversations/:conversationId
 * @desc    Get conversation details
 * @access  Private (Participant only)
 */
router.get('/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;

    const conversation = await ChatService.getConversationById(conversationId, userId);

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('[Chat API] Error getting conversation:', error);

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        error: 'Not found',
        code: 'INTERNAL_ERROR'
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve conversation',
      code: 'INTERNAL_ERROR'
    });
  }
});

// =====================================================
// MESSAGE ROUTES
// =====================================================

/**
 * @route   GET /api/v1/chat/conversations/:conversationId/messages
 * @desc    Get messages in a conversation
 * @access  Private (Participant only)
 */
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await ChatService.getConversationMessages(
      conversationId,
      userId,
      limit,
      offset
    );

    res.json({
      success: true,
      messages,
      count: messages.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('[Chat API] Error getting messages:', error);

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        error: 'Not found',
        code: 'INTERNAL_ERROR'
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve messages',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route   POST /api/v1/chat/conversations/:conversationId/messages
 * @desc    Send a message in conversation
 * @access  Private (Participant only)
 */
router.post('/conversations/:conversationId/messages', authenticate, messageRateLimiter, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const senderId = req.user.id;
    const { messageText, messageType, metadata } = req.body;

    // Validate message text
    if (!messageText || messageText.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message text is required'
      });
    }

    if (messageText.length > 5000) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message text cannot exceed 5000 characters'
      });
    }

    // Get conversation to determine receiver
    const conversation = await ChatService.getConversationById(conversationId, senderId);

    const receiverId = conversation.customer_id === senderId
      ? conversation.merchant_id
      : conversation.customer_id;

    const message = await ChatService.sendMessage(
      senderId,
      receiverId,
      conversationId,
      messageText.trim(),
      messageType || 'text',
      metadata || {}
    );

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('[Chat API] Error sending message:', error);

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        error: 'Not found',
        code: 'INTERNAL_ERROR'
      });
    }

    res.status(500).json({
      error: 'Failed to send message',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route   PATCH /api/v1/chat/conversations/:conversationId/read
 * @desc    Mark conversation messages as read
 * @access  Private (Participant only)
 */
router.patch('/conversations/:conversationId/read', authenticate, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = req.user.id;

    const markedCount = await ChatService.markMessagesAsRead(conversationId, userId);

    res.json({
      success: true,
      marked_count: markedCount,
      message: `${markedCount} message(s) marked as read`
    });
  } catch (error) {
    console.error('[Chat API] Error marking messages as read:', error);

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        error: 'Not found',
        code: 'INTERNAL_ERROR'
      });
    }

    res.status(500).json({
      error: 'Failed to mark messages as read',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * @route   DELETE /api/v1/chat/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private (Sender only)
 */
router.delete('/messages/:messageId', authenticate, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;

    await ChatService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('[Chat API] Error deleting message:', error);

    if (error.message.includes('not found') || error.message.includes('unauthorized')) {
      return res.status(404).json({
        error: 'Not found',
        code: 'INTERNAL_ERROR'
      });
    }

    res.status(500).json({
      error: 'Failed to delete message',
      code: 'INTERNAL_ERROR'
    });
  }
});

// =====================================================
// UNREAD COUNT ROUTE
// =====================================================

/**
 * @route   GET /api/v1/chat/unread-count
 * @desc    Get total unread message count for user
 * @access  Private
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await ChatService.getUnreadCount(userId);

    res.json({
      success: true,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('[Chat API] Error getting unread count:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      code: 'INTERNAL_ERROR'
    });
  }
});

// =====================================================
// TYPING INDICATOR ROUTE (Optional real-time feature)
// =====================================================

/**
 * @route   POST /api/v1/chat/conversations/:conversationId/typing
 * @desc    Send typing indicator
 * @access  Private (Participant only)
 */
router.post('/conversations/:conversationId/typing', authenticate, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const senderId = req.user.id;
    const { isTyping } = req.body;

    await ChatService.sendTypingIndicator(
      conversationId,
      senderId,
      isTyping !== false // Default to true
    );

    res.json({
      success: true,
      message: 'Typing indicator sent'
    });
  } catch (error) {
    console.error('[Chat API] Error sending typing indicator:', error);
    res.status(500).json({
      error: 'Failed to send typing indicator',
      code: 'INTERNAL_ERROR'
    });
  }
});

// =====================================================
// SUPPORT ADMIN ROUTE
// =====================================================

/**
 * @route   GET /api/v1/chat/support-admin
 * @desc    Get support admin ID for escalation
 * @access  Private
 */
router.get('/support-admin', authenticate, async (req, res) => {
  try {
    const db = require('../config/database');

    // Find an active admin user for support (admins don't require email verification)
    const result = await db.query(
      `SELECT id, name FROM users
       WHERE role = 'admin'
       ORDER BY id ASC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No support admin available',
        message: 'Please try again later or contact support directly'
      });
    }

    res.json({
      success: true,
      adminId: result.rows[0].id,
      adminName: result.rows[0].name
    });
  } catch (error) {
    console.error('[Chat API] Error getting support admin:', error);
    res.status(500).json({
      error: 'Failed to get support admin',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
