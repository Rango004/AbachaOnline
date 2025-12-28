import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './RiderDashboard.css';

const RiderDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/v1/rider/dashboard');
      setDashboard(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteDetails = async (routeId) => {
    try {
      const response = await api.get(`/api/v1/rider/routes/${routeId}`);
      setSelectedRoute(response.data.data);
    } catch (err) {
      setError('Failed to load route details');
      console.error('Route details error:', err);
    }
  };

  const updateRouteStatus = async (routeId, newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/api/v1/rider/routes/${routeId}/status`, {
        status: newStatus
      });
      // Refresh dashboard
      await fetchDashboard();
      setSelectedRoute(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update route status');
      console.error('Status update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="rider-dashboard loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="rider-dashboard error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboard}>Retry</button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div className="rider-dashboard">No dashboard data available</div>;
  }

  const { today_metrics, statistics, optimized_routes, active_orders, earnings } = dashboard;

  return (
    <div className="rider-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p className="subtitle">Your optimized delivery routes and performance</p>
      </div>

      {/* Today's Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card delivered">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <p className="metric-label">Delivered Today</p>
            <p className="metric-value">{today_metrics?.delivered_today || 0}</p>
          </div>
        </div>

        <div className="metric-card in-progress">
          <div className="metric-icon">🚗</div>
          <div className="metric-content">
            <p className="metric-label">In Progress</p>
            <p className="metric-value">{today_metrics?.in_progress_today || 0}</p>
          </div>
        </div>

        <div className="metric-card pending">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <p className="metric-label">Pending</p>
            <p className="metric-value">{today_metrics?.pending_today || 0}</p>
          </div>
        </div>

        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <p className="metric-label">Revenue Today</p>
            <p className="metric-value">XAF {today_metrics?.total_revenue_today?.toLocaleString()}</p>
          </div>
        </div>

        <div className="metric-card customers">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <p className="metric-label">Customers</p>
            <p className="metric-value">{today_metrics?.customers_served_today || 0}</p>
          </div>
        </div>

        <div className="metric-card merchants">
          <div className="metric-icon">🏪</div>
          <div className="metric-content">
            <p className="metric-label">Merchants</p>
            <p className="metric-value">{today_metrics?.merchants_served_today || 0}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Optimized Routes
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Active Orders
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Performance Stats
        </button>
      </div>

      {/* Routes Section */}
      {activeTab === 'overview' && (
        <div className="routes-section">
          <h2>Optimized Delivery Routes</h2>
          {optimized_routes && optimized_routes.length > 0 ? (
            <div className="routes-grid">
              {optimized_routes.map((route) => (
                <div
                  key={route.id}
                  className={`route-card ${route.status}`}
                  onClick={() => fetchRouteDetails(route.id)}
                >
                  <div className="route-header">
                    <h3>Route #{route.id}</h3>
                    <span className={`status-badge ${route.status}`}>
                      {route.status}
                    </span>
                  </div>

                  <div className="route-details">
                    <div className="detail-item">
                      <span className="label">Merchant:</span>
                      <span className="value">{route.merchant_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Orders:</span>
                      <span className="value">{route.order_count}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Completed:</span>
                      <span className="value">
                        {route.completed_count} / {route.order_count}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Distance:</span>
                      <span className="value">
                        {(route.total_distance_m / 1000).toFixed(2)} km
                      </span>
                    </div>
                  </div>

                  <div className="route-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${route.completion_percentage || 0}%`
                        }}
                      />
                    </div>
                    <p className="progress-text">
                      {route.completion_percentage?.toFixed(1)}% completed
                    </p>
                  </div>

                  <div className="route-actions">
                    <button className="btn-view" onClick={(e) => {
                      e.stopPropagation();
                      fetchRouteDetails(route.id);
                    }}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No optimized routes assigned yet</p>
            </div>
          )}
        </div>
      )}

      {/* Orders Section */}
      {activeTab === 'orders' && (
        <div className="orders-section">
          <h2>Active Orders</h2>
          {active_orders && active_orders.length > 0 ? (
            <div className="orders-list">
              {active_orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h4>{order.tracking_number}</h4>
                    <span className={`status-badge ${order.order_status}`}>
                      {order.order_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="order-info">
                    <div className="info-row">
                      <span className="label">Customer:</span>
                      <span className="value">{order.customer_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Phone:</span>
                      <span className="value">{order.customer_phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Delivery Address:</span>
                      <span className="value">{order.delivery_address}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Merchant:</span>
                      <span className="value">{order.merchant_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Amount:</span>
                      <span className="value">XAF {order.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No active orders</p>
            </div>
          )}
        </div>
      )}

      {/* Statistics Section */}
      {activeTab === 'stats' && (
        <div className="stats-section">
          <h2>Your Performance</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h4>Total Deliveries</h4>
              <p className="stat-value">{statistics?.total_deliveries || 0}</p>
            </div>
            <div className="stat-item">
              <h4>Completed Deliveries</h4>
              <p className="stat-value">{statistics?.completed_deliveries || 0}</p>
            </div>
            <div className="stat-item">
              <h4>Completion Rate</h4>
              <p className="stat-value">{statistics?.completion_rate}%</p>
            </div>
            <div className="stat-item">
              <h4>On-Time Rate</h4>
              <p className="stat-value">{statistics?.on_time_rate}%</p>
            </div>
            <div className="stat-item">
              <h4>Avg Delivery Time</h4>
              <p className="stat-value">
                {statistics?.avg_delivery_time_minutes
                  ? `${statistics.avg_delivery_time_minutes} min`
                  : 'N/A'}
              </p>
            </div>
            <div className="stat-item">
              <h4>Total Earnings</h4>
              <p className="stat-value">
                XAF {earnings?.total_earnings?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Route Detail Modal */}
      {selectedRoute && (
        <div className="modal-overlay" onClick={() => setSelectedRoute(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Route #{selectedRoute.id} - {selectedRoute.merchant_name}</h2>
              <button className="close-btn" onClick={() => setSelectedRoute(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="route-summary">
                <div className="summary-item">
                  <span>Status:</span>
                  <strong>{selectedRoute.status}</strong>
                </div>
                <div className="summary-item">
                  <span>Total Distance:</span>
                  <strong>{(selectedRoute.total_distance_m / 1000).toFixed(2)} km</strong>
                </div>
                <div className="summary-item">
                  <span>Orders in Route:</span>
                  <strong>{selectedRoute.orders?.length || 0}</strong>
                </div>
              </div>

              <div className="orders-in-route">
                <h3>Deliveries in this route</h3>
                {selectedRoute.orders && selectedRoute.orders.length > 0 ? (
                  <div className="route-orders">
                    {selectedRoute.orders.map((order, index) => (
                      <div key={order.id} className="route-order">
                        <div className="order-sequence">
                          <span className="step">{index + 1}</span>
                        </div>
                        <div className="order-info">
                          <p className="customer">{order.customer_name}</p>
                          <p className="address">{order.delivery_address}</p>
                          <p className="phone">{order.customer_phone}</p>
                          <p className="tracking">#{order.tracking_number}</p>
                        </div>
                        <div className="order-status">
                          <span className={`status ${order.order_status}`}>
                            {order.order_status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No orders in this route</p>
                )}
              </div>

              {/* Route Status Update */}
              {selectedRoute.status !== 'completed' && selectedRoute.status !== 'cancelled' && (
                <div className="route-actions-modal">
                  <h3>Update Route Status</h3>
                  <div className="action-buttons">
                    {selectedRoute.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => updateRouteStatus(selectedRoute.id, 'active')}
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Start Route'}
                      </button>
                    )}
                    {selectedRoute.status === 'active' && (
                      <button
                        className="btn btn-success"
                        onClick={() => updateRouteStatus(selectedRoute.id, 'completed')}
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Complete Route'}
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => updateRouteStatus(selectedRoute.id, 'cancelled')}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Cancel Route'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
