const db = require('../config/database');
const NotificationService = require('./NotificationService');

/**
 * Sanitize text to prevent XSS attacks
 * Escapes HTML special characters while preserving safe markdown
 * @param {string} text - Input text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return text;

  // Escape HTML special characters to prevent XSS
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove any potential script injections that might bypass escaping
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')  // Remove event handlers like onclick=, onerror=
    .replace(/data:/gi, 'data-blocked:');  // Block data: URLs
}

/**
 * Validate and sanitize message metadata
 * @param {Object} metadata - Message metadata object
 * @returns {Object} Sanitized metadata
 */
function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return {};

  const sanitized = {};
  const allowedKeys = ['productId', 'orderId', 'messageType', 'attachmentUrl', 'attachmentType'];

  for (const key of allowedKeys) {
    if (metadata[key] !== undefined) {
      if (typeof metadata[key] === 'string') {
        sanitized[key] = sanitizeText(metadata[key]);
      } else if (typeof metadata[key] === 'number') {
        sanitized[key] = metadata[key];
      }
    }
  }

  return sanitized;
}

class ChatService {
  constructor() {
    this.wsService = null;
  }

  /**
   * Set WebSocket service instance
   * @param {WebSocketService} wsService - WebSocket service instance
   */
  setWebSocketService(wsService) {
    this.wsService = wsService;
    console.log('[ChatService] WebSocket service configured');
  }
  // =====================================================
  // CONVERSATION MANAGEMENT
  // =====================================================

