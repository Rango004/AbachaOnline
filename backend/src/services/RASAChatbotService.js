/**
 * RASA Chatbot Service for WeGo
 * Handles chatbot sessions, message processing, and RASA integration
 */

const db = require('../config/database');
const crypto = require('crypto');
const WebSocketService = require('./WebSocketService');

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Input text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, 'data-blocked:');
}

class RASAChatbotService {
  constructor(wsService = null) {
    // Remove trailing slash from RASA_URL to prevent double slash in webhook URL
    const baseUrl = process.env.RASA_URL || 'http://localhost:5005';
    this.rasaUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.rasaWebhookUrl = `${this.rasaUrl}/webhooks/rest/webhook`;
    this.wsService = wsService;
  }

  // Set WebSocket service after initialization
  setWebSocketService(wsService) {
    this.wsService = wsService;
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  /**
   * Create or get active chatbot session for customer
   * @param {number} customerId - Customer user ID
   * @returns {Object} Session object
   */
  async createOrGetSession(customerId) {
    try {
      // Check for existing active session
      const existingSession = await db.query(
        `SELECT * FROM chatbot_sessions
         WHERE customer_id = $1 AND is_active = true
         ORDER BY created_at DESC LIMIT 1`,
        [customerId]
      );

      if (existingSession.rows.length > 0) {
        // Update last_activity
        await db.query(
          `UPDATE chatbot_sessions
           SET last_activity = NOW()
           WHERE id = $1`,
          [existingSession.rows[0].id]
        );

        return existingSession.rows[0];
      }

      // Create new session with cryptographically secure ID
      const randomBytes = crypto.randomBytes(16).toString('hex');
      const sessionId = `session_${customerId}_${randomBytes}`;

      const newSession = await db.query(
        `INSERT INTO chatbot_sessions (customer_id, session_id, context, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING *`,
        [customerId, sessionId, JSON.stringify({})]
      );

      console.log(`[Chatbot] Created new session ${sessionId} for customer ${customerId}`);
      return newSession.rows[0];

    } catch (error) {
      console.error('[Chatbot] Error creating/getting session:', error);
      throw error;
    }
  }

  /**
   * Get active session by session ID
   * @param {string} sessionId - Session ID
   * @returns {Object} Session object
   */
  async getSessionById(sessionId) {
    try {
      const result = await db.query(
        `SELECT * FROM chatbot_sessions WHERE session_id = $1`,
        [sessionId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Chatbot] Error getting session:', error);
      throw error;
    }
  }

  /**
   * End chatbot session
   * @param {string} sessionId - Session ID to end
   */
  async endSession(sessionId) {
    try {
      await db.query(
        `UPDATE chatbot_sessions
         SET is_active = false
         WHERE session_id = $1`,
        [sessionId]
      );

      console.log(`[Chatbot] Session ${sessionId} ended`);
    } catch (error) {
      console.error('[Chatbot] Error ending session:', error);
      throw error;
    }
  }

  // =====================================================
  // MESSAGE HANDLING
  // =====================================================

  /**
   * Send message to RASA and get response
   * @param {string} sessionId - Session ID
   * @param {string} messageText - User's message text
   * @param {number} customerId - Customer ID
   * @returns {Object} Bot response with intent and confidence
   */
  async sendMessageToRASA(sessionId, messageText, customerId) {
    try {
      // Save user message
      await this.saveUserMessage(sessionId, messageText);

      // Send to RASA with metadata (including customer_id)
      const response = await fetch(this.rasaWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: sessionId,
          message: messageText,
          metadata: {
            customer_id: customerId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`RASA request failed: ${response.statusText}`);
      }

      const rasaResponses = await response.json();

      // RASA returns an array of responses - concatenate ALL of them
      if (rasaResponses && rasaResponses.length > 0) {
        // Combine all response texts with newlines (RASA may split messages)
        const allTexts = rasaResponses
          .map(r => r.text)
          .filter(text => text && text.trim())
          .join('\n\n');

        const responseText = allTexts || "I'm not sure how to respond to that.";

        // Get intent and confidence from first response (primary intent)
        const primaryResponse = rasaResponses[0];
        const intent = primaryResponse.intent || 'unknown';
        const confidence = primaryResponse.confidence || 0;

        console.log(`[Chatbot] RASA returned ${rasaResponses.length} response(s), combined length: ${responseText.length}`);

        // Save bot response
        await this.saveBotResponse(
          sessionId,
          responseText,
          intent,
          confidence
        );

        // Send via WebSocket
        if (this.wsService) {
          // Clean response text - remove broken markdown links that point to non-existent routes
          let cleanedResponseText = responseText;
          // Replace markdown links [text](/path) with just the text for non-product links
          cleanedResponseText = cleanedResponseText.replace(/\[([^\]]+)\]\(\/(?:support|refunds|help|login|download)[^\)]*\)/g, '$1');
          // Keep product and order links as they work
          // cleanedResponseText already preserves /products and /orders links

          // Build the response object
          const wsResponse = {
            session_id: sessionId,
            message_text: cleanedResponseText,
            sender: 'bot',
            intent: intent,
            confidence: confidence,
            timestamp: new Date()
          };

          // Check for escalation intent and add escalation metadata
          if (intent === 'talk_to_human') {
            wsResponse.escalation = { type: 'admin' };
            console.log('[Chatbot] Escalation detected - connecting to admin support');
          }

          // Check for refund intent - escalate to merchant
          if (intent === 'request_refund') {
            // Try to get the merchant from customer's most recent order
            try {
              const recentOrder = await db.query(
                `SELECT o.merchant_id, o.tracking_number, p.id as product_id
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE o.student_id = $1
                 ORDER BY o.created_at DESC
                 LIMIT 1`,
                [customerId]
              );

              if (recentOrder.rows.length > 0) {
                const { merchant_id, tracking_number, product_id } = recentOrder.rows[0];
                wsResponse.escalation = {
                  type: 'merchant',
                  merchantId: merchant_id,
                  productId: product_id,
                  orderId: tracking_number
                };
                console.log(`[Chatbot] Refund escalation - connecting to merchant ${merchant_id} for order ${tracking_number}`);
              } else {
                // No recent order found, escalate to admin support instead
                wsResponse.escalation = { type: 'admin' };
                console.log('[Chatbot] Refund escalation - no recent order, connecting to admin support');
              }
            } catch (err) {
              console.error('[Chatbot] Error fetching merchant for refund:', err);
              wsResponse.escalation = { type: 'admin' };
            }
          }

          await this.wsService.sendChatbotResponse(customerId, wsResponse);
        }

        return {
          success: true,
          response: responseText,
          intent: intent,
          confidence: confidence
        };
      } else {
        // No response from RASA - use FAQ fallback
        return await this.handleFAQFallback(sessionId, messageText, customerId);
      }

    } catch (error) {
      console.error('[Chatbot] Error communicating with RASA:', error);

      // Fallback to FAQ search
      return await this.handleFAQFallback(sessionId, messageText, customerId);
    }
  }

