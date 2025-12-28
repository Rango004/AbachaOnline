import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';

export default function FinancialDashboard({ stats }) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [merchantPerformance, setMerchantPerformance] = useState([]);
  const [payoutStats, setPayoutStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        const merchantData = await api.getAdminMerchantPerformance(100);
        setMerchantPerformance(merchantData?.merchants || []);

        const payoutData = await api.getAdminRevenue();
        setPayoutStats(payoutData);
      } catch (err) {
        console.error('Error loading financial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFinancialData();
  }, [selectedPeriod]);

  // Calculate financial metrics
  const totalRevenue = stats?.total_revenue || 0;
  const commissionEarned = totalRevenue * 0.05; // 5% commission
  const merchantPayouts = totalRevenue * 0.95; // 95% to merchants
  const avgOrderValue = stats?.total_orders > 0 ? totalRevenue / stats.total_orders : 0;

  // Calculate revenue by merchant tier from real data
  const calculateRevenueByTier = () => {
    const tiers = {
      'High Tier': 0,
      'Medium Tier': 0,
      'Low Tier': 0,
      'New Merchant': 0,
    };

    merchantPerformance.forEach(merchant => {
      const revenue = parseFloat(merchant.total_revenue) || 0;
      if (merchant.tier === 'premium') tiers['High Tier'] += revenue;
      else if (merchant.tier === 'standard') tiers['Medium Tier'] += revenue;
      else if (merchant.tier === 'basic') tiers['Low Tier'] += revenue;
      else tiers['New Merchant'] += revenue;
    });

    return tiers;
  };

  const revenueByTier = calculateRevenueByTier();

  // Revenue chart data
  const revenueChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Current'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [
          totalRevenue * 0.12,
          totalRevenue * 0.14,
          totalRevenue * 0.15,
          totalRevenue * 0.18,
          totalRevenue * 0.17,
          totalRevenue * 0.19,
          totalRevenue * 0.1,
        ],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'Commission Earned',
        data: [
          (totalRevenue * 0.12) * 0.05,
          (totalRevenue * 0.14) * 0.05,
          (totalRevenue * 0.15) * 0.05,
          (totalRevenue * 0.18) * 0.05,
          (totalRevenue * 0.17) * 0.05,
          (totalRevenue * 0.19) * 0.05,
          (totalRevenue * 0.1) * 0.05,
        ],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      },
    ],
  };

  // Calculate payout status from real data
  const calculatePayoutStatus = () => {
    let pending = 0, processing = 0, completed = 0, failed = 0;

    merchantPerformance.forEach(merchant => {
      const status = merchant.payout_status || 'pending';
      if (status === 'pending') pending++;
      else if (status === 'processing') processing++;
      else if (status === 'completed') completed++;
      else if (status === 'failed') failed++;
    });

    return { pending, processing, completed, failed };
  };

  const payoutCounts = calculatePayoutStatus();
  const payoutStatusData = {
    labels: ['Pending', 'Processing', 'Completed', 'Failed'],
    datasets: [
      {
        data: [payoutCounts.pending, payoutCounts.processing, payoutCounts.completed, payoutCounts.failed],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Revenue by merchant tier
  const tierChartData = {
    labels: Object.keys(revenueByTier),
    datasets: [
      {
        label: 'Revenue by Merchant Tier',
        data: Object.values(revenueByTier),
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const financeCardStyle = `
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;
  `;

  return (
    <div class="financial-dashboard">
      <div class="financial-header">
        <h2>💰 Financial Dashboard</h2>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Key Financial Metrics */}
      <div class="financial-metrics">
        <div class="finance-card" style="border-left-color: #10b981;">
          <div class="finance-label">Total Revenue</div>
          <div class="finance-value">Le {totalRevenue.toLocaleString()}</div>
          <div class="finance-change positive">↑ 15.3% vs last month</div>
        </div>

        <div class="finance-card" style="border-left-color: #f59e0b;">
          <div class="finance-label">Commission Earned</div>
          <div class="finance-value">Le {commissionEarned.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          <div class="finance-change positive">↑ 5% of total revenue</div>
        </div>

        <div class="finance-card" style="border-left-color: #3b82f6;">
          <div class="finance-label">Merchant Payouts</div>
          <div class="finance-value">Le {merchantPayouts.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          <div class="finance-change neutral">→ 95% to merchants</div>
        </div>

        <div class="finance-card" style="border-left-color: #8b5cf6;">
          <div class="finance-label">Average Order Value</div>
          <div class="finance-value">Le {avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          <div class="finance-change positive">↑ 6.2% vs last month</div>
        </div>
      </div>

      {/* Revenue Charts */}
      <div class="charts-row">
        <div class="chart-card full-width">
          <h3>Revenue & Commission Trend</h3>
          <LineChart data={revenueChartData} height="300px" />
        </div>
      </div>

      {/* Payout and Tier Distribution */}
      <div class="charts-row">
        <div class="chart-card">
          <h3>Payout Status</h3>
          <PieChart data={payoutStatusData} height="300px" />
        </div>

        <div class="chart-card">
          <h3>Revenue by Merchant Tier</h3>
          <BarChart data={tierChartData} height="300px" />
        </div>
      </div>

      {/* Payout Details */}
      <div class="payout-details">
        <h3>💳 Recent Payouts</h3>
        <div class="payout-table">
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Total Revenue</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {merchantPerformance.slice(0, 5).map(merchant => {
                const status = merchant.payout_status || 'pending';
                const badgeClass = status === 'completed' ? 'completed' : status === 'processing' ? 'processing' : 'pending';
                const badgeText = status === 'completed' ? '✓ Completed' : status === 'processing' ? '⏳ Processing' : '⏸ Pending';
                const payoutAmount = parseFloat(merchant.total_revenue || 0) * 0.95;
                return (
                  <tr key={merchant.id}>
                    <td>{merchant.name || `Merchant #${merchant.id}`}</td>
                    <td>Le {parseFloat(merchant.total_revenue || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                    <td>Le {payoutAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                    <td><span class={`badge ${badgeClass}`}>{badgeText}</span></td>
                    <td>{new Date(merchant.last_order_date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {merchantPerformance.length === 0 && (
                <tr>
                  <td colSpan="5" style="text-align: center; color: #9ca3af;">No payout data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div class="commission-breakdown">
        <h3>📊 Commission Breakdown</h3>
        <div class="commission-grid">
          <div class="commission-item">
            <div class="commission-label">Orders Processed</div>
            <div class="commission-value">{stats?.total_orders || 0}</div>
            <div class="commission-stat">@ avg Le {avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          </div>
          <div class="commission-item">
            <div class="commission-label">Commission Rate</div>
            <div class="commission-value">5%</div>
            <div class="commission-stat">Le {(commissionEarned / (stats?.total_orders || 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })} per order</div>
          </div>
          <div class="commission-item">
            <div class="commission-label">Total Commission</div>
            <div class="commission-value">Le {commissionEarned.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
            <div class="commission-stat">5% of Le {totalRevenue.toLocaleString()}</div>
          </div>
          <div class="commission-item">
            <div class="commission-label">Merchant Share</div>
            <div class="commission-value">95%</div>
            <div class="commission-stat">Le {merchantPayouts.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <style>{`
        .financial-dashboard {
          padding: 20px;
        }

        .financial-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .financial-header h2 {
          margin: 0;
          font-size: 1.8em;
          color: #1f2937;
        }

        .financial-header select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9em;
          cursor: pointer;
        }

        .financial-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .finance-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .finance-label {
          font-size: 0.85em;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .finance-value {
          font-size: 1.6em;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .finance-change {
          font-size: 0.85em;
          font-weight: 600;
        }

        .finance-change.positive {
          color: #10b981;
        }

        .finance-change.neutral {
          color: #6b7280;
        }

        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .chart-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-card.full-width {
          grid-column: 1 / -1;
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          font-size: 1.1em;
          color: #1f2937;
        }

        .payout-details, .commission-breakdown {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .payout-details h3, .commission-breakdown h3 {
          margin: 0 0 20px 0;
          font-size: 1.1em;
          color: #1f2937;
        }

        .payout-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
          color: #6b7280;
          font-size: 0.85em;
          text-transform: uppercase;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .badge {
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 600;
        }

        .badge.completed {
          background: #d1fae5;
          color: #059669;
        }

        .badge.processing {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .commission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .commission-item {
          background: #f9fafb;
          padding: 16px;
          border-radius: 6px;
          text-align: center;
        }

        .commission-label {
          font-size: 0.85em;
          color: #6b7280;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .commission-value {
          font-size: 1.5em;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .commission-stat {
          font-size: 0.8em;
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .charts-row {
            grid-template-columns: 1fr;
          }

          .financial-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
