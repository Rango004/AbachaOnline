import { createContext } from 'preact';
import { useState, useEffect, useRef, useCallback, useContext } from 'preact/hooks';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { notifyUser, getNotificationType, initAudioContext } from './NotificationUtils';

export const WebSocketContext = createContext();

// Track if audio context has been initialized (requires user interaction)
let audioInitialized = false;

// Initialize audio on first user interaction
function setupAudioInit() {
  const initOnInteraction = () => {
    if (!audioInitialized) {
      initAudioContext();
      audioInitialized = true;
    }
    // Remove listeners after first interaction
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  };

  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('touchstart', initOnInteraction, { once: true });
  document.addEventListener('keydown', initOnInteraction, { once: true });
}

// Setup audio initialization listeners
if (typeof document !== 'undefined') {
  setupAudioInit();
}

export function WebSocketProvider({ children }) {
  const { user, token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deliveryUpdates, setDeliveryUpdates] = useState({});
  const [wsError, setWsError] = useState(null);
  const socketRef = useRef(null);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    // Check if user is authenticated (has token and user object)
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    try {
      // Connect to WebSocket server - use API URL from environment variable
      const wsUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
      const newSocket = io(
        wsUrl,
        {
          auth: {
            token: token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling']
        }
      );

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection established
      newSocket.on('connect', () => {
        setIsConnected(true);
        setWsError(null); // Clear error on successful connection
        // Initialize audio context if not already done
        if (!audioInitialized) {
          initAudioContext();
          audioInitialized = true;
        }
      });

      // Connection lost
      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Connection error
      newSocket.on('connect_error', (error) => {
        setWsError(`Connection failed: ${error.message}`);
      });

      // Authentication error
      newSocket.on('error', (error) => {
        setWsError(`WebSocket error: ${error}`);
      });

      // New notification received
      newSocket.on('notification:new', (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        // Play sound and vibrate for notification
        const notifType = getNotificationType(notification);
        notifyUser(notifType);
        // Dispatch event for other components to listen to
        window.dispatchEvent(new CustomEvent('notification:new', {
          detail: notification
        }));
      });

      // Notification marked as read
      newSocket.on('notification:marked_read', (data) => {
        setNotifications(prev =>
          prev.map(n => n.id === data.notificationId ? { ...n, is_read: true } : n)
        );
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('notification:marked_read', {
          detail: { notificationId: data.notificationId }
        }));
      });

      // Notification deleted
      newSocket.on('notification:deleted', (data) => {
        setNotifications(prev => prev.filter(n => n.id !== data.notificationId));
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('notification:deleted', {
          detail: { notificationId: data.notificationId }
        }));
      });

      // Order status updated
      newSocket.on('order:status_updated', (update) => {
        // Play sound and vibrate for order updates
        notifyUser('order');
        // Trigger re-fetch of orders in the component using this context
        window.dispatchEvent(new CustomEvent('order:status_updated', { detail: update }));
      });

      // Delivery progress update
      newSocket.on('delivery:progress', (progress) => {
        setDeliveryUpdates(prev => ({
          ...prev,
          [progress.order_id]: progress
        }));
        window.dispatchEvent(new CustomEvent('delivery:progress', { detail: progress }));
      });

      // Rider location updated (GPS coordinates - do not log)
      newSocket.on('rider:location_updated', (location) => {
        window.dispatchEvent(new CustomEvent('rider:location_updated', { detail: location }));
      });

      // Route optimization complete
      newSocket.on('route:optimized', (routeData) => {
        console.log('Route optimization received:', routeData);
        window.dispatchEvent(new CustomEvent('route:optimized', { detail: routeData }));
      });

      // Chat message received
      newSocket.on('chat:message', (message) => {
        // Play sound and vibrate for incoming chat message
        // Only notify if the message is from someone else
        if (message.sender_id !== user?.id) {
          notifyUser('chat');
        }
        window.dispatchEvent(new CustomEvent('chat:message', { detail: message }));
      });

      // Typing indicator received
      newSocket.on('chat:typing', (data) => {
        window.dispatchEvent(new CustomEvent('chat:typing', { detail: data }));
      });

      // Message read receipt received
      newSocket.on('chat:message_read_receipt', (data) => {
        window.dispatchEvent(new CustomEvent('chat:message_read_receipt', { detail: data }));
      });

      // Multiple messages read receipt received
      newSocket.on('chat:messages_read_receipt', (data) => {
        window.dispatchEvent(new CustomEvent('chat:messages_read_receipt', { detail: data }));
      });

      // Chat unread count update
      newSocket.on('chat:unread_update', (data) => {
        window.dispatchEvent(new CustomEvent('chat:unread_update', { detail: data }));
      });

      // Error handler
      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        setWsError(`WebSocket error: ${error.message || 'Unknown error'}`);
      });

      // Connection error
      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setWsError(`Connection failed: ${error.message || 'Unknown error'}`);
      });

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        if (newSocket && newSocket.connected) {
          newSocket.emit('ping');
        }
      }, 30000);

      return () => {
        clearInterval(heartbeatInterval);
        if (newSocket) {
          // Remove all event listeners to prevent memory leaks
          newSocket.off('connect');
          newSocket.off('disconnect');
          newSocket.off('notification:new');
          newSocket.off('notification:marked_read');
          newSocket.off('notification:deleted');
          newSocket.off('order:status_updated');
          newSocket.off('delivery:progress');
          newSocket.off('rider:location_updated');
          newSocket.off('route:optimized');
          newSocket.off('chat:message');
          newSocket.off('chat:typing');
          newSocket.off('chat:message_read_receipt');
          newSocket.off('chat:messages_read_receipt');
          newSocket.off('chat:unread_update');
          newSocket.off('error');
          newSocket.off('connect_error');
          newSocket.disconnect();
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }, [token, user]);

  /**
   * Join order room to receive order-specific updates
   */
  const joinOrderRoom = useCallback((orderId) => {
    if (socket && socket.connected) {
      socket.emit('order:join_room', orderId);
    }
  }, [socket]);

  /**
   * Leave order room
   */
  const leaveOrderRoom = useCallback((orderId) => {
    if (socket && socket.connected) {
      socket.emit('order:leave_room', orderId);
    }
  }, [socket]);

  /**
   * Emit location update (for riders)
   */
  const updateLocation = useCallback((latitude, longitude, accuracy, orderId) => {
    if (socket && socket.connected) {
      socket.emit('rider:location_update', {
        latitude,
        longitude,
        accuracy,
        orderId,
        timestamp: new Date()
      });
    }
  }, [socket]);

  /**
   * Emit order status change
   */
  const emitOrderStatusChange = useCallback((orderId, newStatus, oldStatus, message) => {
    if (socket && socket.connected) {
      socket.emit('order:status_changed', {
        orderId,
        newStatus,
        oldStatus,
        message,
        timestamp: new Date()
      });
    }
  }, [socket]);

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = useCallback((notificationId) => {
    if (socket && socket.connected) {
      socket.emit('notification:read', {
        notificationId
      });
    }
  }, [socket]);

  /**
   * Clear local notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Send typing indicator to other user
   */
  const sendTypingIndicator = useCallback((conversationId, receiverId, isTyping, senderName) => {
    if (socket && socket.connected) {
      socket.emit('chat:typing', {
        conversationId,
        receiverId,
        isTyping,
        senderName
      });
    }
  }, [socket]);

  /**
   * Mark a message as read
   */
  const markMessageAsRead = useCallback((messageId, conversationId, senderId) => {
    if (socket && socket.connected) {
      socket.emit('chat:message_read', {
        messageId,
        conversationId,
        senderId
      });
    }
  }, [socket]);

  /**
   * Mark all messages in conversation as seen
   */
  const markMessagesAsSeen = useCallback((conversationId, senderId) => {
    if (socket && socket.connected) {
      socket.emit('chat:messages_seen', {
        conversationId,
        senderId
      });
    }
  }, [socket]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        deliveryUpdates,
        wsError,
        joinOrderRoom,
        leaveOrderRoom,
        updateLocation,
        emitOrderStatusChange,
        markNotificationAsRead,
        clearNotifications,
        sendTypingIndicator,
        markMessageAsRead,
        markMessagesAsSeen
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Custom hook to use WebSocket context
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
