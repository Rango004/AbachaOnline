const db = require('../config/database');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> Set of socket IDs
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(socket) {
    try {
      // Get token from query params
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log('WebSocket connection attempt without token');
        socket.disconnect();
        return;
      }

      // Verify JWT_SECRET is configured
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required for WebSocket authentication');
      }

      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (tokenError) {
        console.error('Invalid JWT token:', tokenError.message);
        socket.emit('authentication_error', {
          message: 'Invalid authentication token',
          error: tokenError.message
        });
        socket.disconnect();
        return;
      }

      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      // Store socket in tracking table
      await db.query(
        `INSERT INTO websocket_sessions
         (user_id, socket_id, session_token, user_role, connected_at, is_active, client_type, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, NOW(), TRUE, $5, $6, $7)
         ON CONFLICT (socket_id) DO UPDATE SET
           is_active = TRUE,
           last_heartbeat = NOW()`,
        [socket.userId, socket.id, token, socket.userRole, 'web', socket.handshake.address, socket.handshake.headers['user-agent']]
      );

      // Join user-specific room for personal notifications
      socket.join(`user:${socket.userId}`);

      console.log(`✅ User ${socket.userId} (${socket.userRole}) connected with socket ${socket.id}`);

      // Register event handlers
      this.setupEventHandlers(socket);

      // Notify relevant users that this user is online
      socket.emit('connected', {
        status: 'success',
        userId: socket.userId,
        userRole: socket.userRole,
        message: 'Connected to WebSocket server'
      });

    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      socket.disconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers(socket) {
    // Location events
    socket.on('rider:location_update', async (data) => {
      await this.handleLocationUpdate(socket, data);
    });

    // Order status events
    socket.on('order:status_changed', async (data) => {
      await this.handleOrderStatusChange(socket, data);
    });

    // Join order room (for customers and merchants to track specific order)
    socket.on('order:join_room', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined order:${orderId}`);
    });

    // Leave order room
    socket.on('order:leave_room', (orderId) => {
      socket.leave(`order:${orderId}`);
      console.log(`Socket ${socket.id} left order:${orderId}`);
    });

    // Notification acknowledgement
    socket.on('notification:read', async (data) => {
      await this.handleNotificationRead(socket, data);
    });

    // Heartbeat (keep-alive)
    socket.on('ping', () => {
      socket.emit('pong');
      this.updateHeartbeat(socket.userId, socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      await this.handleDisconnect(socket);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`WebSocket error for user ${socket.userId}:`, error);
    });
  }

  /**
   * Handle location update from rider
   */
  async handleLocationUpdate(socket, data) {
    try {
      const { latitude, longitude, accuracy, orderId } = data;

      if (!latitude || !longitude) {
        socket.emit('location:error', { message: 'Missing coordinates' });
        return;
      }

      // Broadcast to customers and merchants tracking this delivery
      if (orderId) {
        this.io.to(`order:${orderId}`).emit('rider:location_updated', {
          rider_id: socket.userId,
          latitude,
          longitude,
          accuracy,
          timestamp: new Date(),
          order_id: orderId
        });
      }

      // Log event
      await db.query(
        `INSERT INTO websocket_events
         (user_id, event_type, event_name, room, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [socket.userId, 'location', 'location_update', `order:${orderId}`, JSON.stringify(data)]
      );
    } catch (error) {
      console.error('Error handling location update:', error);
      socket.emit('location:error', { message: 'Failed to process location' });
    }
  }

  /**
   * Handle order status change
   */
  async handleOrderStatusChange(socket, data) {
    try {
      const { orderId, newStatus, oldStatus, message } = data;

      if (!orderId || !newStatus) {
        socket.emit('order:error', { message: 'Missing order info' });
        return;
      }

      // Broadcast to order room (customers, merchants, rider)
      this.io.to(`order:${orderId}`).emit('order:status_updated', {
        order_id: orderId,
        previous_status: oldStatus,
        new_status: newStatus,
        message,
        timestamp: new Date(),
        updated_by: socket.userId,
        updated_by_role: socket.userRole
      });

      // Also send to user's personal room if it's not the updater
      socket.emit('order:status_confirmed', {
        order_id: orderId,
        status: newStatus
      });

      // Log event
      await db.query(
        `INSERT INTO websocket_events
         (user_id, event_type, event_name, room, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [socket.userId, 'order', 'status_changed', `order:${orderId}`, JSON.stringify(data)]
      );
    } catch (error) {
      console.error('Error handling order status change:', error);
      socket.emit('order:error', { message: 'Failed to update status' });
    }
  }

  /**
   * Send notification to specific user
   */
  async sendNotificationToUser(userId, notification) {
    try {
      // Save notification to database for persistence
      const result = await db.query(
        `INSERT INTO notifications (user_id, type, title, message, data, is_read)
         VALUES ($1, $2, $3, $4, $5, false)
         RETURNING id`,
        [
          userId,
          notification.type || 'general',
          notification.title || 'Notification',
          notification.message || '',
          JSON.stringify(notification.data || {})
        ]
      );

      const notificationId = result.rows[0].id;

      // Send real-time notification via WebSocket
      this.io.to(`user:${userId}`).emit('notification:new', {
        id: notificationId,
        ...notification,
        timestamp: new Date()
      });

      // Log event
      db.query(
        `INSERT INTO websocket_events
         (user_id, event_type, event_name, room, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'notification', 'new', `user:${userId}`, JSON.stringify(notification)]
      ).catch(err => console.error('Error logging notification event:', err));

      return notificationId;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      // Still send real-time notification even if database save fails
      this.io.to(`user:${userId}`).emit('notification:new', {
        ...notification,
        timestamp: new Date()
      });
    }
  }

  /**
   * Broadcast order update to all relevant parties
   */
  broadcastOrderUpdate(orderId, update) {
    this.io.to(`order:${orderId}`).emit('order:status_updated', {
      order_id: orderId,
      ...update,
      timestamp: new Date()
    });
  }

  /**
   * Notify customer of delivery progress
   */
  notifyDeliveryProgress(orderId, customerId, progress) {
    this.io.to(`user:${customerId}`).emit('delivery:progress', {
      order_id: orderId,
      ...progress,
      timestamp: new Date()
    });

    this.io.to(`order:${orderId}`).emit('delivery:progress', {
      order_id: orderId,
      ...progress,
      timestamp: new Date()
    });
  }

  /**
   * Handle notification read acknowledgement
   */
  async handleNotificationRead(socket, data) {
    try {
      const { notificationId } = data;

      // Update notification status in database
      await db.query(
        `UPDATE notifications SET is_read = TRUE WHERE id = $1`,
        [notificationId]
      );

      // Broadcast to user's rooms
      this.io.to(`user:${socket.userId}`).emit('notification:read_confirmed', {
        notification_id: notificationId
      });
    } catch (error) {
      console.error('Error handling notification read:', error);
    }
  }

  /**
   * Update heartbeat for socket
   */
  async updateHeartbeat(userId, socketId) {
    try {
      await db.query(
        `UPDATE websocket_sessions
         SET last_heartbeat = NOW()
         WHERE socket_id = $1`,
        [socketId]
      );
    } catch (error) {
      console.error('Error updating heartbeat:', error);
    }
  }

  /**
   * Handle socket disconnection
   */
  async handleDisconnect(socket) {
    try {
      // Mark session as inactive
      await db.query(
        `UPDATE websocket_sessions
         SET is_active = FALSE
         WHERE socket_id = $1`,
        [socket.id]
      );

      console.log(`❌ User ${socket.userId} disconnected (socket ${socket.id})`);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  /**
   * Store pending message for offline user
   */
  async storePendingMessage(userId, messageType, data) {
    try {
      // For notifications, also save to notifications table
      if (messageType === 'notification:new') {
        await this.sendNotificationToUser(userId, data);
      } else {
        await db.query(
          `INSERT INTO websocket_pending_messages
           (user_id, message_type, data, is_delivered)
           VALUES ($1, $2, $3, FALSE)`,
          [userId, messageType, JSON.stringify(data)]
        );
      }
    } catch (error) {
      console.error('Error storing pending message:', error);
    }
  }

  /**
   * Get and deliver pending messages to user
   */
  async deliverPendingMessages(socket) {
    try {
      const result = await db.query(
        `SELECT * FROM websocket_pending_messages
         WHERE user_id = $1 AND is_delivered = FALSE
         ORDER BY created_at ASC
         LIMIT 100`,
        [socket.userId]
      );

      for (const msg of result.rows) {
        socket.emit(msg.message_type, JSON.parse(msg.data));

        // Mark as delivered
        await db.query(
          `UPDATE websocket_pending_messages
           SET is_delivered = TRUE, delivered_at = NOW()
           WHERE id = $1`,
          [msg.id]
        );
      }
    } catch (error) {
      console.error('Error delivering pending messages:', error);
    }
  }

  /**
   * Get count of active connected users
   */
  async getConnectedUsersCount() {
    return this.io.engine.clientsCount;
  }

  /**
   * Get list of active sockets for a user
   */
  async getUserActiveSockets(userId) {
    const clients = await this.io.to(`user:${userId}`).fetchSockets();
    return clients.map(socket => ({
      socketId: socket.id,
      connectedAt: socket.handshake.time,
      ip: socket.handshake.address
    }));
  }

  // =====================================================
  // CHAT MESSAGING METHODS
  // =====================================================

  /**
   * Get all socket instances for a user (helper method)
   * Returns array of socket IDs
   */
  getUserSockets(userId) {
    const room = `user:${userId}`;
    const socketsInRoom = this.io.sockets.adapter.rooms.get(room);

    if (!socketsInRoom) {
      return [];
    }

    return Array.from(socketsInRoom).map(socketId => this.io.sockets.sockets.get(socketId)).filter(Boolean);
  }

  /**
   * Send chat message to receiver
   * @param {number} receiverId - Receiver user ID
   * @param {Object} message - Message object with content and metadata
   */
  async sendChatMessage(receiverId, message) {
    try {
      const sockets = this.getUserSockets(receiverId);

      if (sockets.length > 0) {
        // User is online - deliver immediately
        sockets.forEach(socket => {
          socket.emit('chat:message', message);
        });

        console.log(`[Chat] Message sent to user ${receiverId} (${sockets.length} sockets)`);
      } else {
        // User is offline - store as pending
        console.log(`[Chat] User ${receiverId} offline, storing message as pending`);
        await this.storePendingMessage(receiverId, 'chat:message', message);
      }

      // Log event
      await db.query(
        `INSERT INTO websocket_events
         (user_id, event_type, event_name, room, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [receiverId, 'chat', 'message', `user:${receiverId}`, JSON.stringify(message)]
      ).catch(err => console.error('Error logging chat message event:', err));
    } catch (error) {
      console.error('[WebSocketService] Error sending chat message:', error);
    }
  }

  /**
   * Send typing indicator to receiver
   * @param {number} receiverId - Receiver user ID
   * @param {number} conversationId - Conversation ID
   * @param {boolean} isTyping - Whether user is typing
   * @param {string} senderName - Name of user who is typing
   */
  async sendTypingIndicator(receiverId, conversationId, isTyping, senderName) {
    try {
      const sockets = this.getUserSockets(receiverId);

      sockets.forEach(socket => {
        socket.emit('chat:typing', {
          conversation_id: conversationId,
          is_typing: isTyping,
          sender_name: senderName,
          timestamp: new Date()
        });
      });

      console.log(`[Chat] Typing indicator (${isTyping}) sent to user ${receiverId} for conversation ${conversationId}`);
    } catch (error) {
      console.error('[WebSocketService] Error sending typing indicator:', error);
    }
  }

  /**
   * Send unread count update to user
   * @param {number} userId - User ID
   * @param {number} unreadCount - Total unread message count
   */
  async sendUnreadUpdate(userId, unreadCount) {
    try {
      const sockets = this.getUserSockets(userId);

      sockets.forEach(socket => {
        socket.emit('chat:unread_update', {
          unread_count: unreadCount,
          timestamp: new Date()
        });
      });

      console.log(`[Chat] Unread count (${unreadCount}) sent to user ${userId}`);
    } catch (error) {
      console.error('[WebSocketService] Error sending unread update:', error);
    }
  }

  // =====================================================
  // CHATBOT METHODS
  // =====================================================

  /**
   * Send chatbot response to user
   * @param {number} userId - User ID
   * @param {Object} response - Chatbot response object
   */
  async sendChatbotResponse(userId, response) {
    try {
      const sockets = this.getUserSockets(userId);

      sockets.forEach(socket => {
        socket.emit('chatbot:message', {
          ...response,
          timestamp: new Date()
        });
      });

      console.log(`[Chatbot] Response sent to user ${userId}`);

      // Log event
      await db.query(
        `INSERT INTO websocket_events
         (user_id, event_type, event_name, room, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'chatbot', 'message', `user:${userId}`, JSON.stringify(response)]
      ).catch(err => console.error('Error logging chatbot message event:', err));
    } catch (error) {
      console.error('[WebSocketService] Error sending chatbot response:', error);
    }
  }
}

module.exports = WebSocketService;
