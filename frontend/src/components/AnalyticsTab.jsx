import { useState, useEffect } from 'preact/hooks';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import AreaChart from './AreaChart';
import KPIDashboard from './KPIDashboard';
import AlertsPanel from './AlertsPanel';
import FinancialDashboard from './FinancialDashboard';
import api from '../services/api';

export default function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');

  // Charts data state
  const [revenueData, setRevenueData] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [topMerchantsData, setTopMerchantsData] = useState(null);
  const [dailyRevenueData, setDailyRevenueData] = useState(null);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'kpis', 'alerts', or 'financials'

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [statsData, revenueData, orderStatusData, merchantData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminRevenue(30),
        api.getAdminOrdersStatus(),
        api.getAdminMerchantPerformance(5)
      ]);

      console.log('Analytics data loaded:', {
        stats: statsData,
        revenue: revenueData?.data?.length,
        orderStatus: orderStatusData?.statusBreakdown?.length,
        merchants: merchantData?.merchants?.length,
        merchantData: merchantData
      });

      setStats(statsData);

      // Generate chart data from real API data
      if (revenueData && revenueData.data) {
        generateChartDataFromAPI(revenueData.data, orderStatusData, merchantData);
      } else {
        generateMockChartData();
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message);
      // Fall back to mock data if API fails
      generateMockChartData();
    } finally {
      setLoading(false);
    }
  };

  const generateChartDataFromAPI = (revenueData, orderStatusData, merchantData) => {
    // Revenue trend data from API
    const sortedData = revenueData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const days = sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const revenueValues = sortedData.map(item => parseFloat(item.daily_revenue || 0));

    setRevenueData({
      labels: days,
      datasets: [
        {
          label: 'Daily Revenue (Le)',
          data: revenueValues,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    });

    // Cumulative revenue
    const cumulativeDays = [...days];
    let cumulative = 0;
    const cumulativeValues = revenueValues.map(revenue => {
      cumulative += revenue;
      return cumulative;
    });

    setDailyRevenueData({
      labels: cumulativeDays,
      datasets: [
        {
          label: 'Cumulative Revenue (Le)',
          data: cumulativeValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    });

    // Order status breakdown from real API data
    if (orderStatusData && orderStatusData.statusBreakdown) {
      const statusCounts = {
        'delivered': 0,
        'in_delivery': 0,
        'pending': 0,
        'cancelled': 0
      };
      orderStatusData.statusBreakdown.forEach(item => {
        const status = item.status?.toLowerCase() || 'pending';
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status] = item.count || 0;
        }
      });

      setOrderStatusData({
        labels: ['Delivered', 'In Delivery', 'Pending', 'Cancelled'],
        datasets: [
          {
            data: [statusCounts.delivered, statusCounts.in_delivery, statusCounts.pending, statusCounts.cancelled],
            backgroundColor: [
              '#10b981',
              '#f59e0b',
              '#3b82f6',
              '#ef4444',
            ],
            borderColor: [
              '#059669',
              '#d97706',
              '#1e40af',
              '#b91c1c',
            ],
            borderWidth: 2,
          },
        ],
      });
    }

    // Top merchants by revenue from real API data
    if (merchantData && merchantData.merchants && merchantData.merchants.length > 0) {
      const merchantLabels = merchantData.merchants.map(m => m.name || `Merchant ${m.id}`);
      const merchantRevenues = merchantData.merchants.map(m => parseFloat(m.total_revenue || m.revenue || 0));
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

      setTopMerchantsData({
        labels: merchantLabels,
        datasets: [
          {
            label: 'Revenue (Le)',
            data: merchantRevenues,
            backgroundColor: colors.slice(0, merchantLabels.length),
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      });
    }
  };

  const generateMockChartData = () => {
    // Revenue trend data (last 30 days)
    const days = [];
    const revenueValues = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      revenueValues.push(Math.random() * 5000 + 2000);
    }

    setRevenueData({
      labels: days,
      datasets: [
        {
          label: 'Daily Revenue (Le)',
          data: revenueValues,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    });

    // Order status breakdown
    setOrderStatusData({
      labels: ['Delivered', 'In Delivery', 'Pending', 'Cancelled'],
      datasets: [
        {
          data: [450, 120, 89, 34],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#3b82f6',
            '#ef4444',
          ],
          borderColor: [
            '#059669',
            '#d97706',
            '#1e40af',
            '#b91c1c',
          ],
          borderWidth: 2,
        },
      ],
    });

    // Top merchants by revenue
    setTopMerchantsData({
      labels: ['Merchant A', 'Merchant B', 'Merchant C', 'Merchant D', 'Merchant E'],
      datasets: [
        {
          label: 'Revenue (Le)',
          data: [12500, 11200, 9800, 8400, 7200],
          backgroundColor: [
            '#3b82f6',
            '#8b5cf6',
            '#ec4899',
            '#f59e0b',
            '#10b981',
          ],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    });

    // Daily cumulative revenue
    const cumulativeDays = [];
    let cumulative = 0;
    const cumulativeValues = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      cumulativeDays.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      cumulative += Math.random() * 5000 + 2000;
      cumulativeValues.push(cumulative);
    }

    setDailyRevenueData({
      labels: cumulativeDays,
      datasets: [
        {
          label: 'Cumulative Revenue (Le)',
          data: cumulativeValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    });
  };

  if (loading && !stats) {
    return <div class="analytics-loading"><p>Loading analytics...</p></div>;
  }

  return (
    <div class="analytics-tab">
      <div class="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <div class="analytics-controls">
          <div class="view-mode-toggle">
            <button
              class={`view-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              📈 Overview
            </button>
            <button
              class={`view-btn ${viewMode === 'kpis' ? 'active' : ''}`}
              onClick={() => setViewMode('kpis')}
            >
              🎯 KPIs
            </button>
            <button
              class={`view-btn ${viewMode === 'alerts' ? 'active' : ''}`}
              onClick={() => setViewMode('alerts')}
            >
              🔔 Alerts
            </button>
            <button
              class={`view-btn ${viewMode === 'financials' ? 'active' : ''}`}
              onClick={() => setViewMode('financials')}
            >
              💰 Financials
            </button>
          </div>
          <div class="date-range-selector">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div class="error-message">⚠️ {error}</div>}

      {viewMode === 'overview' && stats && (
        <div class="analytics-kpis">
          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-label">Total Revenue</div>
              <div class="kpi-value">Le {parseFloat(stats.total_revenue).toFixed(2)}</div>
              <div class="kpi-change positive">↑ 12.5% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Avg Order Value</div>
              <div class="kpi-value">Le {stats.total_orders > 0 ? (parseFloat(stats.total_revenue) / stats.total_orders).toFixed(2) : '0'}</div>
              <div class="kpi-change positive">↑ 8.3% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Order Completion Rate</div>
              <div class="kpi-value">{stats.total_orders > 0 ? ((stats.completed_orders / stats.total_orders) * 100).toFixed(1) : '0'}%</div>
              <div class="kpi-change positive">↑ 2.1% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Active Orders</div>
              <div class="kpi-value">{stats.active_orders}</div>
              <div class="kpi-change neutral">→ 0% from yesterday</div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'kpis' && stats && <KPIDashboard stats={stats} />}

      {viewMode === 'alerts' && stats && <AlertsPanel stats={stats} />}

      {viewMode === 'financials' && stats && <FinancialDashboard stats={stats} />}

      {viewMode === 'overview' && <div class="charts-grid">
        {revenueData && (
          <div class="chart-container full-width">
            <LineChart
              data={revenueData}
              title="Revenue Trend"
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return 'Le ' + value.toLocaleString();
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}

        {dailyRevenueData && (
          <div class="chart-container full-width">
            <AreaChart
              data={dailyRevenueData}
              title="Cumulative Revenue"
            />
          </div>
        )}

        <div class="chart-row">
          {orderStatusData && (
            <div class="chart-container half-width">
              <PieChart
                data={orderStatusData}
                title="Order Status Breakdown"
                height="300px"
              />
            </div>
          )}

          {topMerchantsData && (
            <div class="chart-container half-width">
              <BarChart
                data={topMerchantsData}
                title="Top Merchants by Revenue"
                height="300px"
              />
            </div>
          )}
        </div>
      </div>
      }

      <style>{`
        .analytics-tab {
          padding: 20px;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .analytics-header h2 {
          margin: 0;
          font-size: 1.8em;
          color: #1f2937;
        }

        .analytics-controls {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .view-mode-toggle {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 6px;
        }

        .view-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.9em;
          transition: all 0.3s ease;
          color: #6b7280;
        }

        .view-btn:hover {
          background: #e5e7eb;
        }

        .view-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .date-range-selector select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9em;
          cursor: pointer;
        }

        .analytics-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
          font-size: 1.1em;
          color: #6b7280;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          border-left: 4px solid #dc2626;
        }

        .analytics-kpis {
          margin-bottom: 40px;
        }

        .kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .kpi-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #3b82f6;
        }

        .kpi-label {
          font-size: 0.85em;
          color: #6b7280;
          margin-bottom: 8px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kpi-value {
          font-size: 1.8em;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .kpi-change {
          font-size: 0.85em;
          font-weight: 600;
        }

        .kpi-change.positive {
          color: #10b981;
        }

        .kpi-change.negative {
          color: #ef4444;
        }

        .kpi-change.neutral {
          color: #6b7280;
        }

        .charts-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .chart-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-container.full-width {
          grid-column: 1 / -1;
        }

        .chart-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }

        .chart-container.half-width {
          min-width: 300px;
        }

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .analytics-header h2 {
            font-size: 1.4em;
          }

          .kpi-row {
            grid-template-columns: 1fr;
          }

          .chart-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
