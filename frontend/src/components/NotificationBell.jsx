import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';
import { useWebSocket } from '../services/WebSocketContext';
import './NotificationBell.css';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isConnected, notifications: wsNotifications } = useWebSocket();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    // Subscribe to WebSocket events for real-time updates
    const handleNewNotification = (event) => {
      const notification = event.detail;
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationMarkedRead = (event) => {
      const { notificationId } = event.detail;
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      loadUnreadCount();
    };

    const handleNotificationDeleted = (event) => {
      const { notificationId } = event.detail;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadUnreadCount();
    };

    window.addEventListener('notification:new', handleNewNotification);
    window.addEventListener('notification:marked_read', handleNotificationMarkedRead);
    window.addEventListener('notification:deleted', handleNotificationDeleted);

    return () => {
      window.removeEventListener('notification:new', handleNewNotification);
      window.removeEventListener('notification:marked_read', handleNotificationMarkedRead);
      window.removeEventListener('notification:deleted', handleNotificationDeleted);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications(10, 0);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markAsRead(notificationId);
      // Update local state immediately for optimistic UI
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('notification:marked_read', {
        detail: { notificationId }
      }));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId);
      // Update local state immediately
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadUnreadCount();
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('notification:deleted', {
        detail: { notificationId }
      }));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      loadNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'refund_approved':
        return '✅';
      case 'refund_rejected':
        return '❌';
      case 'order_status':
        return '📦';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div class="notification-bell-container">
      <button
        class="notification-bell-button"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span class="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div class="notification-dropdown">
          <div class="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                class="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div class="notification-list">
            {loading && (
              <div class="notification-loading">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div class="notification-empty">
                <p>No notifications</p>
              </div>
            )}

            {!loading && notifications.map((notification) => (
              <div
                key={notification.id}
                class={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div class="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span class="notification-time">{formatTime(notification.created_at)}</span>
                </div>
                <div class="notification-actions">
                  {!notification.is_read && (
                    <button
                      class="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    class="delete-btn"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <div class="notification-footer">
              <a href="/notifications">View all notifications</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
