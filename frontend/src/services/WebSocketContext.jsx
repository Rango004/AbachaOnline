import { createContext } from 'preact';
import { useState, useEffect, useRef, useCallback, useContext } from 'preact/hooks';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const WebSocketContext = createContext();

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
      // Connect to WebSocket server
      const newSocket = io(
        import.meta.env.PROD ? window.location.origin : 'http://localhost:3000',
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
        clearNotifications
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
