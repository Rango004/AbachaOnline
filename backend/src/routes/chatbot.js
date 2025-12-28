/**
 * Chatbot API Routes for WeGo
 * Handles chatbot session management and message processing
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const RASAChatbotService = require('../services/RASAChatbotService');
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

// Rate limiter for chatbot messages (30 messages per minute per user)
const chatbotMessageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many messages. Please slow down.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  validate: { xForwardedForHeader: false }
});

// Rate limiter for session creation (5 per 15 minutes)
const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many session requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  validate: { xForwardedForHeader: false }
});

// Rate limiter for webhook (100 per minute from RASA server)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many webhook requests.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});

// Rate limiter for FAQ endpoint (public, 30 per minute per IP)
const faqLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});

// =====================================================
// SESSION ENDPOINTS
// =====================================================

/**
 * POST /api/v1/chatbot/sessions
 * Start a new chatbot session
 * Auth: Required (customer only)
 */
router.post('/sessions', authenticate, sessionLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only customers/students can use chatbot
    if (userRole !== 'customer' && userRole !== 'student') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only customers can use the chatbot'
      });
    }

    const session = await RASAChatbotService.createOrGetSession(userId);

    // Check if session is less than 2 days old - if so, load existing messages
    let messages = [];
    let isExistingSession = false;
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    if (session.created_at && new Date(session.created_at) > twoDaysAgo) {
      // Session is within 2 days - load existing messages
      messages = await RASAChatbotService.getSessionMessages(session.session_id, 100);
      isExistingSession = messages.length > 0;
    }

    res.status(200).json({
      success: true,
      session: {
        id: session.id,
        session_id: session.session_id,
        created_at: session.created_at,
        last_activity: session.last_activity
      },
      messages: messages,
      isExistingSession: isExistingSession
    });

  } catch (error) {
    console.error('[Chatbot Routes] Error creating session:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create chatbot session'
    });
  }
});

/**
 * GET /api/v1/chatbot/sessions/:sessionId
 * Get chatbot session details
 * Auth: Required (session owner)
 */
router.get('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await RASAChatbotService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found'
      });
    }

    // Verify ownership
    if (session.customer_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this session'
      });
    }

    res.status(200).json({
      success: true,
      session
    });

  } catch (error) {
    console.error('[Chatbot Routes] Error getting session:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve session'
    });
  }
});

/**
 * DELETE /api/v1/chatbot/sessions/:sessionId
 * End a chatbot session
 * Auth: Required (session owner)
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await RASAChatbotService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found'
      });
    }

    // Verify ownership
    if (session.customer_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this session'
      });
    }

    await RASAChatbotService.endSession(sessionId);

    res.status(200).json({
      success: true,
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('[Chatbot Routes] Error ending session:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to end session'
    });
  }
});

// =====================================================
// MESSAGE ENDPOINTS
// =====================================================

/**
 * POST /api/v1/chatbot/sessions/:sessionId/messages
 * Send a message to the chatbot
 * Auth: Required (session owner)
 */
router.post('/sessions/:sessionId/messages', authenticate, chatbotMessageLimiter, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { messageText } = req.body;
    const userId = req.user.id;

    // Validation
    if (!messageText || messageText.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message text is required'
      });
    }

    if (messageText.length > 5000) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Message text too long (max 5000 characters)'
      });
    }

    // Verify session ownership
    const session = await RASAChatbotService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found'
      });
    }

    if (session.customer_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this session'
      });
    }

    // Send message to RASA
    const response = await RASAChatbotService.sendMessageToRASA(
      sessionId,
      messageText.trim(),
      userId
    );

    res.status(200).json({
      success: true,
      message: {
        user_message: messageText.trim(),
        bot_response: response.response,
        intent: response.intent,
        confidence: response.confidence
      }
    });

  } catch (error) {
    console.error('[Chatbot Routes] Error sending message:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send message'
    });
  }
});

/**
 * GET /api/v1/chatbot/sessions/:sessionId/messages
 * Get chatbot conversation history
 * Auth: Required (session owner)
 */