  /**
   * Save user message to database
   * @param {string} sessionId - Session ID
   * @param {string} messageText - Message text
   */
  async saveUserMessage(sessionId, messageText) {
    try {
      // Sanitize user input to prevent XSS
      const sanitizedText = sanitizeText(messageText);

      await db.query(
        `INSERT INTO chatbot_messages (session_id, sender, message_text)
         VALUES ($1, 'user', $2)`,
        [sessionId, sanitizedText]
      );
    } catch (error) {
      console.error('[Chatbot] Error saving user message:', error);
    }
  }

  /**
   * Save bot response to database
   * @param {string} sessionId - Session ID
   * @param {string} responseText - Bot response text
   * @param {string} intent - Detected intent
   * @param {number} confidence - Intent confidence score
   */
  async saveBotResponse(sessionId, responseText, intent, confidence) {
    try {
      await db.query(
        `INSERT INTO chatbot_messages (session_id, sender, message_text, intent, confidence)
         VALUES ($1, 'bot', $2, $3, $4)`,
        [sessionId, responseText, intent, confidence]
      );
    } catch (error) {
      console.error('[Chatbot] Error saving bot response:', error);
    }
  }

  /**
   * Get conversation history for a session
   * @param {string} sessionId - Session ID
   * @param {number} limit - Number of messages to retrieve
   * @returns {Array} Array of messages
   */
  async getSessionMessages(sessionId, limit = 50) {
    try {
      const result = await db.query(
        `SELECT * FROM chatbot_messages
         WHERE session_id = $1
         ORDER BY created_at ASC
         LIMIT $2`,
        [sessionId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('[Chatbot] Error getting session messages:', error);
      throw error;
    }
  }

  // =====================================================
  // FAQ FALLBACK
  // =====================================================

  /**
   * Handle FAQ fallback when RASA is unavailable
   * @param {string} sessionId - Session ID
   * @param {string} query - User query
   * @param {number} customerId - Customer ID
   * @returns {Object} Fallback response
   */
  async handleFAQFallback(sessionId, query, customerId) {
    try {
      const faq = await this.searchFAQ(query);

      let responseText;
      if (faq) {
        responseText = faq.answer;

        // Increment usage count
        await db.query(
          `UPDATE chatbot_faqs SET usage_count = usage_count + 1 WHERE id = $1`,
          [faq.id]
        );
      } else {
        responseText = "I'm sorry, I didn't understand that. Could you please rephrase or choose from: Check Order, Product Search, Refund Request, or Talk to Human?";
      }

      // Save bot response
      await this.saveBotResponse(sessionId, responseText, 'faq_fallback', 0);

      // Send via WebSocket
      if (this.wsService) {
        await this.wsService.sendChatbotResponse(customerId, {
          session_id: sessionId,
          message_text: responseText,
          sender: 'bot',
          intent: 'faq_fallback',
          confidence: 0,
          timestamp: new Date()
        });
      }

      return {
        success: true,
        response: responseText,
        intent: 'faq_fallback',
        confidence: 0
      };

    } catch (error) {
      console.error('[Chatbot] Error in FAQ fallback:', error);
      throw error;
    }
  }

  /**
   * Search FAQ database for matching questions
   * @param {string} query - Search query
   * @returns {Object} FAQ entry or null
   */
  async searchFAQ(query) {
    try {
      // Simple keyword matching (can be enhanced with full-text search)
      const result = await db.query(
        `SELECT * FROM chatbot_faqs
         WHERE question ILIKE $1 OR answer ILIKE $1
         ORDER BY usage_count DESC
         LIMIT 1`,
        [`%${query}%`]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Chatbot] Error searching FAQ:', error);
      return null;
    }
  }

  /**
   * Get FAQ by intent
   * @param {string} intent - RASA intent name
   * @returns {Object} FAQ entry or null
   */
  async getFAQByIntent(intent) {
    try {
      const result = await db.query(
        `SELECT * FROM chatbot_faqs WHERE intent = $1 LIMIT 1`,
        [intent]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Chatbot] Error getting FAQ by intent:', error);
      return null;
    }
  }

  // =====================================================
  // WEBHOOK ACTIONS (Called by RASA)
  // =====================================================

  /**
   * Handle order status query from RASA
   * @param {number} customerId - Customer ID
   * @param {string} orderId - Order tracking number (optional)
   * @returns {Object} Order status data
   */
  async handleOrderStatusQuery(customerId, orderId = null) {
    try {
      let query;
      let params;

      if (orderId) {
        query = `
          SELECT o.*, u.full_name as merchant_name
          FROM orders o
          LEFT JOIN users u ON o.merchant_id = u.id
          WHERE o.customer_id = $1 AND o.tracking_number = $2
        `;
        params = [customerId, orderId];
      } else {
        // Get most recent order
        query = `
          SELECT o.*, u.full_name as merchant_name
          FROM orders o
          LEFT JOIN users u ON o.merchant_id = u.id
          WHERE o.customer_id = $1
          ORDER BY o.created_at DESC
          LIMIT 1
        `;
        params = [customerId];
      }

      const result = await db.query(query, params);

      if (result.rows.length > 0) {
        return {
          success: true,
          order: result.rows[0]
        };
      } else {
        return {
          success: false,
          message: 'No order found'
        };
      }

    } catch (error) {
      console.error('[Chatbot] Error handling order status query:', error);
      return { success: false, message: 'Error retrieving order' };
    }
  }

  /**
   * Handle product search from RASA
   * @param {string} query - Search query
   * @param {number} customerId - Customer ID
   * @returns {Object} Product search results
   */
  async handleProductSearch(query, customerId) {
    try {
      const result = await db.query(
        `SELECT p.*, u.full_name as merchant_name
         FROM products p
         LEFT JOIN users u ON p.merchant_id = u.id
         WHERE (p.name ILIKE $1 OR p.description ILIKE $1)
         AND p.is_available = true
         ORDER BY p.created_at DESC
         LIMIT 10`,
        [`%${query}%`]
      );

      console.log(`[Chatbot] Product search for "${query}" returned ${result.rows.length} results`);

      return {
        success: true,
        products: result.rows
      };

    } catch (error) {
      console.error('[Chatbot] Error handling product search:', error);
      return { success: false, products: [] };
    }
  }

  /**
   * Handle refund request from RASA
   * @param {number} customerId - Customer ID
   * @param {string} orderId - Order tracking number
   * @returns {Object} Refund request result
   */
  async handleRefundRequest(customerId, orderId) {
    try {
      // Check if order exists and belongs to customer
      const orderResult = await db.query(
        `SELECT * FROM orders WHERE customer_id = $1 AND tracking_number = $2`,
        [customerId, orderId]
      );

      if (orderResult.rows.length === 0) {
        return {
          success: false,
          message: 'Order not found or does not belong to you'
        };
      }

      const order = orderResult.rows[0];

      // Check if order is eligible for refund
      if (order.status === 'delivered' || order.status === 'cancelled') {
        return {
          success: false,
          message: `Order is ${order.status} and cannot be refunded through chatbot. Please contact support.`
        };
      }

      // Create refund request (simplified - you may want a separate refunds table)
      await db.query(
        `UPDATE orders SET status = 'refund_requested' WHERE id = $1`,
        [order.id]
      );

      return {
        success: true,
        message: 'Refund request submitted successfully'
      };

    } catch (error) {
      console.error('[Chatbot] Error handling refund request:', error);
      return { success: false, message: 'Error processing refund' };
    }
  }

  /**
   * Get merchant information
   * @param {number} merchantId - Merchant ID (optional)
   * @param {string} merchantName - Merchant name (optional)
   * @returns {Object} Merchant information
   */
  async handleMerchantInfo(merchantId = null, merchantName = null) {
    try {
      let query;
      let params;

      if (merchantId) {
        query = `
          SELECT u.*, COUNT(DISTINCT p.id) as product_count
          FROM users u
          LEFT JOIN products p ON u.id = p.merchant_id
          WHERE u.id = $1 AND u.role = 'merchant'
          GROUP BY u.id
        `;
        params = [merchantId];
      } else if (merchantName) {
        query = `
          SELECT u.*, COUNT(DISTINCT p.id) as product_count
          FROM users u
          LEFT JOIN products p ON u.id = p.merchant_id
          WHERE u.full_name ILIKE $1 AND u.role = 'merchant'
          GROUP BY u.id
          LIMIT 1
        `;
        params = [`%${merchantName}%`];
      } else {
        return { success: false, message: 'Merchant ID or name required' };
      }

      const result = await db.query(query, params);

      if (result.rows.length > 0) {
        const merchant = result.rows[0];
        return {
          success: true,
          merchant: {
            id: merchant.id,
            name: merchant.full_name,
            email: merchant.email,
            contact: merchant.phone_number,
            location: merchant.location,
            product_count: merchant.product_count,
            rating: merchant.rating || 'N/A'
          }
        };
      } else {
        return { success: false, message: 'Merchant not found' };
      }

    } catch (error) {
      console.error('[Chatbot] Error getting merchant info:', error);
      return { success: false, message: 'Error retrieving merchant information' };
    }
  }

  /**
   * Escalate chatbot conversation to human merchant
   * @param {string} sessionId - Chatbot session ID
   * @param {number} customerId - Customer ID
   * @param {Array} conversationHistory - Recent conversation messages
   * @returns {Object} Escalation result
   */
  async escalateToHuman(sessionId, customerId, conversationHistory = []) {
    try {
      // End chatbot session
      await this.endSession(sessionId);

      // Find an appropriate merchant (simplified - you may want more complex logic)
      const merchantResult = await db.query(
        `SELECT id FROM users WHERE role = 'merchant' AND is_active = true LIMIT 1`
      );

      if (merchantResult.rows.length === 0) {
        return {
          success: false,
          message: 'No merchants available for escalation'
        };
      }

      const merchantId = merchantResult.rows[0].id;

      // Create conversation with merchant (using ChatService)
      const ChatService = require('./ChatService');
      const chatService = new ChatService();

      const conversation = await chatService.createOrGetConversation(
        customerId,
        merchantId,
        null // No specific product
      );

      // Send initial message with context
      const contextMessage = `[Escalated from chatbot]\n\nRecent conversation:\n${
        conversationHistory.slice(-5).map(msg => `${msg.sender}: ${msg.text}`).join('\n')
      }`;

      await chatService.sendMessage(
        customerId,
        merchantId,
        conversation.id,
        contextMessage,
        'text',
        { escalated: true, session_id: sessionId }
      );

      return {
        success: true,
        conversation_id: conversation.id,
        merchant_id: merchantId
      };

    } catch (error) {
      console.error('[Chatbot] Error escalating to human:', error);
      return { success: false, message: 'Error escalating conversation' };
    }
  }
}

module.exports = new RASAChatbotService();
