import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import ChangePassword from '../../components/ChangePassword';
import api from '../../services/api';
import AnalyticsTab from '../../components/AnalyticsTab';
import LiveOrderFeed from '../../components/LiveOrderFeed';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import AlertsPanel from '../../components/AlertsPanel';
import PayoutStatusWidget from '../../components/PayoutStatusWidget';
import RevenueByTierWidget from '../../components/RevenueByTierWidget';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [merchants, setMerchants] = useState([]);
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [settings, setSettings] = useState({});
  const [riderFee, setRiderFee] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('merchant');
  const [creationMethod, setCreationMethod] = useState('phone'); // 'phone' or 'email'
  const [createdMerchant, setCreatedMerchant] = useState(null); // Stores temp PIN data
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      route('/products');
      return;
    }
    
    // Check for tab from localStorage (from mobile menu)
    const savedTab = localStorage.getItem('adminActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
      localStorage.removeItem('adminActiveTab');
    }
    
    // Listen for tab changes from mobile menu
    const handleTabChange = (event) => {
      setActiveTab(event.detail.tab);
    };
    
    window.addEventListener('adminTabChange', handleTabChange);
    
    loadData();
    
    return () => {
      window.removeEventListener('adminTabChange', handleTabChange);
    };
  }, [user, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await api.getAdminStats();
      setStats(statsData);

      if (activeTab === 'merchants') {
        const data = await api.getMerchantAudit();
        setMerchants(data.merchants || []);
      } else if (activeTab === 'riders') {
        const data = await api.getRiderAudit();
        setRiders(data.riders || []);
      } else if (activeTab === 'customers') {
        const data = await api.getCustomerAudit();
        setCustomers(data.customers || []);
      } else if (activeTab === 'orders') {
        const data = await api.getOrderAudit();
        setOrders(data.orders || []);
      } else if (activeTab === 'settings') {
        const data = await api.getAdminSettings();
        setSettings(data || {});
        if (data.rider_delivery_fee) {
          setRiderFee(data.rider_delivery_fee.value || '');
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      alert('User status updated');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const details = await api.getUserDetail(userId);
      setUserDetails(details);
      setSelectedUser(userId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRefund = async (orderId) => {
    if (!confirm('Are you sure you want to refund this order?')) return;
    try {
      await api.refundOrder(orderId);
      alert('Order refunded successfully');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveRiderFee = async () => {
    if (!riderFee || isNaN(riderFee) || parseFloat(riderFee) < 0) {
      alert('Please enter a valid rider delivery fee');
      return;
    }
    try {
      setSavingSettings(true);
      await api.updateRiderDeliveryFee(parseFloat(riderFee));
      alert('Rider delivery fee updated successfully');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateUser = async () => {
    // Validation based on creation method
    if (creationMethod === 'email') {
      // Email-based creation (only for merchants)
      if (!newUserEmail || !newUserName) {
        alert('Please fill in all required fields (Email and Name)');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUserEmail)) {
        alert('Please enter a valid email address');
        return;
      }

      try {
        const result = await api.createMerchantWithEmail(
          newUserEmail,
          newUserName,
          newUserPhone || null
        );
        setCreatedMerchant(result);
        // Don't close modal yet - show temp PIN
      } catch (err) {
        alert(err.message || 'Failed to create merchant');
      }
    } else {
      // Phone-based creation (for merchants and riders)
      if (!newUserPhone || !newUserName || !newUserRole) {
        alert('Please fill in all fields');
        return;
      }

      // Basic phone validation
      if (!/^\+?[\d\s-]{10,}$/.test(newUserPhone)) {
        alert('Please enter a valid phone number');
        return;
      }

      try {
        await api.createAdminUser(newUserPhone, newUserName, newUserRole);
        alert(`${newUserRole === 'merchant' ? 'Merchant' : 'Rider'} created successfully`);
        setShowCreateUserModal(false);
        setNewUserPhone('');
        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('merchant');
        setCreationMethod('phone');
        loadData();
      } catch (err) {
        alert(err.message || `Failed to create ${newUserRole}`);
      }
    }
  };

  const closeCreateUserModal = () => {
    setShowCreateUserModal(false);
    setCreatedMerchant(null);
    setNewUserPhone('');
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('merchant');
    setCreationMethod('phone');
    loadData();
  };

  const openCreateUserModal = (role) => {
    setNewUserRole(role);
    setNewUserPhone('');
    setNewUserName('');
    setNewUserEmail('');
    setCreationMethod('phone');
    setCreatedMerchant(null);
    setShowCreateUserModal(true);
  };

  if (loading && !stats) return <div class="page"><p>Loading...</p></div>;

  return (
    <div class="page">
      <div class="container">
        <h2>🔧 Admin Dashboard</h2>

        {stats && (
          <div class="stats-grid">
            <div class="stat-card stat-blue" onClick={() => setActiveTab('customers')}>
              <div class="stat-icon">👥</div>
              <h3>{stats.total_customers}</h3>
              <p>Customers</p>
            </div>
            <div class="stat-card stat-orange" onClick={() => setActiveTab('merchants')}>
              <div class="stat-icon">🏪</div>
              <h3>{stats.total_merchants}</h3>
              <p>Merchants</p>
            </div>
            <div class="stat-card stat-purple" onClick={() => setActiveTab('riders')}>
              <div class="stat-icon">🚚</div>
              <h3>{stats.total_riders}</h3>
              <p>Riders</p>
            </div>
            <div class="stat-card stat-indigo" onClick={() => setActiveTab('orders')}>
              <div class="stat-icon">📦</div>
              <h3>{stats.total_orders}</h3>
              <p>Total Orders</p>
            </div>
            <div class="stat-card stat-green" onClick={() => setActiveTab('orders')}>
              <div class="stat-icon">✅</div>
              <h3>{stats.completed_orders}</h3>
              <p>Completed</p>
            </div>
            <div class="stat-card stat-yellow" onClick={() => setActiveTab('orders')}>
              <div class="stat-icon">⏳</div>
              <h3>{stats.active_orders}</h3>
              <p>Active</p>
            </div>
            <div class="stat-card stat-teal" onClick={() => setActiveTab('orders')}>
              <div class="stat-icon">💰</div>
              <h3>Le {parseFloat(stats.total_revenue).toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
            <div class="stat-card stat-pink" onClick={() => setActiveTab('orders')}>
              <div class="stat-icon">📈</div>
              <h3>Le {parseFloat(stats.today_revenue).toFixed(2)}</h3>
              <p>Today Revenue</p>
            </div>
          </div>
        )}

        <div class="tabs">
          <button class={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈 Analytics</button>
          <button class={`tab ${activeTab === 'merchants' ? 'active' : ''}`} onClick={() => setActiveTab('merchants')}>📊 Merchants</button>
          <button class={`tab ${activeTab === 'riders' ? 'active' : ''}`} onClick={() => setActiveTab('riders')}>🚚 Riders</button>
          <button class={`tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>👥 Customers</button>
          <button class={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 Orders</button>
          <button class={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Settings</button>
        </div>

        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AlertsPanel stats={stats} />
            <AnalyticsTab />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <LiveOrderFeed />
              <LeaderboardPanel />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <PayoutStatusWidget />
              <RevenueByTierWidget />
            </div>
          </div>
        )}

        {activeTab === 'merchants' && (
          <div class="table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Merchant Audit</h3>
              <button class="btn btn-primary" onClick={() => openCreateUserModal('merchant')}>+ Add Merchant</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Products</th>
                  <th>Orders</th>
                  <th>Completed</th>
                  <th>Sales</th>
                  <th>Avg Time (hrs)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.phone}</td>
                    <td>{m.total_products}</td>
                    <td>{m.total_orders}</td>
                    <td>{m.completed_orders}</td>
                    <td>Le {parseFloat(m.total_sales).toFixed(2)}</td>
                    <td>{parseFloat(m.avg_fulfillment_hours).toFixed(1)}</td>
                    <td><span class={`badge ${m.is_verified ? 'verified' : 'unverified'}`}>{m.is_verified ? 'Verified' : 'Unverified'}</span></td>
                    <td>
                      <button class="btn-sm btn-view" onClick={() => handleViewDetails(m.id)}>View</button>
                      <button class="btn-sm" onClick={() => handleToggleStatus(m.id, m.is_verified)}>{m.is_verified ? 'Suspend' : 'Verify'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'riders' && (
          <div class="table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Rider Audit</h3>
              <button class="btn btn-primary" onClick={() => openCreateUserModal('rider')}>+ Add Rider</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Completed</th>
                  <th>Active</th>
                  <th>Avg Time (min)</th>
                  <th>On-Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.phone}</td>
                    <td>{r.total_deliveries}</td>
                    <td>{r.completed_deliveries}</td>
                    <td>{r.active_deliveries}</td>
                    <td>{parseFloat(r.avg_delivery_minutes).toFixed(1)}</td>
                    <td>{r.on_time_deliveries}</td>
                    <td><span class={`badge ${r.is_verified ? 'verified' : 'unverified'}`}>{r.is_verified ? 'Verified' : 'Unverified'}</span></td>
                    <td>
                      <button class="btn-sm btn-view" onClick={() => handleViewDetails(r.id)}>View</button>
                      <button class="btn-sm" onClick={() => handleToggleStatus(r.is_verified)}>{r.is_verified ? 'Suspend' : 'Verify'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'customers' && (
          <div class="table-container">
            <h3>Customer Audit</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Completed</th>
                  <th>Cancelled</th>
                  <th>Total Spent</th>
                  <th>Avg Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.total_orders}</td>
                    <td>{c.completed_orders}</td>
                    <td>{c.cancelled_orders}</td>
                    <td>Le {parseFloat(c.total_spent).toFixed(2)}</td>
                    <td>Le {parseFloat(c.avg_order_value).toFixed(2)}</td>
                    <td><span class={`badge ${c.is_verified ? 'verified' : 'unverified'}`}>{c.is_verified ? 'Verified' : 'Unverified'}</span></td>
                    <td>
                      <button class="btn-sm btn-view" onClick={() => handleViewDetails(c.id)}>View</button>
                      <button class="btn-sm" onClick={() => handleToggleStatus(c.id, c.is_verified)}>{c.is_verified ? 'Suspend' : 'Verify'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div class="table-container">
            <h3>Order Audit</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Merchant</th>
                  <th>Rider</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time (hrs)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.merchant_name}</td>
                    <td>{o.rider_name || '-'}</td>
                    <td>Le {o.total_amount}</td>
                    <td><span class={`badge status-${o.order_status}`}>{o.order_status}</span></td>
                    <td>{o.fulfillment_hours ? parseFloat(o.fulfillment_hours).toFixed(1) : '-'}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div class="settings-container">
            <h3>⚙️ System Settings</h3>
            <div class="settings-section">
              <h4>Rider Delivery Fee</h4>
              <p class="setting-description">Commission/fee paid to riders per delivery in Leone (Le)</p>
              <div class="setting-input-group">
                <label>Amount (Le):</label>
                <input
                  type="number"
                  value={riderFee}
                  onInput={(e) => setRiderFee(e.target.value)}
                  placeholder="Enter rider delivery fee"
                  min="0"
                  step="0.01"
                  class="setting-input"
                />
              </div>
              <button
                class="btn-save"
                onClick={handleSaveRiderFee}
                disabled={savingSettings}
              >
                {savingSettings ? 'Saving...' : 'Save Changes'}
              </button>
              {settings.rider_delivery_fee && (
                <p class="setting-info">
                  Current value: Le {settings.rider_delivery_fee.value}
                </p>
              )}
            </div>
          </div>
        )}

        {userDetails && (
          <div class="modal-overlay" onClick={() => setUserDetails(null)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3>{userDetails.name} - Details</h3>
                <button class="close-btn" onClick={() => setUserDetails(null)}>×</button>
              </div>
              <div class="modal-body">
                <p><strong>Phone:</strong> {userDetails.phone}</p>
                <p><strong>Role:</strong> {userDetails.role}</p>
                <p><strong>Status:</strong> {userDetails.is_verified ? 'Verified' : 'Unverified'}</p>
                
                {userDetails.sales_stats && (
                  <div class="sales-stats">
                    <h4>Sales Statistics</h4>
                    <p>Today: Le {parseFloat(userDetails.sales_stats.today_sales).toFixed(2)}</p>
                    <p>This Week: Le {parseFloat(userDetails.sales_stats.week_sales).toFixed(2)}</p>
                    <p>This Month: Le {parseFloat(userDetails.sales_stats.month_sales).toFixed(2)}</p>
                  </div>
                )}
                
                {userDetails.daily_sales && userDetails.daily_sales.length > 0 && (
                  <div class="daily-sales">
                    <h4>Daily Revenue (Last 30 Days)</h4>
                    <table>
                      <thead><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead>
                      <tbody>
                        {userDetails.daily_sales.map(d => (
                          <tr key={d.date}>
                            <td>{new Date(d.date).toLocaleDateString()}</td>
                            <td>{d.orders}</td>
                            <td>Le {parseFloat(d.revenue).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {userDetails.orders && userDetails.orders.length > 0 && (
                  <div class="recent-orders">
                    <h4>Recent Orders</h4>
                    {userDetails.orders.slice(0, 5).map(o => (
                      <div key={o.id} class="order-item">
                        <p>Order #{o.id} - Le {o.total_amount} - {o.order_status}</p>
                        {o.order_status === 'delivered' && (
                          <button class="btn-sm btn-refund" onClick={() => handleRefund(o.id)}>Refund</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--spacing-md);
          margin: var(--spacing-lg) 0;
        }
        .stat-card {
          padding: var(--spacing-lg);
          border-radius: var(--border-radius);
          text-align: center;
          box-shadow: var(--shadow);
          transition: var(--transition);
          color: white;
          position: relative;
          overflow: hidden;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        .stat-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        .stat-card:active {
          transform: translateY(-3px) scale(1.01);
        }
        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-sm);
          opacity: 0.9;
        }
        .stat-card h3 {
          margin: 0 0 var(--spacing-xs) 0;
          color: white;
          font-size: 1.8em;
          font-weight: 700;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .stat-card p {
          margin: 0;
          color: rgba(255,255,255,0.9);
          font-size: 0.85em;
          font-weight: 500;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .stat-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .stat-orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-purple { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .stat-indigo { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .stat-green { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .stat-yellow { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }
        .stat-teal { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
        .stat-pink { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
        .tabs {
          display: flex;
          gap: var(--spacing-sm);
          margin: var(--spacing-lg) 0;
          border-bottom: 2px solid var(--border-color);
          flex-wrap: wrap;
        }
        .tab {
          padding: var(--spacing-sm) var(--spacing-lg);
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: var(--transition);
          color: var(--text-secondary);
        }
        .tab:hover {
          color: var(--text-primary);
        }
        .tab.active {
          border-bottom-color: var(--primary-color);
          color: var(--primary-color);
          font-weight: 600;
        }
        .table-container {
          overflow-x: auto;
          margin-top: var(--spacing-lg);
          background: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: var(--spacing-md);
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        th {
          background: var(--bg-secondary);
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }
        tbody tr:hover {
          background-color: #f8f9fa;
        }
        .badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: 12px;
          font-size: 0.75em;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge.verified {
          background: #E8F5E9;
          color: #2E7D32;
        }
        .badge.unverified {
          background: #FFF3E0;
          color: #F57C00;
        }
        .badge.status-delivered {
          background: #E8F5E9;
          color: #2E7D32;
        }
        .badge.status-in_delivery {
          background: #F3E5F5;
          color: #7B1FA2;
        }
        .badge.status-cancelled {
          background: #FFEBEE;
          color: #C62828;
        }
        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: 0.85em;
          border: none;
          border-radius: var(--border-radius);
          background: var(--primary-color);
          color: white;
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-sm:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }
        .btn-view {
          background: #2196F3;
          margin-right: var(--spacing-xs);
        }
        .btn-refund {
          background: #f44336;
          margin-left: var(--spacing-xs);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: var(--border-radius);
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--border-color);
        }
        .modal-header h3 {
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: var(--text-secondary);
        }
        .modal-body {
          padding: var(--spacing-lg);
        }
        .sales-stats, .daily-sales, .recent-orders {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--border-radius);
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color);
        }
        .settings-container {
          margin-top: var(--spacing-lg);
        }
        .settings-container h3 {
          margin-top: 0;
          color: var(--text-primary);
        }
        .settings-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
        }
        .settings-section h4 {
          margin-top: 0;
          color: var(--text-primary);
          font-size: 1.1em;
        }
        .setting-description {
          color: var(--text-secondary);
          font-size: 0.9em;
          margin: 0 0 var(--spacing-md) 0;
        }
        .setting-input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: var(--spacing-md);
        }
        .setting-input-group label {
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
          color: var(--text-primary);
        }
        .setting-input {
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 1em;
          font-family: inherit;
        }
        .setting-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }
        .btn-save {
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-weight: 600;
          font-size: 1em;
          transition: var(--transition);
        }
        .btn-save:hover:not(:disabled) {
          background: #1976D2;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .setting-info {
          background: #e3f2fd;
          border-left: 4px solid var(--primary-color);
          padding: var(--spacing-md);
          border-radius: 4px;
          margin-top: var(--spacing-md);
          color: var(--text-primary);
          font-size: 0.95em;
        }
      `}</style>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div class="modal-overlay" onClick={() => closeCreateUserModal()}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            {!createdMerchant ? (
              <>
                <h3>Add New {newUserRole === 'merchant' ? 'Merchant' : 'Rider'}</h3>

                {/* Only show method toggle for merchants */}
                {newUserRole === 'merchant' && (
                  <div class="method-toggle" style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    borderBottom: '2px solid var(--border-color)',
                    paddingBottom: '10px'
                  }}>
                    <button
                      class={`toggle-btn ${creationMethod === 'phone' ? 'active' : ''}`}
                      onClick={() => setCreationMethod('phone')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: creationMethod === 'phone' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: creationMethod === 'phone' ? 'rgba(33, 150, 243, 0.1)' : 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: creationMethod === 'phone' ? 'bold' : 'normal',
                        color: creationMethod === 'phone' ? 'var(--primary-color)' : 'var(--text-secondary)'
                      }}
                    >
                      📱 Phone-Based
                    </button>
                    <button
                      class={`toggle-btn ${creationMethod === 'email' ? 'active' : ''}`}
                      onClick={() => setCreationMethod('email')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: creationMethod === 'email' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: creationMethod === 'email' ? 'rgba(33, 150, 243, 0.1)' : 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: creationMethod === 'email' ? 'bold' : 'normal',
                        color: creationMethod === 'email' ? 'var(--primary-color)' : 'var(--text-secondary)'
                      }}
                    >
                      ✉️ Email-Based
                    </button>
                  </div>
                )}

                {creationMethod === 'email' ? (
                  <>
                    <div class="form-group">
                      <label>Email Address <span style={{color: 'red'}}>*</span></label>
                      <input
                        type="email"
                        placeholder="merchant@example.com"
                        value={newUserEmail}
                        onInput={(e) => setNewUserEmail(e.target.value)}
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>Full Name <span style={{color: 'red'}}>*</span></label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={newUserName}
                        onInput={(e) => setNewUserName(e.target.value)}
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+23276XXXXXXX"
                        value={newUserPhone}
                        onInput={(e) => setNewUserPhone(e.target.value)}
                        class="form-input"
                      />
                      <small style={{color: 'var(--text-secondary)', fontSize: '0.85em'}}>
                        If not provided, a placeholder will be generated
                      </small>
                    </div>
                    <div style={{
                      background: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '15px',
                      fontSize: '0.9em'
                    }}>
                      <strong>ℹ️ Note:</strong> A temporary 6-digit PIN will be generated and emailed to the merchant. They must change it on first login.
                    </div>
                  </>
                ) : (
                  <>
                    <div class="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+23276XXXXXXX"
                        value={newUserPhone}
                        onInput={(e) => setNewUserPhone(e.target.value)}
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={newUserName}
                        onInput={(e) => setNewUserName(e.target.value)}
                        class="form-input"
                      />
                    </div>
                  </>
                )}

                <div class="modal-actions">
                  <button class="btn btn-secondary" onClick={() => closeCreateUserModal()}>Cancel</button>
                  <button class="btn btn-primary" onClick={handleCreateUser}>
                    Create {newUserRole === 'merchant' ? 'Merchant' : 'Rider'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '48px', marginBottom: '10px'}}>✅</div>
                  <h3 style={{color: '#4CAF50', marginBottom: '20px'}}>Merchant Created Successfully!</h3>
                </div>

                <div style={{
                  background: '#f9f9f9',
                  border: '2px solid #4CAF50',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{marginBottom: '15px'}}>
                    <strong>Name:</strong> {createdMerchant.merchant.name}
                  </div>
                  <div style={{marginBottom: '15px'}}>
                    <strong>Email:</strong> {createdMerchant.merchant.email}
                  </div>
                  <div style={{marginBottom: '15px'}}>
                    <strong>Phone:</strong> {createdMerchant.merchant.phone}
                  </div>
                  <div style={{
                    background: 'white',
                    border: '2px dashed #4CAF50',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center',
                    marginTop: '15px'
                  }}>
                    <div style={{fontSize: '0.9em', marginBottom: '8px', color: 'var(--text-secondary)'}}>
                      Temporary PIN:
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      letterSpacing: '8px',
                      color: '#4CAF50',
                      fontFamily: 'monospace'
                    }}>
                      {createdMerchant.temporaryPIN}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  fontSize: '0.9em'
                }}>
                  <strong>⚠️ Important:</strong>
                  <ul style={{marginTop: '8px', paddingLeft: '20px', marginBottom: 0}}>
                    <li>A welcome email has been sent to the merchant</li>
                    <li>The temporary PIN expires in 7 days</li>
                    <li>Merchant must change PIN on first login</li>
                    <li>Save this PIN securely - it won't be shown again</li>
                  </ul>
                </div>

                <div class="modal-actions">
                  <button class="btn btn-primary" onClick={() => closeCreateUserModal()} style={{width: '100%'}}>
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
