import { useState, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';
import './Analytics.css';

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analytics, revenue, products, categories, reviews] = await Promise.all([
        api.getMerchantAnalytics(days),
        api.getMerchantDailyRevenue(days),
        api.getTopProducts(10),
        api.getCategoryStats(),
        api.getMerchantReviews(10)
      ]);
      setAnalytics(analytics);
      setDailyRevenue(revenue.data);
      setTopProducts(products.products);
      setCategoryStats(categories.stats);
      setReviews(reviews.reviews);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div class="page"><div class="loading">Loading analytics...</div></div>;

  return (
    <div class="page merchant-analytics">
      <div class="container">
        <div class="analytics-header">
          <h2>📊 Analytics Dashboard</h2>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-label">Total Orders</div>
              <div class="stat-value">{analytics?.total_orders || 0}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-label">Completed</div>
              <div class="stat-value">{analytics?.completed_orders || 0}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-label">Revenue</div>
              <div class="stat-value">Le {(analytics?.total_revenue || 0).toLocaleString()}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-label">Avg Rating</div>
              <div class="stat-value">{(analytics?.avg_rating || 0).toFixed(1)}/5</div>
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <div class="section">
            <h3>🏆 Top Products</h3>
            <div class="products-table">
              {topProducts.map(p => (
                <div key={p.id} class="table-row">
                  <div class="col-name">{p.name}</div>
                  <div class="col-stat">{p.times_ordered} orders</div>
                  <div class="col-stat">⭐ {(p.avg_rating || 0).toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>

          <div class="section">
            <h3>📂 Category Performance</h3>
            <div class="categories-table">
              {categoryStats.map(c => (
                <div key={c.category} class="table-row">
                  <div class="col-name">{c.category}</div>
                  <div class="col-stat">{c.orders} orders</div>
                  <div class="col-stat">Le {(c.revenue || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div class="section">
          <h3>💬 Recent Reviews</h3>
          <div class="reviews-list">
            {reviews.map(r => (
              <div key={r.id} class="review-item">
                <div class="review-header">
                  <span class="customer-name">{r.customer_name}</span>
                  <span class="rating">{'⭐'.repeat(r.rating)}</span>
                </div>
                <p class="review-comment">{r.comment}</p>
                <span class="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
