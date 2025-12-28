import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';

const statusLabels = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  preparing: 'Being Prepared',
  ready: 'Ready for Pickup',
  assigned_rider: 'Rider Assigned',
  in_transit: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const statusIcons = {
  pending: '📝',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '📦',
  assigned_rider: '🏍️',
  in_transit: '🚚',
  delivered: '🎉',
  cancelled: '❌'
};

export default function OrderTracking({ orderId }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTracking();
  }, [orderId]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      const data = await api.getOrderTracking(orderId);
      setTracking(data);
    } catch (err) {
      setError(err.message || 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div class="loading">Loading tracking information...</div>;
  }

  if (error) {
    return <div class="message error">{error}</div>;
  }

  if (!tracking || !tracking.history) {
    return <div class="message info">No tracking information available</div>;
  }

  return (
    <div class="order-tracking">
      <div class="tracking-header">
        <h3>📍 Order Tracking</h3>
        <div class="tracking-number">
          <strong>Tracking #:</strong> {tracking.tracking_number}
        </div>
        <div class="current-status">
          <span class="status-icon">{statusIcons[tracking.current_status]}</span>
          <span class="status-text">{statusLabels[tracking.current_status] || tracking.current_status}</span>
        </div>
      </div>

      <div class="tracking-timeline">
        {tracking.history.map((event, index) => (
          <div
            key={event.id}
            class={`timeline-item ${index === tracking.history.length - 1 ? 'active' : ''}`}
          >
            <div class="timeline-marker">
              <span class="timeline-icon">{statusIcons[event.status]}</span>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h4>{statusLabels[event.status] || event.status}</h4>
                <span class="timeline-date">{formatDate(event.created_at)}</span>
              </div>
              {event.notes && (
                <p class="timeline-notes">{event.notes}</p>
              )}
              {event.location && (
                <p class="timeline-location">📍 {event.location}</p>
              )}
              {event.updated_by_name && (
                <p class="timeline-updater">
                  Updated by: {event.updated_by_name} ({event.updated_by_role})
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
