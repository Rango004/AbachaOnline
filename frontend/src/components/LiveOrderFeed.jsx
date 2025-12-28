import { useState, useEffect } from 'preact/hooks';
import { useWebSocket } from '../services/WebSocketContext';
import api from '../services/api';

export default function LiveOrderFeed() {
  const { isConnected, socket } = useWebSocket();
  const [liveOrders, setLiveOrders] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);

  // Load initial orders from API
  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrderAudit();
      if (data && data.orders) {
        // Format orders for display and limit to 20 most recent
        const formattedOrders = data.orders
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 20)
          .map(order => ({
            id: order.id,
            order_id: order.id,
            customer: order.customer_name || `Customer ${order.customer_id}`,
            merchant: order.merchant_name || `Merchant ${order.merchant_id}`,
            status: order.order_status || 'pending',
            amount: parseFloat(order.total_amount || 0),
            timestamp: order.created_at || new Date().toISOString()
          }));
        setLiveOrders(formattedOrders);
      }
    } catch (err) {
      console.error('Error loading recent orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for real-time order updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    // Listen for order updates
    const handleOrderUpdate = (data) => {
      setLiveOrders(prev => {
        const existing = prev.findIndex(o => o.id === data.id);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], ...data };
          return updated;
        }
        return [data, ...prev].slice(0, 20);
      });
    };

    socket.on('order:status_updated', handleOrderUpdate);

    return () => {
      socket.off('order:status_updated', handleOrderUpdate);
    };
  }, [socket]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#fbbf24',
      'confirmed': '#60a5fa',
      'preparing': '#8b5cf6',
      'ready': '#34d399',
      'in_delivery': '#f97316',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'ready': '📦',
      'in_delivery': '🚗',
      'delivered': '🎉',
      'cancelled': '❌'
    };
    return emojis[status] || '📋';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3 style="margin: 0; font-size: 1.1em; color: #1f2937;">🔴 Live Orders Feed</h3>
          <p style="margin: 4px 0 0 0; font-size: 0.85em; color: #6b7280;">
            {isConnected ? (
              <span style="color: #10b981;">● Connected - Real-time updates active</span>
            ) : (
              <span style="color: #ef4444;">● Disconnected - Polling fallback</span>
            )}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.4em; font-weight: bold; color: #3b82f6;">{liveOrders.length}</div>
          <div style="font-size: 0.75em; color: #6b7280;">Orders</div>
        </div>
      </div>

      <div style="max-height: 600px; overflow-y: auto;">
        {loading ? (
          <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
            <p>Loading recent orders...</p>
          </div>
        ) : liveOrders.length === 0 ? (
          <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
            <p>No orders yet. Real-time feed will appear here.</p>
          </div>
        ) : (
          <div>
            {liveOrders.slice(0, visibleCount).map(order => (
              <div
                key={order.id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: '#f9fafb',
                  border: `2px solid ${getStatusColor(order.new_status || order.status)}`,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #1f2937;">
                    Order #{order.order_id || order.id}
                  </div>
                  <div style="font-size: 0.85em; color: #6b7280; margin-top: 4px;">
                    {order.customer} → {order.merchant}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 1.4em;">{getStatusEmoji(order.new_status || order.status)}</span>
                    <span style={{
                      padding: '2px 8px',
                      background: getStatusColor(order.new_status || order.status),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.8em',
                      fontWeight: '600'
                    }}>
                      {(order.new_status || order.status)?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div style="font-size: 0.75em; color: #9ca3af;">
                    Le {order.amount?.toLocaleString() || order.total_amount?.toLocaleString()}
                  </div>
                  <div style="font-size: 0.7em; color: #d1d5db; margin-top: 2px;">
                    {formatTime(order.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {liveOrders.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(v => v + 5)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontWeight: '500',
                  marginTop: '8px'
                }}
              >
                Show {Math.min(5, liveOrders.length - visibleCount)} more...
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
