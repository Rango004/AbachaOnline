import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';
import MapDisplay from '../../components/MapDisplay';
import RouteItinerary from '../../components/RouteItinerary';
import RouteProgress from '../../components/RouteProgress';
import RouteLegend from '../../components/RouteLegend';
import OfflineSync from '../../services/OfflineSyncService';
import { getNetworkStatus } from '../../services/NativeBridge';

export default function RiderDashboard() {
  const { user } = useContext(AuthContext);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [todayMetrics, setTodayMetrics] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteModal, setShowRouteModal] = useState(false);  // Separate state for route details modal
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('routes');
  const [inputs, setInputs] = useState({});
  const [optimizingRoutes, setOptimizingRoutes] = useState(false);
  const [primaryRoute, setPrimaryRoute] = useState(null);
  const [alternateRoute, setAlternateRoute] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedRouteChoice, setSelectedRouteChoice] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [offlineMessage, setOfflineMessage] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (user?.role !== 'rider') {
      route('/products');
      return;
    }
    loadDashboard(true);
    const interval = setInterval(() => loadDashboard(false), 10000);

    // Listen for network changes
    const handleOnline = () => {
      setIsOffline(false);
      setOfflineMessage(null);
      loadDashboard(true); // Refresh when back online
    };
    const handleOffline = () => {
      setIsOffline(true);
      setOfflineMessage('You are offline - some features are limited');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const loadDashboard = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setOfflineMessage(null);
      const { connected } = await getNetworkStatus();

      if (!connected) {
        // Load from cache when offline
        console.log('[RiderDashboard] Offline - loading from cache');
        setIsOffline(true);

        const cachedStats = await OfflineSync.getCachedDashboardStats('rider');
        const cachedOrders = await OfflineSync.getCachedOrders();

        if (cachedStats) {
          setStatistics(cachedStats.statistics || null);
          setEarnings(cachedStats.earnings || null);
          setOptimizedRoutes(cachedStats.optimizedRoutes || []);
          setTodayMetrics(cachedStats.todayMetrics || null);
          setAvailableOrders(cachedStats.availableOrders || []);
          setActiveOrders(cachedStats.activeOrders || []);

          const active_route = cachedStats.optimizedRoutes?.find(r =>
            r.status === 'pending' || r.status === 'active'
          );
          setActiveRoute(active_route || null);

          setOfflineMessage('Viewing cached data - offline mode');
          console.log('[RiderDashboard] Loaded stats from cache');
        } else if (cachedOrders && cachedOrders.length > 0) {
          // Fallback: use cached orders if available
          setActiveOrders(cachedOrders.filter(o => ['ready', 'in_delivery'].includes(o.order_status)));
          setOfflineMessage('Limited data available offline');
        } else {
          setOfflineMessage('No cached data available offline');
        }

        if (showLoading) setLoading(false);
        return;
      }

      // Online - fetch from server
      setIsOffline(false);

      const [available, active, stats, earningsData, dashboard] = await Promise.all([
        api.getRiderAvailableOrders().catch(() => ({ orders: [] })),
        api.getRiderActiveOrders().catch(() => ({ orders: [] })),
        api.getRiderStatistics().catch(() => null),
        api.getRiderEarnings().catch(() => null),
        api.request('/rider/dashboard').catch(() => ({ data: {} }))
      ]);

      setAvailableOrders(available.orders || []);
      setActiveOrders(active.orders || []);
      setStatistics(stats?.statistics || null);
      setEarnings(earningsData?.earnings || null);

      // Set optimized routes and today metrics
      if (dashboard.data) {
        setOptimizedRoutes(dashboard.data.optimized_routes || []);
        setTodayMetrics(dashboard.data.today_metrics || null);

        // Check for active route (pending or active status)
        const active_route = dashboard.data.optimized_routes?.find(r =>
          r.status === 'pending' || r.status === 'active'
        );
        setActiveRoute(active_route || null);
      }

      // Cache dashboard data for offline access
      await OfflineSync.cacheDashboardStats('rider', {
        statistics: stats?.statistics || null,
        earnings: earningsData?.earnings || null,
        optimizedRoutes: dashboard.data?.optimized_routes || [],
        todayMetrics: dashboard.data?.today_metrics || null,
        availableOrders: available.orders || [],
        activeOrders: active.orders || []
      });

      // Also cache active orders for offline reference
      const allOrders = [...(available.orders || []), ...(active.orders || [])];
      if (allOrders.length > 0) {
        await OfflineSync.cacheOrders(allOrders);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);

      // Try cache as fallback
      try {
        const cachedStats = await OfflineSync.getCachedDashboardStats('rider');
        if (cachedStats) {
          setStatistics(cachedStats.statistics || null);
          setEarnings(cachedStats.earnings || null);
          setOptimizedRoutes(cachedStats.optimizedRoutes || []);
          setTodayMetrics(cachedStats.todayMetrics || null);
          setAvailableOrders(cachedStats.availableOrders || []);
          setActiveOrders(cachedStats.activeOrders || []);
          setOfflineMessage('Using cached data - connection failed');
          console.log('[RiderDashboard] Using cached stats after error');
        }
      } catch (cacheErr) {
        console.error('[RiderDashboard] Cache fallback failed:', cacheErr);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleClaim = async (orderId) => {
    try {
      await api.claimOrderWorkflow(orderId);
      alert('Order claimed! Now verify the tracking number.');
      loadDashboard(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyPickup = async (orderId, trackingNumber) => {
    if (!trackingNumber?.trim()) {
      alert('Enter tracking number');
      return;
    }
    try {
      await api.verifyPickup(orderId, trackingNumber.trim());
      alert('Pickup verified! Order is in transit.');
      setInputs({ ...inputs, [`tracking_${orderId}`]: '' });
      loadDashboard(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyDelivery = async (orderId, pickupCode) => {
    if (!pickupCode?.trim()) {
      alert('Enter customer pickup code');
      return;
    }
    try {
      await api.verifyDelivery(orderId, pickupCode.trim());
      alert('Delivery confirmed!');
      setInputs({ ...inputs, [`pickup_${orderId}`]: '' });
      loadDashboard(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePrepareNextBatch = async () => {
    try {
      setOptimizingRoutes(true);
      const result = await api.optimizeRiderRoutes('clarke_wright');

      // Handle error response
      if (!result.success && result.message) {
        alert(result.message);
        return;
      }

      // Handle response with primary and alternate routes
      if (result.primary_route) {
        setPrimaryRoute(result.primary_route);
        setAlternateRoute(result.alternate_route || null);
        setShowComparisonModal(true);
      } else if (result.routes && result.routes.length > 0) {
        // Fallback for old API format
        alert(`Routes optimized! ${result.routes.length} route(s) assigned.`);
        loadDashboard(false);
      } else {
        alert('No pending orders available for optimization. Check back soon!');
      }
    } catch (err) {
      alert(`Failed to optimize routes: ${err.message}`);
    } finally {
      setOptimizingRoutes(false);
    }
  };

  const handleSelectRoute = async (routeId) => {
    try {
      // Make API call to select the route
      const result = await api.request(`/rider/routes/${routeId}/select`, {
        method: 'POST'
      });

      if (result.success) {
        setSelectedRouteChoice(routeId);
        alert('Route selected! You can now start your delivery.');
        setShowComparisonModal(false);

        // After selection, fetch the route with itinerary to display
        try {
          const response = await api.getRouteItinerary(routeId);
          const itineraryArray = response.itinerary || [];
          const selectedRouteData = primaryRoute?.id === routeId ? primaryRoute : alternateRoute;
          if (selectedRouteData) {
            setSelectedRoute({
              ...selectedRouteData,
              itinerary: itineraryArray
            });
          }
        } catch (itineraryErr) {
          console.error('Error fetching itinerary for selected route:', itineraryErr);
        }

        loadDashboard(false);
      }
    } catch (err) {
      alert(`Failed to select route: ${err.message}`);
    }
  };

  const handleStartRoute = async (routeId) => {
    try {
      const result = await api.request(`/rider/routes/${routeId}/start`, {
        method: 'POST'
      });

      if (result.success) {
        alert('Route started! 🚀 Displaying on map...');

        // Update the selected route with the new status from backend
        if (selectedRoute && selectedRoute.id === routeId) {
          setSelectedRoute({
            ...selectedRoute,
            status: 'active'
          });
        }

        // Close the route details modal
        setShowRouteModal(false);

        // Switch to map tab to show the route
        setActiveTab('map');

        // Refresh dashboard data in background
        loadDashboard(false);
      }
    } catch (err) {
      alert(`Failed to start route: ${err.message}`);
    }
  };

  const handleMarkDelivered = async (orderId, routeId) => {
    try {
      const result = await api.request(`/rider/routes/${routeId}/orders/${orderId}/mark-delivered`, {
        method: 'POST'
      });

      if (result.success) {
        alert('Delivery marked as completed!');
        loadDashboard(false);
      }
    } catch (err) {
      alert(`Failed to mark delivery: ${err.message}`);
    }
  };

  const handleViewRoute = async (route) => {
    try {
      // Fetch itinerary if not already included
      if (!route.itinerary || !Array.isArray(route.itinerary) || route.itinerary.length === 0) {
        const response = await api.getRouteItinerary(route.id);
        // Extract itinerary array from response object
        const itineraryArray = response.itinerary || [];

        // Enrich the route with itinerary
        setSelectedRoute({
          ...route,
          itinerary: itineraryArray,
          // Add distance_info and time_estimate if they exist for better display
          distance_info: route.distance_info || {
            total_distance_km: (route.total_distance_m / 1000).toFixed(2),
            description: 'Round trip distance including return to depot'
          }
        });
      } else {
        // Route already has itinerary, just display it
        setSelectedRoute(route);
      }

      // Show the route details modal (independent of map display)
      setShowRouteModal(true);
    } catch (err) {
      console.error('Error fetching route itinerary:', err);
      // Still display the route even if itinerary fetch fails
      setSelectedRoute(route);
      setShowRouteModal(true);
    }
  };

  if (loading) return <div class="page rider-dashboard"><p>Loading...</p></div>;

  return (
    <div class="page rider-dashboard">
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

        <h2>🚚 Rider Dashboard</h2>
        
        <div class="tabs" role="tablist" aria-label="Dashboard sections">
          <button
            class={`tab ${activeTab === 'map' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'map'}
            aria-controls="map-panel"
            onClick={() => setActiveTab('map')}
          >
            🗺️ Map
          </button>
          <button
            class={`tab ${activeTab === 'routes' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'routes'}
            aria-controls="routes-panel"
            onClick={() => setActiveTab('routes')}
          >
            📍 Optimized Routes ({optimizedRoutes.length})
          </button>
          <button
            class={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'metrics'}
            aria-controls="metrics-panel"
            onClick={() => setActiveTab('metrics')}
          >
            📊 Metrics
          </button>
          <button
            class={`tab ${activeTab === 'available' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'available'}
            aria-controls="available-panel"
            onClick={() => setActiveTab('available')}
          >
            📦 Available ({availableOrders.length})
          </button>
          <button
            class={`tab ${activeTab === 'active' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'active'}
            aria-controls="active-panel"
            onClick={() => setActiveTab('active')}
          >
            🚚 Active ({activeOrders.length})
          </button>
        </div>

        {activeTab === 'map' && selectedRoute && (
          <div id="map-panel" role="tabpanel" aria-labelledby="map-tab" class="map-section" style={{ marginTop: '20px' }}>
            {/* Route Progress Indicators */}
            <RouteProgress
              route={selectedRoute}
              currentStopIndex={0}
              showProgressBar={true}
            />

            {/* Map Display */}
            <div style={{ height: '400px', maxHeight: '60vh', minHeight: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <MapDisplay
                routes={[
                  {
                    type: 'primary',
                    id: selectedRoute.id,
                    coordinates: selectedRoute.route_coordinates || [],
                    itinerary: selectedRoute.itinerary || []
                  }
                ]}
                depotCoordinates={[-12.0710, 8.1129]}
                onStopClick={(stop) => {
                  console.log('Stop clicked:', stop);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'map' && !selectedRoute && (
          <div class="map-section" style={{ marginTop: '20px' }}>
            <div style={{
              background: '#f5f5f5',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              color: '#999'
            }}>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>📍 No route selected</p>
              <p style={{ fontSize: '14px' }}>Click "View Details" on a route to display it on the map</p>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div class="routes-section">
            <div class="prepare-batch-section">
              {activeRoute ? (
                <div style={{
                  background: '#FFF3E0',
                  border: '1px solid #FFB74D',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#E65100'
                }}>
                  <strong>⚠️ Active Route in Progress</strong><br/>
                  You already have an active route. Please complete it before requesting a new batch.
                </div>
              ) : null}
              <button
                class="btn-prepare-batch"
                onClick={handlePrepareNextBatch}
                disabled={optimizingRoutes || !!activeRoute || isOffline}
                title={isOffline ? 'Cannot prepare routes while offline' : ''}
              >
                {optimizingRoutes ? '⏳ Preparing Routes...' : isOffline ? '📡 Offline' : '📦 Prepare Next Batch'}
              </button>
              <p class="batch-info">Click when you're ready for pickup. System will optimize your next batch of orders.</p>
            </div>

            {todayMetrics && (
              <div class="today-metrics">
                <h3>Today's Performance</h3>
                <div class="metrics-grid">
                  <div class="metric-box">
                    <span class="label">Delivered</span>
                    <strong>{todayMetrics.delivered_today || 0}</strong>
                  </div>
                  <div class="metric-box">
                    <span class="label">In Progress</span>
                    <strong>{todayMetrics.in_progress_today || 0}</strong>
                  </div>
                  <div class="metric-box">
                    <span class="label">Revenue</span>
                    <strong>Le {todayMetrics.total_revenue_today || 0}</strong>
                  </div>
                  <div class="metric-box">
                    <span class="label">Customers</span>
                    <strong>{todayMetrics.customers_served_today || 0}</strong>
                  </div>
                </div>
              </div>
            )}
            <h3>Your Optimized Routes</h3>
            {optimizedRoutes.length === 0 ? (
              <p>No optimized routes assigned yet</p>
            ) : (
              <div class="routes-list">
                {optimizedRoutes.map(route => (
                  <div key={route.id} class={`route-card status-${route.status}`}>
                    <div class="route-header">
                      <h4>Route #{route.id} - {route.merchant_name}</h4>
                      <span class={`status-badge ${route.status}`}>{route.status.toUpperCase()}</span>
                    </div>
                    <div class="route-info">
                      <p><strong>Orders:</strong> {route.order_count}</p>
                      <p><strong>Completed:</strong> {route.completed_count} / {route.order_count}</p>
                      <p><strong>Distance:</strong> {(route.total_distance_m / 1000).toFixed(2)} km</p>
                      <p><strong>Progress:</strong> {route.completion_percentage?.toFixed(1) || 0}%</p>
                    </div>
                    <div class="route-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" style={{ width: `${route.completion_percentage || 0}%` }}></div>
                      </div>
                    </div>
                    <button
                      class="btn-view-route"
                      onClick={() => handleViewRoute(route)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showRouteModal && selectedRoute && (
          <div class="modal-overlay" role="presentation" onClick={() => setShowRouteModal(false)}>
            <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="route-modal-title" onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3 id="route-modal-title">Route #{selectedRoute.id}</h3>
                <button class="close-btn" onClick={() => setShowRouteModal(false)} aria-label="Close route details modal">×</button>
              </div>
              <div class="modal-body">
                <RouteItinerary
                  route={selectedRoute}
                  onStartRoute={() => handleStartRoute(selectedRoute.id)}
                  onMarkDelivered={(orderId) => handleMarkDelivered(orderId, selectedRoute.id)}
                />
              </div>
            </div>
          </div>
        )}

        {showComparisonModal && primaryRoute && (
          <div class="modal-overlay" role="presentation" onClick={() => setShowComparisonModal(false)}>
            <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="comparison-modal-title" style={{ maxWidth: '1200px' }} onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3 id="comparison-modal-title">🗺️ Route Comparison</h3>
                <button class="close-btn" onClick={() => setShowComparisonModal(false)} aria-label="Close route comparison modal">×</button>
              </div>
              <div class="modal-body">
                <div class="comparison-grid">
                  {/* Map Section */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: '#f5f5f5'
                  }}>
                    <MapDisplay
                      routes={[
                        {
                          id: primaryRoute.id,
                          type: 'primary',
                          algorithm: primaryRoute.algorithm,
                          coordinates: primaryRoute.route_coordinates || [],
                          itinerary: primaryRoute.itinerary || []
                        },
                        ...(alternateRoute ? [{
                          id: alternateRoute.id,
                          type: 'alternate',
                          algorithm: alternateRoute.algorithm,
                          coordinates: alternateRoute.route_coordinates || [],
                          itinerary: alternateRoute.itinerary || []
                        }] : [])
                      ]}
                      depotCoordinates={[-12.0710, 8.1129]}
                      onStopClick={null}
                    />
                    <RouteLegend
                      routes={[
                        { type: 'primary', algorithm: primaryRoute.algorithm },
                        ...(alternateRoute ? [{ type: 'alternate', algorithm: alternateRoute.algorithm }] : [])
                      ]}
                    />
                  </div>

                  {/* Metrics Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Primary + Alternate Route Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Primary Route Card */}
                  <div style={{
                    background: '#E3F2FD',
                    border: '2px solid #2196F3',
                    borderRadius: '8px',
                    padding: '20px',
                    position: 'relative'
                  }}>
                    {primaryRoute.id === (primaryRoute?.recommendation === 'primary' ? primaryRoute?.id : null) && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#2196F3',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        ⭐ RECOMMENDED
                      </div>
                    )}
                    <h4 style={{ marginTop: '0', color: '#1565C0' }}>Primary Route</h4>
                    <p><strong>Algorithm:</strong> Clarke-Wright Savings</p>
                    <p>
                      <strong>Distance:</strong> {primaryRoute.distance_info?.total_distance_km || (primaryRoute.total_distance_m / 1000).toFixed(2)} km
                      <br />
                      <small style={{ color: '#666' }}>
                        {primaryRoute.distance_info?.distance_description || 'Round trip distance'}
                      </small>
                    </p>
                    <p><strong>Stops:</strong> {primaryRoute.num_deliveries || primaryRoute.itinerary?.length || 0}</p>
                    {primaryRoute.time_estimate && (
                      <p>
                        <strong>⏱️ Estimated Time:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1565C0' }}>{primaryRoute.time_estimate.total_estimated_time_readable}</span>
                        <br />
                        <small style={{ color: '#666' }}>
                          Travel: {primaryRoute.time_estimate.travel_time_minutes}m | Delivery: {primaryRoute.time_estimate.delivery_time_minutes}m
                        </small>
                      </p>
                    )}
                    <button
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      onClick={() => handleSelectRoute(primaryRoute.id)}
                    >
                      Choose This Route
                    </button>
                  </div>

                  {/* Alternate Route Card */}
                  {alternateRoute && (
                    <div style={{
                      background: '#E8F5E9',
                      border: '2px solid #4CAF50',
                      borderRadius: '8px',
                      padding: '20px',
                      position: 'relative'
                    }}>
                      {alternateRoute.id === (alternateRoute?.recommendation === 'alternate' ? alternateRoute?.id : null) && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#4CAF50',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          ⭐ RECOMMENDED
                        </div>
                      )}
                      <h4 style={{ marginTop: '0', color: '#2E7D32' }}>Alternate Route</h4>
                      <p><strong>Algorithm:</strong> Nearest Neighbor</p>
                      <p>
                        <strong>Distance:</strong> {alternateRoute.distance_info?.total_distance_km || (alternateRoute.total_distance_m / 1000).toFixed(2)} km
                        <br />
                        <small style={{ color: '#666' }}>
                          {alternateRoute.distance_info?.distance_description || 'Round trip distance'}
                        </small>
                      </p>
                      <p><strong>Stops:</strong> {alternateRoute.num_deliveries || alternateRoute.itinerary?.length || 0}</p>
                      {alternateRoute.time_estimate && (
                        <p>
                          <strong>⏱️ Estimated Time:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2E7D32' }}>{alternateRoute.time_estimate.total_estimated_time_readable}</span>
                          <br />
                          <small style={{ color: '#666' }}>
                            Travel: {alternateRoute.time_estimate.travel_time_minutes}m | Delivery: {alternateRoute.time_estimate.delivery_time_minutes}m
                          </small>
                        </p>
                      )}
                      <button
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        onClick={() => handleSelectRoute(alternateRoute.id)}
                      >
                        Choose This Route
                      </button>
                    </div>
                  )}
                </div>

                  {/* Comparison Info */}
                  {primaryRoute.comparison && (
                    <div style={{
                      background: '#F5F5F5',
                      padding: '15px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      gridColumn: '1 / -1'
                    }}>
                      <p><strong>Distance Difference:</strong> {(primaryRoute.comparison.distance_diff_m / 1000).toFixed(2)} km ({primaryRoute.comparison.distance_diff_percent?.toFixed(1)}%)</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div class="metrics-section">
            <div class="metrics-grid">
              {/* Earnings Section */}
              <div class="metrics-card earnings">
                <h3>💰 Earnings</h3>
                {earnings ? (
                  <div class="metrics-content">
                    <div class="metric-row">
                      <span>Today</span>
                      <strong>Le {earnings.today_earnings || 0}</strong>
                    </div>
                    <div class="metric-row">
                      <span>This Week</span>
                      <strong>Le {earnings.week_earnings || 0}</strong>
                    </div>
                    <div class="metric-row">
                      <span>This Month</span>
                      <strong>Le {earnings.month_earnings || 0}</strong>
                    </div>
                    <div class="metric-row total">
                      <span>Total</span>
                      <strong>Le {earnings.total_earnings || 0}</strong>
                    </div>
                    <div class="metric-row">
                      <span>Per Delivery</span>
                      <strong>Le {earnings.delivery_fee || 0}</strong>
                    </div>
                  </div>
                ) : (
                  <p>Loading earnings...</p>
                )}
              </div>

              {/* Performance Stats */}
              <div class="metrics-card performance">
                <h3>📊 Performance</h3>
                {statistics ? (
                  <div class="metrics-content">
                    <div class="metric-row">
                      <span>Total Deliveries</span>
                      <strong>{statistics.total_deliveries || 0}</strong>
                    </div>
                    <div class="metric-row">
                      <span>Completed</span>
                      <strong>{statistics.completed_deliveries || 0}</strong>
                    </div>
                    <div class="metric-row">
                      <span>Active</span>
                      <strong>{statistics.active_deliveries || 0}</strong>
                    </div>
                    <div class="metric-row">
                      <span>Completion Rate</span>
                      <strong>{statistics.completion_rate || 0}%</strong>
                    </div>
                    <div class="metric-row">
                      <span>On-Time Rate</span>
                      <strong>{statistics.on_time_rate || 0}%</strong>
                    </div>
                    <div class="metric-row">
                      <span>Avg. Delivery Time</span>
                      <strong>{statistics.avg_delivery_time_minutes || 'N/A'} mins</strong>
                    </div>
                  </div>
                ) : (
                  <p>Loading statistics...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'available' && (
          <div class="orders-list">
            {availableOrders.length === 0 ? (
              <p>No available orders</p>
            ) : (
              availableOrders.map(order => (
                <div key={order.id} class="order-card">
                  <div class="order-header">
                    <h3>Order #{order.id}</h3>
                    <span class="amount">Le {order.total_amount}</span>
                  </div>
                  <p><strong>Customer:</strong> {order.customer_name}</p>
                  <p><strong>Merchant:</strong> {order.merchant_name}</p>
                  <p><strong>Address:</strong> {order.delivery_address}</p>
                  <button 
                    class="btn-primary"
                    onClick={() => handleClaim(order.id)}
                  >
                    ✋ CLAIM ORDER
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div class="orders-list">
            {activeOrders.length === 0 ? (
              <p>No active orders</p>
            ) : (
              activeOrders.map(order => (
                <div key={order.id} class="order-card">
                  <div class="order-header">
                    <h3>Order #{order.id}</h3>
                    <span class={`status ${order.order_status}`}>
                      {order.order_status === 'ready' ? '📦 READY' : 
                       order.order_status === 'in_delivery' ? '🚚 IN DELIVERY' : 
                       order.order_status.toUpperCase()}
                    </span>
                  </div>
                  <p><strong>Customer:</strong> {order.customer_name}</p>
                  <p><strong>Phone:</strong> {order.customer_phone}</p>
                  <p><strong>Address:</strong> {order.delivery_address}</p>
                  
                  {order.items && order.items.length > 0 && (
                    <div class="order-items">
                      <p><strong>Items:</strong></p>
                      <ul>
                        {order.items.map(item => (
                          <li key={item.id}>
                            {item.quantity}x {item.product_name} - Le {item.subtotal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.order_status === 'ready' && (
                    <div class="action-section">
                      <p style={{ fontSize: '0.9em', color: '#666' }}>
                        <strong>Tracking:</strong> {order.tracking_number}
                      </p>
                      <input
                        type="text"
                        placeholder="Enter tracking number"
                        value={inputs[`tracking_${order.id}`] || ''}
                        onInput={(e) => setInputs({
                          ...inputs,
                          [`tracking_${order.id}`]: e.target.value
                        })}
                        class="input-field"
                      />
                      <button
                        class="btn-success"
                        onClick={() => handleVerifyPickup(order.id, inputs[`tracking_${order.id}`])}
                      >
                        🚚 VERIFY PICKUP
                      </button>
                    </div>
                  )}

                  {order.order_status === 'in_delivery' && (
                    <div class="action-section">
                      <p style={{ fontSize: '0.9em', color: '#666' }}>
                        Ask customer for their 6-digit pickup code
                      </p>
                      <input
                        type="text"
                        placeholder="Enter customer pickup code"
                        maxLength="6"
                        value={inputs[`pickup_${order.id}`] || ''}
                        onInput={(e) => setInputs({
                          ...inputs,
                          [`pickup_${order.id}`]: e.target.value
                        })}
                        class="input-field"
                      />
                      <button
                        class="btn-success"
                        onClick={() => handleVerifyDelivery(order.id, inputs[`pickup_${order.id}`])}
                      >
                        ✅ CONFIRM DELIVERY
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        .prepare-batch-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          text-align: center;
        }
        .btn-prepare-batch {
          width: 100%;
          max-width: 300px;
          padding: 16px 32px;
          font-size: 1.1em;
          font-weight: bold;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 10px auto;
          display: block;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .btn-prepare-batch:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        .btn-prepare-batch:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .batch-info {
          margin: 15px 0 0 0;
          font-size: 0.9em;
          opacity: 0.9;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          border-bottom: 2px solid #eee;
          flex-wrap: wrap;
        }
        .tab {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1em;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }
        .tab.active {
          border-bottom-color: #2196F3;
          color: #2196F3;
          font-weight: bold;
        }
        .metrics-section {
          margin-top: 20px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
        .metrics-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: #f9f9f9;
        }
        .metrics-card h3 {
          margin: 0 0 15px 0;
          font-size: 1.2em;
        }
        .metrics-card.earnings {
          border-left: 4px solid #4CAF50;
        }
        .metrics-card.performance {
          border-left: 4px solid #2196F3;
        }
        .metrics-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: white;
          border-radius: 4px;
          font-size: 0.95em;
        }
        .metric-row span {
          color: #666;
        }
        .metric-row strong {
          font-weight: bold;
          color: #333;
        }
        .metric-row.total {
          background: #e3f2fd;
          border-top: 2px solid #2196F3;
          margin-top: 5px;
        }
        .metric-row.total strong {
          color: #2196F3;
          font-size: 1.1em;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }
        .order-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: #f9f9f9;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .order-header h3 {
          margin: 0;
          font-size: 1.1em;
        }
        .amount {
          font-weight: bold;
          color: #2196F3;
          font-size: 1.1em;
        }
        .status {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.9em;
          font-weight: bold;
        }
        .status.ready {
          background: #FFC107;
          color: #333;
        }
        .status.in_delivery {
          background: #9C27B0;
          color: white;
        }
        .status.confirmed, .status.preparing {
          background: #FF9800;
          color: white;
        }
        .action-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }
        .input-field {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1em;
        }
        .btn-primary, .btn-success {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 4px;
          font-size: 1em;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
        }
        .btn-primary {
          background: #2196F3;
          color: white;
        }
        .btn-success {
          background: #4CAF50;
          color: white;
        }
        .btn-primary:hover, .btn-success:hover {
          opacity: 0.9;
        }
        .order-items {
          margin: 10px 0;
          padding: 10px;
          background: #fff;
          border-radius: 4px;
        }
        .order-items ul {
          margin: 5px 0 0 0;
          padding-left: 20px;
        }
        .order-items li {
          margin: 3px 0;
          font-size: 0.9em;
        }
        .routes-section {
          margin-top: 20px;
        }
        .today-metrics {
          background: #f0f7ff;
          border-left: 4px solid #2196F3;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .today-metrics h3 {
          margin: 0 0 15px 0;
          color: #2196F3;
        }
        .today-metrics .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
        }
        .metric-box {
          background: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #e0e0e0;
        }
        .metric-box .label {
          display: block;
          font-size: 0.85em;
          color: #666;
          margin-bottom: 8px;
        }
        .metric-box strong {
          display: block;
          font-size: 1.5em;
          color: #2196F3;
        }
        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .route-card {
          border: 1px solid #ddd;
          border-left: 4px solid #999;
          border-radius: 8px;
          padding: 15px;
          background: #f9f9f9;
        }
        .route-card.status-pending {
          border-left-color: #FFC107;
        }
        .route-card.status-active {
          border-left-color: #2196F3;
        }
        .route-card.status-completed {
          border-left-color: #4CAF50;
        }
        .route-card.status-cancelled {
          border-left-color: #f44336;
        }
        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .route-header h4 {
          margin: 0;
          font-size: 1.1em;
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: bold;
        }
        .status-badge.pending {
          background: #FFC107;
          color: #333;
        }
        .status-badge.active {
          background: #2196F3;
          color: white;
        }
        .status-badge.completed {
          background: #4CAF50;
          color: white;
        }
        .status-badge.cancelled {
          background: #f44336;
          color: white;
        }
        .route-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 10px 0;
          font-size: 0.95em;
        }
        .route-info p {
          margin: 5px 0;
        }
        .route-progress {
          margin: 10px 0;
        }
        .progress-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2196F3, #1976D2);
          transition: width 0.3s;
        }
        .btn-view-route {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .btn-view-route:hover {
          background: #1976D2;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        .modal-header h3 {
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }
        .modal-body {
          padding: 20px;
        }
        .modal-body p {
          margin: 10px 0;
          font-size: 0.95em;
        }
        .comparison-grid {
          display: grid;
          grid-template-columns: 600px 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        @media (max-width: 1024px) {
          .comparison-grid {
            grid-template-columns: 500px 1fr;
            gap: 16px;
          }
        }
        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
