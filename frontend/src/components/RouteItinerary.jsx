import { useState } from 'preact/hooks';
import '../styles/RouteItinerary.css';

export default function RouteItinerary({ route, onStartRoute, onMarkDelivered }) {
  const [expandedStop, setExpandedStop] = useState(null);

  if (!route || !route.itinerary || route.itinerary.length === 0) {
    return (
      <div class="route-itinerary">
        <p class="empty-message">No stops in this route</p>
      </div>
    );
  }

  const totalDistance = route.total_distance_m ? (route.total_distance_m / 1000).toFixed(2) : '0.00';
  const completedStops = route.itinerary.filter(stop => stop.order_status === 'delivered').length;

  const getStopIcon = (stopNumber) => {
    const icons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return icons[stopNumber - 1] || `${stopNumber}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'in_delivery': return '#FF9800';
      case 'ready': return '#2196F3';
      default: return '#999';
    }
  };

  return (
    <div class="route-itinerary">
      <div class="itinerary-header">
        <h3>Route Itinerary</h3>
        <div class="route-summary">
          <div class="summary-item">
            <span class="label">Total Distance:</span>
            <strong>{route.distance_info?.total_distance_km || totalDistance} km</strong>
          </div>
          <div class="summary-item">
            <span class="label">Total Stops:</span>
            <strong>{route.itinerary.length}</strong>
          </div>
          <div class="summary-item">
            <span class="label">Completed:</span>
            <strong>{completedStops}/{route.itinerary.length}</strong>
          </div>
          {route.time_estimate && (
            <div class="summary-item">
              <span class="label">Est. Time:</span>
              <strong style={{ color: '#FF6B6B' }}>{route.time_estimate.total_estimated_time_readable}</strong>
            </div>
          )}
          <div class="summary-item">
            <span class="label">Algorithm:</span>
            <strong>{route.algorithm === 'clarke_wright' ? 'Clarke-Wright' : 'Nearest Neighbor'}</strong>
          </div>
        </div>
        {route.distance_info?.distance_description && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
            📍 {route.distance_info.distance_description}
          </div>
        )}
      </div>

      {onStartRoute && (
        <button class="btn-start-route" onClick={onStartRoute}>
          🚀 Start Route
        </button>
      )}

      <div class="stops-list">
        {route.itinerary.map((stop, index) => (
          <div
            key={stop.order_id}
            class={`stop-card status-${stop.order_status}`}
            style={{ borderLeftColor: getStatusColor(stop.order_status) }}
          >
            <div class="stop-header" onClick={() => setExpandedStop(expandedStop === index ? null : index)}>
              <div class="stop-number-badge">
                {getStopIcon(stop.stop_number)}
              </div>
              <div class="stop-main-info">
                <div class="customer-name">{stop.customer_name}</div>
                <div class="order-number">Order #{stop.tracking_number.substring(0, 8)}</div>
                <div class="address">{stop.delivery_address}</div>
              </div>
              <div class="stop-amount">
                <div>Le {stop.total_amount ? parseFloat(stop.total_amount).toFixed(0) : '0'}</div>
                <div style={{ fontSize: '12px', color: '#FF6B6B', fontWeight: 'bold', marginTop: '4px' }}>
                  🕐 {stop.estimated_arrival_minutes || (index * 8)}m
                </div>
              </div>
              <div class="expand-icon">
                {expandedStop === index ? '▼' : '▶'}
              </div>
            </div>

            {expandedStop === index && (
              <div class="stop-details">
                <div class="detail-row">
                  <span class="detail-label">Customer Phone:</span>
                  <span class="detail-value">
                    <a href={`tel:${stop.customer_phone}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                      {stop.customer_phone || 'N/A'}
                    </a>
                  </span>
                </div>

                <div class="detail-row" style={{ backgroundColor: '#FFF3E0', padding: '8px', borderRadius: '4px' }}>
                  <span class="detail-label">⏱️ Estimated Arrival:</span>
                  <span class="detail-value" style={{ fontWeight: 'bold', color: '#FF6B6B' }}>
                    {stop.estimated_arrival_minutes || (index * 8)} minutes from start
                  </span>
                </div>

                {stop.items && stop.items.length > 0 && (
                  <div class="detail-row items-row">
                    <span class="detail-label">Items:</span>
                    <div class="items-list">
                      {stop.items.map((item, idx) => (
                        <div key={idx} class="item">
                          <span class="item-name">{item.name}</span>
                          <span class="item-qty">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">Le {stop.total_amount ? parseFloat(stop.total_amount).toFixed(2) : '0.00'}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class={`status-badge status-${stop.order_status}`}>
                    {stop.order_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {onMarkDelivered && stop.order_status !== 'delivered' && (
                  <button
                    class="btn-mark-delivered"
                    onClick={() => onMarkDelivered(stop.order_id)}
                  >
                    ✓ Mark as Delivered
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div class="itinerary-footer">
        <p class="instruction">Click on any stop to view details and mark as delivered</p>
      </div>
    </div>
  );
}
