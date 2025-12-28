import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import api from '../services/api';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications(100, 0);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      alert('Failed to load notifications: ' + err.message);
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
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      alert('Failed to mark as read: ' + err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllAsRead();
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      alert('Failed to mark all as read: ' + err.message);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Delete this notification?')) return;

    try {
      await api.deleteNotification(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      alert('Failed to delete notification: ' + err.message);
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
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleString();
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data) {
      try {
        const data = JSON.parse(notification.data);
        if (data.order_id) {
          route(`/orders/${data.order_id}`);
        }
      } catch (err) {
        console.error('Failed to parse notification data:', err);
      }
    }
  };

  return (
    <div class="notifications-page">
      <div class="page-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button class="mark-all-read-btn" onClick={handleMarkAllAsRead}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {loading && (
        <div class="loading-state">
          <p>Loading notifications...</p>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h2>No notifications yet</h2>
          <p>You'll see notifications about your orders and refunds here</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div class="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              class={`notification-card ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div class="notification-icon-large">
                {getNotificationIcon(notification.type)}
              </div>
              <div class="notification-body">
                <div class="notification-title">
                  {notification.title}
                  {!notification.is_read && <span class="unread-dot"></span>}
                </div>
                <div class="notification-message">{notification.message}</div>
                <div class="notification-meta">
                  <span class="notification-time">{formatTime(notification.created_at)}</span>
                  {notification.data && (() => {
                    try {
                      const data = JSON.parse(notification.data);
                      if (data.tracking_number) {
                        return <span class="notification-tracking"> • Order #{data.tracking_number}</span>;
                      }
                    } catch (err) {
                      return null;
                    }
                  })()}
                </div>
              </div>
              <div class="notification-actions-inline">
                {!notification.is_read && (
                  <button
                    class="action-btn mark-read"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  class="action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