  /**
   * Create a new conversation or return existing one
   * @param {number} customerId - Customer user ID
   * @param {number} merchantId - Merchant user ID
   * @param {number|null} productId - Optional product ID for product-specific chat
   * @returns {Promise<Object>} Conversation object
   */
  async createOrGetConversation(customerId, merchantId, productId = null) {
    try {
      // Try to find existing conversation
      const existingQuery = `
        SELECT c.*,
               u1.name as customer_name,
               u2.name as merchant_name,
               p.name as product_name, p.image_url as product_image
        FROM conversations c
        JOIN users u1 ON c.customer_id = u1.id
        JOIN users u2 ON c.merchant_id = u2.id
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = $1 AND c.merchant_id = $2
        AND ($3::INT IS NULL OR c.product_id = $3)
      `;

      const existing = await db.query(existingQuery, [customerId, merchantId, productId]);

      if (existing.rows.length > 0) {
        return existing.rows[0];
      }

      // Create new conversation
      const insertQuery = `
        INSERT INTO conversations (customer_id, merchant_id, product_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [customerId, merchantId, productId]);

      // Fetch full conversation details
      const fullConversation = await db.query(existingQuery, [customerId, merchantId, productId]);

      return fullConversation.rows[0];
    } catch (error) {
      console.error('[ChatService] Error creating/getting conversation:', error);
      throw new Error('Failed to create or retrieve conversation');
    }
  }

  /**
   * Get all conversations for a customer
   * @param {number} customerId - Customer user ID
   * @param {number} limit - Max conversations to return
   * @returns {Promise<Array>} Array of conversations
   */
  async getCustomerConversations(customerId, limit = 20) {
    try {
      const query = `
        SELECT c.*,
               u.name as merchant_name,
               p.name as product_name,
               p.image_url as product_image,
               (
                 SELECT json_build_object(
                   'message_text', cm.message_text,
                   'message_type', cm.message_type,
                   'created_at', cm.created_at,
                   'sender_id', cm.sender_id
                 )
                 FROM chat_messages cm
                 WHERE cm.conversation_id = c.id
                 ORDER BY cm.created_at DESC
                 LIMIT 1
               ) as last_message
        FROM conversations c
        JOIN users u ON c.merchant_id = u.id
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = $1
        ORDER BY c.last_message_at DESC
        LIMIT $2
      `;

      const result = await db.query(query, [customerId, limit]);
      return result.rows;
    } catch (error) {
      console.error('[ChatService] Error getting customer conversations:', error);
      throw new Error('Failed to retrieve conversations');
    }
  }

  /**
   * Get all conversations for a merchant
   * @param {number} merchantId - Merchant user ID
   * @param {number} limit - Max conversations to return
   * @returns {Promise<Array>} Array of conversations
   */
  async getMerchantConversations(merchantId, limit = 20) {
    try {
      const query = `
        SELECT c.*,
               u.name as customer_name,
               p.name as product_name,
               p.image_url as product_image,
               (
                 SELECT json_build_object(
                   'message_text', cm.message_text,
                   'message_type', cm.message_type,
                   'created_at', cm.created_at,
                   'sender_id', cm.sender_id
                 )
                 FROM chat_messages cm
                 WHERE cm.conversation_id = c.id
                 ORDER BY cm.created_at DESC
                 LIMIT 1
               ) as last_message
        FROM conversations c
        JOIN users u ON c.customer_id = u.id
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.merchant_id = $1
        ORDER BY c.last_message_at DESC
        LIMIT $2
      `;

      const result = await db.query(query, [merchantId, limit]);
      return result.rows;
    } catch (error) {
      console.error('[ChatService] Error getting merchant conversations:', error);
      throw new Error('Failed to retrieve conversations');
    }
  }

  /**
   * Get conversation by ID with authorization check
   * @param {number} conversationId - Conversation ID
   * @param {number} userId - User ID requesting the conversation
   * @returns {Promise<Object>} Conversation object
   */
  async getConversationById(conversationId, userId) {
    try {
      const query = `
        SELECT c.*,
               u1.name as customer_name,
               u2.name as merchant_name,
               p.name as product_name,
               p.image_url as product_image
        FROM conversations c
        JOIN users u1 ON c.customer_id = u1.id
        JOIN users u2 ON c.merchant_id = u2.id
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.id = $1 AND (c.customer_id = $2 OR c.merchant_id = $2)
      `;

      const result = await db.query(query, [conversationId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Conversation not found or access denied');
      }

      return result.rows[0];
    } catch (error) {
      console.error('[ChatService] Error getting conversation by ID:', error);
      throw error;
    }
  }

  // =====================================================
  // MESSAGE OPERATIONS
  // =====================================================

  /**
   * Send a message in a conversation
   * @param {number} senderId - Sender user ID
   * @param {number} receiverId - Receiver user ID
   * @param {number} conversationId - Conversation ID
   * @param {string} messageText - Message content
   * @param {string} messageType - Message type (text, image, product_link, system)
   * @param {Object} metadata - Additional message metadata
   * @returns {Promise<Object>} Created message object
   */
  async sendMessage(senderId, receiverId, conversationId, messageText, messageType = 'text', metadata = {}) {
    try {
      // Verify conversation access
      await this.getConversationById(conversationId, senderId);

      // Sanitize inputs to prevent XSS
      const sanitizedText = sanitizeText(messageText);
      const sanitizedMetadata = sanitizeMetadata(metadata);

      // Validate message length (defense-in-depth)
      if (!sanitizedText || sanitizedText.length > 5000) {
        throw new Error('Invalid message text length');
      }

      const insertQuery = `
        INSERT INTO chat_messages (
          conversation_id, sender_id, receiver_id,
          message_text, message_type, message_metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        conversationId,
        senderId,
        receiverId,
        sanitizedText,
        messageType,
        JSON.stringify(sanitizedMetadata)
      ]);

      const message = result.rows[0];

      // Get sender info for WebSocket event
      const senderQuery = await db.query(
        'SELECT name FROM users WHERE id = $1',
        [senderId]
      );

      const messageWithSender = {
        ...message,
        sender_name: senderQuery.rows[0]?.name,
        sender_image: null  // Profile images not yet implemented
      };

      // Send real-time notification to receiver (if WebSocket service is available)
      if (this.wsService) {
        await this.wsService.sendChatMessage(receiverId, messageWithSender);

        // Update unread count for receiver
        const unreadCount = await this.getUnreadCount(receiverId);
        await this.wsService.sendUnreadUpdate(receiverId, unreadCount);
      }

      // Send push notification to receiver
      try {
        const senderName = senderQuery.rows[0]?.name || 'Someone';
        const messagePreview = sanitizedText.length > 100
          ? sanitizedText.substring(0, 100) + '...'
          : sanitizedText;

        await NotificationService.createNotification(
          receiverId,
          'chat',
          `💬 ${senderName}`,
          messagePreview,
          { conversationId: conversationId, senderId: senderId }
        );
      } catch (pushError) {
        console.error('[ChatService] Push notification failed:', pushError.message);
        // Don't fail the message send if push notification fails
      }

      return messageWithSender;
    } catch (error) {
      console.error('[ChatService] Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get messages in a conversation with pagination
   * @param {number} conversationId - Conversation ID
   * @param {number} userId - User ID requesting messages
   * @param {number} limit - Max messages to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of messages
   */
  async getConversationMessages(conversationId, userId, limit = 50, offset = 0) {
    try {
      // Verify conversation access
      await this.getConversationById(conversationId, userId);

      const query = `
        SELECT cm.*,
               u.name as sender_name,
               NULL as sender_image
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE cm.conversation_id = $1
        AND cm.is_deleted = FALSE
        ORDER BY cm.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await db.query(query, [conversationId, limit, offset]);

      // Return in chronological order (oldest first)
      return result.rows.reverse();
    } catch (error) {
      console.error('[ChatService] Error getting conversation messages:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in a conversation as read
   * @param {number} conversationId - Conversation ID
   * @param {number} userId - User ID marking as read
   * @returns {Promise<number>} Number of messages marked as read
   */
  async markMessagesAsRead(conversationId, userId) {
    try {
      // Verify conversation access
      const conversation = await this.getConversationById(conversationId, userId);

      // Determine user role in conversation
      const isCustomer = conversation.customer_id === userId;
      const unreadCountField = isCustomer ? 'customer_unread_count' : 'merchant_unread_count';

      // Mark messages as read
      const updateQuery = `
        UPDATE chat_messages
        SET is_read = TRUE, read_at = NOW()
        WHERE conversation_id = $1
        AND receiver_id = $2
        AND is_read = FALSE
        RETURNING id
      `;

      const result = await db.query(updateQuery, [conversationId, userId]);

      // Reset unread count for this user's role
      await db.query(
        `UPDATE conversations SET ${unreadCountField} = 0 WHERE id = $1`,
        [conversationId]
      );

      // Send updated unread count via WebSocket (if available)
      if (this.wsService) {
        const unreadCount = await this.getUnreadCount(userId);
        await this.wsService.sendUnreadUpdate(userId, unreadCount);
      }

      return result.rows.length;
    } catch (error) {
      console.error('[ChatService] Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  }

  /**
   * Delete a message (soft delete)
   * @param {number} messageId - Message ID
   * @param {number} userId - User ID requesting deletion
   * @returns {Promise<boolean>} Success status
   */
  async deleteMessage(messageId, userId) {
    try {
      // Only sender can delete their own messages
      const checkQuery = `
        SELECT * FROM chat_messages
        WHERE id = $1 AND sender_id = $2
      `;

      const checkResult = await db.query(checkQuery, [messageId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Message not found or unauthorized');
      }

      // Soft delete
      await db.query(
        'UPDATE chat_messages SET is_deleted = TRUE WHERE id = $1',
        [messageId]
      );

      return true;
    } catch (error) {
      console.error('[ChatService] Error deleting message:', error);
      throw error;
    }
  }

  // =====================================================
  // UNREAD COUNTS
  // =====================================================

  /**
   * Get total unread message count for a user across all conversations
   * @param {number} userId - User ID
   * @returns {Promise<number>} Total unread count
   */
  async getUnreadCount(userId) {
    try {
      // Check if user is customer or merchant
      const userQuery = await db.query('SELECT role FROM users WHERE id = $1', [userId]);

      if (userQuery.rows.length === 0) {
        throw new Error('User not found');
      }

      const role = userQuery.rows[0].role;

      let query;
      if (role === 'customer' || role === 'student') {
        // Customer: sum of customer_unread_count
        query = `
          SELECT COALESCE(SUM(customer_unread_count), 0) as unread_count
          FROM conversations
          WHERE customer_id = $1
        `;
      } else if (role === 'merchant' || role === 'admin') {
        // Merchant/Admin: sum of merchant_unread_count (admins use merchant_id position)
        query = `
          SELECT COALESCE(SUM(merchant_unread_count), 0) as unread_count
          FROM conversations
          WHERE merchant_id = $1
        `;
      } else {
        return 0; // Riders don't have chats
      }

      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].unread_count) || 0;
    } catch (error) {
      console.error('[ChatService] Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Update unread count for a conversation (called by database trigger)
   * This is primarily for manual adjustments if needed
   * @param {number} conversationId - Conversation ID
   * @param {string} role - 'customer' or 'merchant'
   * @param {number} increment - Number to increment (can be negative)
   * @returns {Promise<void>}
   */
  async updateUnreadCount(conversationId, role, increment = 1) {
    try {
      const field = role === 'customer' ? 'customer_unread_count' : 'merchant_unread_count';

      await db.query(
        `UPDATE conversations
         SET ${field} = GREATEST(0, ${field} + $2)
         WHERE id = $1`,
        [conversationId, increment]
      );
    } catch (error) {
      console.error('[ChatService] Error updating unread count:', error);
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  /**
   * Send typing indicator to other participant
   * @param {number} conversationId - Conversation ID
   * @param {number} senderId - User who is typing
   * @param {boolean} isTyping - Typing status
   * @returns {Promise<void>}
   */
  async sendTypingIndicator(conversationId, senderId, isTyping) {
    try {
      const conversation = await this.getConversationById(conversationId, senderId);

      // Determine receiver ID
      const receiverId = conversation.customer_id === senderId
        ? conversation.merchant_id
        : conversation.customer_id;

      // Get sender name
      const senderQuery = await db.query(
        'SELECT name FROM users WHERE id = $1',
        [senderId]
      );

      const senderName = senderQuery.rows[0]?.name || 'Someone';

      // Send typing indicator via WebSocket (if available)
      if (this.wsService) {
        await this.wsService.sendTypingIndicator(receiverId, conversationId, isTyping, senderName);
      }
    } catch (error) {
      console.error('[ChatService] Error sending typing indicator:', error);
    }
  }

  /**
   * Get conversation statistics
   * @param {number} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation stats
   */
  async getConversationStats(conversationId) {
    try {
      const query = `
        SELECT
          COUNT(*) as total_messages,
          COUNT(CASE WHEN sender_id = c.customer_id THEN 1 END) as customer_messages,
          COUNT(CASE WHEN sender_id = c.merchant_id THEN 1 END) as merchant_messages,
          MIN(cm.created_at) as first_message_at,
          MAX(cm.created_at) as last_message_at
        FROM chat_messages cm
        JOIN conversations c ON cm.conversation_id = c.id
        WHERE cm.conversation_id = $1 AND cm.is_deleted = FALSE
        GROUP BY c.customer_id, c.merchant_id
      `;

      const result = await db.query(query, [conversationId]);
      return result.rows[0] || {};
    } catch (error) {
      console.error('[ChatService] Error getting conversation stats:', error);
      return {};
    }
  }
}

module.exports = new ChatService();
