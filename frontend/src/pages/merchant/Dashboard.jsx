import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';
import OfflineSync from '../../services/OfflineSyncService';
import { getNetworkStatus } from '../../services/NativeBridge';

export default function MerchantDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [offlineMessage, setOfflineMessage] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (user?.role !== 'merchant') {
      route('/products');
      return;
    }
    loadStats();

    // Listen for network changes
    const handleOnline = () => {
      setIsOffline(false);
      setOfflineMessage(null);
      loadStats(); // Refresh when back online
    };
    const handleOffline = () => {
      setIsOffline(true);
      setOfflineMessage('You are offline - some features are limited');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setOfflineMessage(null);
      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Load from cache when offline
        console.log('[MerchantDashboard] Offline - loading from cache');
        setIsOffline(true);

        const cachedStats = await OfflineSync.getCachedDashboardStats('merchant');
        if (cachedStats) {
          setStats(cachedStats);
          setOfflineMessage('Viewing cached data - offline mode');
          console.log('[MerchantDashboard] Loaded stats from cache');
        } else {
          setOfflineMessage('No cached data available offline');
        }

        setLoading(false);
        return;
      }

      // Online - fetch from server
      setIsOffline(false);

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

      const newStats = {
        totalProducts: productsData.length,
        activeProducts: activeProducts,
        pendingOrders: pendingOrders,
        totalOrders: ordersData.length
      };

      setStats(newStats);

      // Cache stats for offline access
      await OfflineSync.cacheDashboardStats('merchant', newStats);

      // Also cache orders for offline viewing
      if (ordersData.length > 0) {
        await OfflineSync.cacheOrders(ordersData);
      }
    } catch (err) {
      console.error('Error loading stats:', err);

      // Try cache as fallback
      try {
        const cachedStats = await OfflineSync.getCachedDashboardStats('merchant');
        if (cachedStats) {
          setStats(cachedStats);
          setOfflineMessage('Using cached data - connection failed');
          console.log('[MerchantDashboard] Using cached stats after error');
        }
      } catch (cacheErr) {
        console.error('[MerchantDashboard] Cache fallback failed:', cacheErr);
      }
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
