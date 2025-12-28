import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';
import '../Predictions.css';

export default function Predictions() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyForecast, setWeeklyForecast] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [events, setEvents] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== 'merchant') {
      route('/products');
      return;
    }
    loadPredictions();
  }, [user]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all prediction data in parallel
      const [weeklyRes, productsRes, alertsRes, eventsRes, accuracyRes] = await Promise.all([
        api.getWeeklyPredictions(),
        api.getProductPredictions(10),
        api.getInventoryAlerts(),
        api.getPredictionEvents(),
        api.getForecastAccuracy(7)
      ]);

      setWeeklyForecast(weeklyRes.data);
      setTopProducts(productsRes.data || []);
      setInventoryAlerts(alertsRes.data || []);
      setEvents(eventsRes.upcoming_events || []);
      setAccuracy(accuracyRes.data);
    } catch (err) {
      console.error('Error loading predictions:', err);
      setError(err.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const refreshForecasts = async () => {
    try {
      setLoading(true);
      await api.refreshPredictions();
      await loadPredictions();
    } catch (err) {
      console.error('Error refreshing forecasts:', err);
      setError('Failed to refresh forecasts');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div class="predictions-container">
        <div class="loading">Loading predictions...</div>
      </div>
    );
  }

  return (
    <div class="predictions-container">
      <div class="predictions-header">
        <h1>Sales Predictions</h1>
        <div class="header-actions">
          <button class="btn btn-primary" onClick={refreshForecasts}>
            Refresh Forecasts
          </button>
        </div>
      </div>

      {error && (
        <div class="error-message">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      {weeklyForecast && (
        <div class="quick-stats">
          <div class="stat-card">
            <div class="stat-label">Weekly Forecast</div>
            <div class="stat-value">{weeklyForecast.summary.total_predicted_quantity} units</div>
            <div class="stat-revenue">{formatCurrency(weeklyForecast.summary.total_predicted_revenue)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Daily Average</div>
            <div class="stat-value">{weeklyForecast.summary.avg_daily_quantity} units/day</div>
            <div class="stat-revenue">{formatCurrency(weeklyForecast.summary.avg_daily_revenue)}/day</div>
          </div>
          {accuracy && (
            <div class="stat-card">
              <div class="stat-label">Forecast Accuracy</div>
              <div class="stat-value">{Math.round(accuracy.accuracy_score)}%</div>
              <div class="stat-secondary">MAPE: {accuracy.mean_absolute_percentage_error}%</div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div class="tabs">
        <button
          class={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          📊 Weekly Forecast
        </button>
        <button
          class={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🏆 Top Products
        </button>
        <button
          class={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          ⚠️ Inventory Alerts
        </button>
        <button
          class={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          🎉 Events & Holidays
        </button>
      </div>

      {/* Tab Content */}
      <div class="tab-content">
        {/* Weekly Forecast Tab */}
        {activeTab === 'weekly' && weeklyForecast && (
          <div class="tab-pane active">
            <h2>Weekly Sales Forecast</h2>
            <p class="period-info">
              {formatDate(weeklyForecast.week_start)} - {formatDate(weeklyForecast.week_end)}
            </p>

            <div class="forecast-table-container">
              <table class="forecast-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Predicted Quantity</th>
                    <th>Predicted Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyForecast.daily_forecasts.map((day) => (
                    <tr key={day.date}>
                      <td class="date-cell">{formatDate(day.date)}</td>
                      <td class="quantity-cell">{day.predicted_quantity} units</td>
                      <td class="revenue-cell">{formatCurrency(day.predicted_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Products Tab */}
        {activeTab === 'products' && (
          <div class="tab-pane active">
            <h2>Top Predicted Products (Next 7 Days)</h2>
            {topProducts.length === 0 ? (
              <p class="empty-state">No product predictions available yet. Need more historical data.</p>
            ) : (
              <div class="products-grid">
                {topProducts.map((product) => (
                  <div key={product.product_id} class="product-card">
                    <div class="product-header">
                      <h3>{product.product_name}</h3>
                      <span class="category">{product.category}</span>
                    </div>
                    <div class="product-stats">
                      <div class="stat">
                        <span class="label">Predicted Quantity</span>
                        <span class="value">{product.predicted_weekly_quantity} units</span>
                      </div>
                      <div class="stat">
                        <span class="label">Daily Average</span>
                        <span class="value">{product.avg_daily_quantity} units</span>
                      </div>
                      <div class="stat">
                        <span class="label">Predicted Revenue</span>
                        <span class="value">{formatCurrency(product.predicted_weekly_revenue)}</span>
                      </div>
                      <div class="stat">
                        <span class="label">Price</span>
                        <span class="value">{formatCurrency(product.price)}</span>
                      </div>
                      {product.rating > 0 && (
                        <div class="stat">
                          <span class="label">Rating</span>
                          <span class="rating">{'⭐'.repeat(Math.round(product.rating))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Alerts Tab */}
        {activeTab === 'inventory' && (
          <div class="tab-pane active">
            <h2>Inventory Depletion Alerts</h2>
            {inventoryAlerts.length === 0 ? (
              <p class="empty-state">✅ All products have sufficient inventory for the next 7 days.</p>
            ) : (
              <div class="alerts-list">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.product_id} class="alert-item">
                    <div class="alert-header">
                      <h3>{alert.product_name}</h3>
                      <span class="current-stock">Current: {alert.current_stock} units</span>
                    </div>
                    <div class="alert-details">
                      {alert.alerts.map((alertItem, idx) => (
                        <div key={idx} class={`alert-message ${alertItem.type}`}>
                          <span class="alert-icon">
                            {alertItem.type === 'depletion_warning' ? '⛔' : '⚠️'}
                          </span>
                          <div class="alert-text">
                            {alertItem.type === 'depletion_warning' ? (
                              <>
                                <strong>Stock will run out in {alertItem.days_until_stockout} days</strong>
                                <p>Depletion date: {formatDate(alertItem.depletion_date)}</p>
                                <p class="recommendation">{alertItem.recommendation}</p>
                              </>
                            ) : (
                              <>
                                <strong>Low stock warning</strong>
                                <p>Remaining stock: {alertItem.remaining_stock} units</p>
                                <p class="recommendation">{alertItem.recommendation}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events & Holidays Tab */}
        {activeTab === 'events' && (
          <div class="tab-pane active">
            <h2>Upcoming Events & Holidays</h2>
            {events.length === 0 ? (
              <p class="empty-state">No upcoming events in the next 30 days.</p>
            ) : (
              <div class="events-list">
                {events.map((event) => (
                  <div key={event.id} class="event-item">
                    <div class="event-date">
                      <div class="event-day">{formatDate(event.date)}</div>
                    </div>
                    <div class="event-content">
                      <h3>{event.name}</h3>
                      {event.description && (
                        <p class="event-description">{event.description}</p>
                      )}
                      <div class="event-meta">
                        <span class="impact-factor">
                          Impact: {(event.impact_factor * 100).toFixed(0)}%
                          {event.impact_factor > 1 ? ' 📈' : ' 📉'}
                        </span>
                        {event.category && (
                          <span class="category-badge">{event.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Major Events Context */}
            <div class="major-events-section">
              <h3>🌍 Important Events for Your Business</h3>
              <div class="context-info">
                <p>
                  These major events typically impact sales. The impact factor shows how
                  sales are expected to change relative to normal days:
                </p>
                <ul>
                  <li><strong>1.5x</strong> = 50% increase in sales (Christmas, Exam Season)</li>
                  <li><strong>1.4x</strong> = 40% increase (Independence Day, Exams)</li>
                  <li><strong>0.6x</strong> = 40% decrease (New Year - reduced activity)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div class="predictions-footer">
        <p>
          💡 Forecasts are generated using Prophet algorithm with historical sales data
          and external event factors. Accuracy improves with more historical data.
        </p>
        <p>
          🔄 Forecasts are automatically updated daily at 2 AM. You can manually refresh
          at any time.
        </p>
      </div>
    </div>
  );
}
