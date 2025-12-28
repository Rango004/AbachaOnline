import { useState, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';
import { route } from 'preact-router';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersData] = await Promise.all([
        api.getOrders()
      ]);

      const orders = ordersData.orders || [];

      // Calculate statistics
      const stats = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
        pendingOrders: orders.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled').length,
        deliveredOrders: orders.filter(o => o.order_status === 'delivered').length
      };

      setStats(stats);

      // Get recent orders (last 5)
      const recent = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
      setRecentOrders(recent);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status.replace(/_/g, '-')}`;
    const statusText = status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    return <span class={statusClass}>{statusText}</span>;
  };

  if (loading) {
    return <div class="page"><div class="loading">Loading dashboard...</div></div>;
  }

  return (
    <div class="page student-dashboard">
      <div class="container">
        <div class="dashboard-header">
          <h1>Welcome back, {user?.name || 'Student'}!</h1>
          <p class="subtitle">Your order summary and activity</p>
        </div>

        {error && <div class="alert alert-error">{error}</div>}

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-value">{stats.totalOrders}</div>
              <div class="stat-label">Total Orders</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-value">Le {stats.totalSpent.toFixed(2)}</div>
              <div class="stat-label">Total Spent</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-value">{stats.pendingOrders}</div>
              <div class="stat-label">Pending Orders</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✓</div>
            <div class="stat-content">
              <div class="stat-value">{stats.deliveredOrders}</div>
              <div class="stat-label">Delivered Orders</div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="actions-grid">
            <button class="action-btn" onClick={() => route('/products')}>
              <span class="action-icon">🛍️</span>
              <span class="action-text">Browse Products</span>
            </button>
            <button class="action-btn" onClick={() => route('/orders')}>
              <span class="action-icon">📋</span>
              <span class="action-text">View Orders</span>
            </button>
            <button class="action-btn" onClick={() => route('/cart')}>
              <span class="action-icon">🛒</span>
              <span class="action-text">View Cart</span>
            </button>
            <button class="action-btn" onClick={() => route('/notifications')}>
              <span class="action-icon">🔔</span>
              <span class="action-text">Notifications</span>
            </button>
          </div>
        </div>

        <div class="recent-section">
          <div class="section-header">
            <h3>Recent Orders</h3>
            <button class="link-btn" onClick={() => route('/orders')}>View All</button>
          </div>

          {recentOrders.length === 0 ? (
            <div class="empty-state">
              <p>No orders yet. <a href="/products">Start shopping!</a></p>
            </div>
          ) : (
            <div class="orders-table-responsive">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} class="order-row" onClick={() => route(`/orders/${order.id}`)}>
                      <td class="order-id">#{order.id}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td class="order-items">{order.item_count || '—'}</td>
                      <td class="order-amount">Le {parseFloat(order.total_amount).toFixed(2)}</td>
                      <td>{getStatusBadge(order.order_status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div class="info-section">
          <h3>Need Help?</h3>
          <div class="help-cards">
            <div class="help-card">
              <h4>📱 Contact Support</h4>
              <p>Have questions? Reach out to our customer support team.</p>
            </div>
            <div class="help-card">
              <h4>🚚 Track Orders</h4>
              <p>Get real-time updates on your order delivery status.</p>
            </div>
            <div class="help-card">
              <h4>💳 Payment Info</h4>
              <p>View your transaction history and payment methods.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
