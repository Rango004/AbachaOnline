import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';
import { useWebSocket } from '../services/WebSocketContext';
import OfflineSync from '../services/OfflineSyncService';
import { getNetworkStatus } from '../services/NativeBridge';

export default function Orders() {
  const { isConnected, joinOrderRoom, leaveOrderRoom } = useWebSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [offlineMessage, setOfflineMessage] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  // Join/leave order rooms when orders change
  useEffect(() => {
    if (!isConnected) return;

    const currentOrderIds = orders.map(o => o.id);
    const newJoinedRooms = [];

    // Join rooms for new orders
    currentOrderIds.forEach(orderId => {
      if (!joinedRooms.includes(orderId)) {
        joinOrderRoom(orderId);
        newJoinedRooms.push(orderId);
      }
    });

    // Leave rooms for orders that are no longer displayed
    joinedRooms.forEach(roomId => {
      if (!currentOrderIds.includes(roomId)) {
        leaveOrderRoom(roomId);
      }
    });

    setJoinedRooms(currentOrderIds);

    return () => {
      // Clean up on unmount
      currentOrderIds.forEach(orderId => {
        leaveOrderRoom(orderId);
      });
    };
  }, [orders, isConnected, joinOrderRoom, leaveOrderRoom, joinedRooms]);

  // Listen for real-time order updates via WebSocket
  useEffect(() => {
    const handleOrderUpdate = (event) => {
      const update = event.detail;
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === update.order_id
            ? { ...order, order_status: update.new_status }
            : order
        )
      );
    };

    window.addEventListener('order:status_updated', handleOrderUpdate);
    return () => window.removeEventListener('order:status_updated', handleOrderUpdate);
  }, []);

  const loadOrders = async () => {
    try {
      setOfflineMessage(null);
      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Load from cache when offline
        console.log('[Orders] Offline - loading from cache');
        const cachedOrders = await OfflineSync.getCachedOrders();

        if (cachedOrders && cachedOrders.length > 0) {
          setOrders(cachedOrders);
          setOfflineMessage('Viewing cached orders - offline mode');
          console.log(`[Orders] Loaded ${cachedOrders.length} orders from cache`);
        } else {
          setOfflineMessage('No cached orders available offline');
        }
        setLoading(false);
        return;
      }

      // Online - fetch from server
      const data = await api.getOrders();
      const ordersList = data.orders || [];
      setOrders(ordersList);

      // Cache orders for offline access
      if (ordersList.length > 0) {
        await OfflineSync.cacheOrders(ordersList);
      }
    } catch (err) {
      console.error('Error loading orders:', err);

      // Try cache as fallback
      try {
        const cachedOrders = await OfflineSync.getCachedOrders();
        if (cachedOrders && cachedOrders.length > 0) {
          setOrders(cachedOrders);
          setOfflineMessage('Using cached orders - connection failed');
          console.log('[Orders] Using cached orders after error');
        }
      } catch (cacheErr) {
        console.error('[Orders] Cache fallback failed:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div class="page"><div class="loading">Loading orders...</div></div>;
  }

  return (
    <div class="page orders-page">
      <div class="container">
        {/* Offline Mode Banner */}
        {offlineMessage && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>📡</span>
            <span style={{ color: '#e65100', fontWeight: '500' }}>{offlineMessage}</span>
          </div>
        )}

        <h2>My Orders</h2>

        {orders.length === 0 && !offlineMessage ? (
          <div class="empty-state">
            <p>No orders yet</p>
            <a href="/products" class="btn-primary">Start Shopping</a>
          </div>
        ) : (
          <div class="orders-list">
            {orders.map(order => (
              <a href={`/orders/${order.id}`} class="order-card" key={order.id}>
                <div class="order-header">
                  <span class="order-id">Order #{order.id}</span>
                  <span class={`status status-${order.order_status}`}>
                    {order.order_status}
                  </span>
                </div>

                <div class="order-info">
                  <p>Total: <strong>Le {parseFloat(order.total_amount).toFixed(2)}</strong></p>
                  <p>Payment: {order.payment_method || 'Pending'}</p>
                  <p class="order-date">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
