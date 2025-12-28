import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';

export default function LeaderboardPanel({ type = 'merchants' }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      let data;

      if (type === 'merchants') {
        data = await api.getAdminMerchantPerformance(5);
        if (data && data.data) {
          const formattedData = data.data.map((m, idx) => ({
            rank: idx + 1,
            name: m.name || `Merchant ${m.id}`,
            revenue: parseFloat(m.total_sales || m.revenue || 0),
            orders: parseInt(m.order_count || 0),
            rating: parseFloat(m.rating || 0),
            trend: m.revenue_trend || 'stable',
            benchmarkDiff: m.benchmark_diff || '0%'
          }));
          setLeaderboard(formattedData);
        }
      } else if (type === 'riders') {
        data = await api.getAdminRiderPerformance(5);
        if (data && data.data) {
          const formattedData = data.data.map((r, idx) => ({
            rank: idx + 1,
            name: r.name || `Rider ${r.id}`,
            deliveries: parseInt(r.delivery_count || 0),
            avgTime: parseFloat(r.avg_delivery_time || 0),
            onTimeRate: parseFloat(r.on_time_rate || 0),
            rating: parseFloat(r.rating || 0),
            trend: r.performance_trend || 'stable',
            benchmarkDiff: r.benchmark_diff || '0%'
          }));
          setLeaderboard(formattedData);
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      // Keep current state or show error
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank) => {
    const colors = {
      1: '#fbbf24', // gold
      2: '#d1d5db', // silver
      3: '#d97706', // bronze
    };
    return colors[rank] || '#6b7280'; // gray
  };

  const getMedalEmoji = (rank) => {
    const emojis = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
    };
    return emojis[rank] || '•';
  };

  const getTrendIcon = (trend) => {
    const icons = {
      up: '📈',
      down: '📉',
      stable: '→',
    };
    return icons[trend] || '-';
  };

  const isMerchant = type === 'merchants';

  return (
    <div class="leaderboard-panel">
      <div class="leaderboard-header">
        <h3>{isMerchant ? '🏆 Top Merchants' : '🏆 Top Riders'}</h3>
        <p class="leaderboard-subtitle">Performance ranking vs platform average</p>
      </div>

      {loading ? (
        <div class="loading">Loading leaderboard...</div>
      ) : (
        <div class="leaderboard-list">
          {leaderboard.map((item) => (
            <div key={item.rank} class="leaderboard-item">
              <div class="rank-section">
                <div class="rank-medal" style={{ color: getMedalColor(item.rank) }}>
                  {getMedalEmoji(item.rank)}
                </div>
                <div class="rank-number">#{item.rank}</div>
              </div>

              <div class="item-content">
                <div class="item-header">
                  <h4 class="item-name">{item.name}</h4>
                  <div class="item-rating">
                    ⭐ {item.rating}
                  </div>
                </div>

                <div class="item-stats">
                  {isMerchant ? (
                    <>
                      <div class="stat">
                        <span class="stat-label">Revenue</span>
                        <span class="stat-value">Le {(item.revenue / 1000).toFixed(0)}K</span>
                      </div>
                      <div class="stat">
                        <span class="stat-label">Orders</span>
                        <span class="stat-value">{item.orders}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div class="stat">
                        <span class="stat-label">Deliveries</span>
                        <span class="stat-value">{item.deliveries}</span>
                      </div>
                      <div class="stat">
                        <span class="stat-label">Avg Time</span>
                        <span class="stat-value">{item.avgTime}m</span>
                      </div>
                      <div class="stat">
                        <span class="stat-label">On-Time</span>
                        <span class="stat-value">{item.onTimeRate}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div class="benchmark-section">
                <div class="trend">
                  {getTrendIcon(item.trend)}
                </div>
                <div class={`benchmark-diff ${item.trend}`}>
                  {item.benchmarkDiff}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .leaderboard-panel {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .leaderboard-header {
          margin-bottom: 20px;
        }

        .leaderboard-header h3 {
          margin: 0 0 8px 0;
          font-size: 1.1em;
          color: #1f2937;
        }

        .leaderboard-subtitle {
          margin: 0;
          font-size: 0.85em;
          color: #6b7280;
        }

        .loading {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .leaderboard-item:hover {
          background: #f3f4f6;
          transform: translateX(4px);
        }

        .rank-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 50px;
        }

        .rank-medal {
          font-size: 1.8em;
        }

        .rank-number {
          font-size: 0.75em;
          color: #6b7280;
          font-weight: 600;
        }

        .item-content {
          flex: 1;
          min-width: 0;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .item-name {
          margin: 0;
          font-size: 0.95em;
          font-weight: 600;
          color: #1f2937;
        }

        .item-rating {
          font-size: 0.85em;
          color: #d97706;
          font-weight: 600;
        }

        .item-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: 0.75em;
          color: #9ca3af;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 0.9em;
          font-weight: 600;
          color: #1f2937;
        }

        .benchmark-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 60px;
        }

        .trend {
          font-size: 1.2em;
        }

        .benchmark-diff {
          font-size: 0.8em;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .benchmark-diff.up {
          background: #d1fae5;
          color: #059669;
        }

        .benchmark-diff.down {
          background: #fee2e2;
          color: #dc2626;
        }

        .benchmark-diff.stable {
          background: #fef3c7;
          color: #92400e;
        }

        @media (max-width: 768px) {
          .item-stats {
            gap: 12px;
          }

          .benchmark-section {
            min-width: 45px;
          }
        }
      `}</style>
    </div>
  );
}
