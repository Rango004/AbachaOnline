import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';

export default function MerchantDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'merchant') {
      route('/products');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load products
      const productsResponse = await api.getMerchantProducts();
      const productsData = productsResponse.products || productsResponse;
      const activeProducts = productsData.filter(p => p.is_active).length;

      // Load orders
      const ordersResponse = await api.getOrders();
      const ordersData = ordersResponse.orders || ordersResponse;
      const pendingOrders = ordersData.filter(o =>
        ['pending', 'confirmed', 'preparing'].includes(o.order_status)
      ).length;

      setStats({
        totalProducts: productsData.length,
        activeProducts: activeProducts,
        pendingOrders: pendingOrders,
        totalOrders: ordersData.length
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMerchantSupport = () => {
    // Check if ChatWidget exists and open it
    const chatWidget = document.querySelector('.chat-widget');
    if (chatWidget) {
      // Trigger chat widget open
      const chatButton = chatWidget.querySelector('button');
      if (chatButton) {
        chatButton.click();
      }
    } else {
      // Fallback: show merchant support message
      alert('Merchant support chat will be available soon. Please contact us at merchant-support@abachaonline.com');
    }
  };

  if (loading) {
    return <div class="page"><div class="loading">Loading dashboard...</div></div>;
  }

  return (
    <div class="page merchant-dashboard">
      <div class="container">
        <h2>Merchant Dashboard</h2>
        <p class="welcome-text">Welcome back, {user?.name}!</p>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-value">{stats.totalProducts}</div>
              <div class="stat-label">Total Products</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{stats.activeProducts}</div>
              <div class="stat-label">Active Products</div>
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
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-value">{stats.totalOrders}</div>
              <div class="stat-label">Total Orders</div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="btn-action" onClick={() => route('/merchant/products')}>
              <span class="btn-icon">📦</span>
              <span>Manage Products</span>
            </button>
            <button class="btn-action" onClick={() => route('/merchant/orders')}>
              <span class="btn-icon">📋</span>
              <span>View Orders</span>
            </button>
            <button class="btn-action" onClick={() => route('/merchant/payouts')}>
              <span class="btn-icon">💳</span>
              <span>View Payouts</span>
            </button>
            <button class="btn-action" onClick={() => route('/merchant/settings')}>
              <span class="btn-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div class="dashboard-info">
          <div class="info-card">
            <h3>💡 Getting Started</h3>
            <ul>
              <li>Add your products to start receiving orders</li>
              <li>Keep your product stock updated</li>
              <li>Respond to orders promptly</li>
              <li>Update order status as you prepare items</li>
            </ul>
          </div>
          
          <div class="info-card">
            <h3>📞 Contact Support</h3>
            <p>Need help with your merchant account?</p>
            <button class="btn-secondary" onClick={openMerchantSupport}>
              💬 Chat with Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