router.get('/sessions/:sessionId/messages', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    // Verify session ownership
    const session = await RASAChatbotService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found'
      });
    }

    if (session.customer_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this session'
      });
    }

    const messages = await RASAChatbotService.getSessionMessages(sessionId, limit);

    res.status(200).json({
      success: true,
      messages,
      count: messages.length
    });

  } catch (error) {
    console.error('[Chatbot Routes] Error getting messages:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve messages'
    });
  }
});

// =====================================================
// ESCALATION ENDPOINT
// =====================================================

/**
 * POST /api/v1/chatbot/sessions/:sessionId/escalate
 * Escalate chatbot conversation to human merchant
 * Auth: Required (session owner)
 */
router.post('/sessions/:sessionId/escalate', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    // Verify session ownership
    const session = await RASAChatbotService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Session not found'
      });
    }

    if (session.customer_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this session'
      });
    }

    // Get conversation history
    const messages = await RASAChatbotService.getSessionMessages(sessionId, 10);

    const conversationHistory = messages.map(msg => ({
      sender: msg.sender,
      text: msg.message_text,
      timestamp: msg.created_at
    }));

    // Escalate to human
    const result = await RASAChatbotService.escalateToHuman(
      sessionId,
      userId,
      conversationHistory
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Conversation escalated to human support',
        conversation_id: result.conversation_id,
        merchant_id: result.merchant_id
      });
    } else {
      res.status(500).json({
        error: 'Escalation failed',
        message: result.message || 'Failed to escalate conversation'
      });
    }

  } catch (error) {
    console.error('[Chatbot Routes] Error escalating conversation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to escalate conversation'
    });
  }
});

// =====================================================
// WEBHOOK ENDPOINT (for RASA Custom Actions)
// =====================================================

/**
 * POST /api/v1/chatbot/webhook
 * Webhook endpoint for RASA custom actions
 * Auth: Requires RASA_WEBHOOK_SECRET token in X-Webhook-Secret header
 */
router.post('/webhook', webhookLimiter, async (req, res) => {
  try {
    // Validate webhook secret for security
    const webhookSecret = process.env.RASA_WEBHOOK_SECRET;
    const providedSecret = req.headers['x-webhook-secret'];

    if (webhookSecret) {
      // If secret is configured, require it
      if (!providedSecret || providedSecret !== webhookSecret) {
        console.warn('[Chatbot Webhook] Unauthorized webhook request attempted');
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'WEBHOOK_AUTH_FAILED'
        });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, require the secret to be set
      console.error('[Chatbot Webhook] RASA_WEBHOOK_SECRET not configured in production!');
      return res.status(500).json({
        error: 'Webhook not configured',
        code: 'WEBHOOK_CONFIG_ERROR'
      });
    }

    const { action, customer_id, order_id, query, merchant_id, merchant_name, conversation_history } = req.body;

    let result;

    switch (action) {
      case 'check_order_status':
        result = await RASAChatbotService.handleOrderStatusQuery(customer_id, order_id);
        break;

      case 'search_products':
        result = await RASAChatbotService.handleProductSearch(query, customer_id);
        break;

      case 'request_refund':
        result = await RASAChatbotService.handleRefundRequest(customer_id, order_id);
        break;

      case 'get_merchant_info':
        result = await RASAChatbotService.handleMerchantInfo(merchant_id, merchant_name);
        break;

      case 'escalate_to_human':
        const sessionId = req.body.session_id || `temp_${customer_id}_${Date.now()}`;
        result = await RASAChatbotService.escalateToHuman(
          sessionId,
          customer_id,
          conversation_history
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown action: ${action}`
        });
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('[Chatbot Webhook] Error processing action:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook action'
    });
  }
});

// =====================================================
// FAQ ENDPOINT
// =====================================================

/**
 * GET /api/v1/chatbot/faqs
 * Get all FAQs (public endpoint)
 */
router.get('/faqs', faqLimiter, async (req, res) => {
  try {
    const category = req.query.category;

    let query = 'SELECT * FROM chatbot_faqs';
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY usage_count DESC, created_at DESC';

    const db = require('../config/database');
    const result = await db.query(query, params);

    res.status(200).json({
      success: true,
      faqs: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('[Chatbot Routes] Error getting FAQs:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve FAQs'
    });
  }
});

module.exports = router;
