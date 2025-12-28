import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';
import BarChart from './BarChart';

export default function RevenueByTierWidget() {
  const [merchantPerformance, setMerchantPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMerchantData = async () => {
      try {
        const data = await api.getAdminMerchantPerformance(100);
        setMerchantPerformance(data?.merchants || []);
      } catch (err) {
        console.error('Error loading merchant data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMerchantData();
  }, []);

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
  const totalTierRevenue = Object.values(revenueByTier).reduce((a, b) => a + b, 0);

  const getTierStats = () => [
    {
      tier: 'High Tier',
      revenue: revenueByTier['High Tier'],
      color: '#10b981',
      percentage: totalTierRevenue > 0 ? ((revenueByTier['High Tier'] / totalTierRevenue) * 100).toFixed(1) : 0,
      count: merchantPerformance.filter(m => m.tier === 'premium').length,
    },
    {
      tier: 'Medium Tier',
      revenue: revenueByTier['Medium Tier'],
      color: '#3b82f6',
      percentage: totalTierRevenue > 0 ? ((revenueByTier['Medium Tier'] / totalTierRevenue) * 100).toFixed(1) : 0,
      count: merchantPerformance.filter(m => m.tier === 'standard').length,
    },
    {
      tier: 'Low Tier',
      revenue: revenueByTier['Low Tier'],
      color: '#f59e0b',
      percentage: totalTierRevenue > 0 ? ((revenueByTier['Low Tier'] / totalTierRevenue) * 100).toFixed(1) : 0,
      count: merchantPerformance.filter(m => m.tier === 'basic').length,
    },
    {
      tier: 'New Merchant',
      revenue: revenueByTier['New Merchant'],
      color: '#8b5cf6',
      percentage: totalTierRevenue > 0 ? ((revenueByTier['New Merchant'] / totalTierRevenue) * 100).toFixed(1) : 0,
      count: merchantPerformance.filter(m => !m.tier || (m.tier !== 'premium' && m.tier !== 'standard' && m.tier !== 'basic')).length,
    },
  ];

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

  if (loading) {
    return <div class="revenue-tier-widget"><p>Loading revenue data...</p></div>;
  }

  return (
    <div class="revenue-tier-widget">
      <h3>📊 Revenue by Merchant Tier</h3>
      <div class="tier-content">
        <div class="tier-chart">
          <BarChart data={tierChartData} height="280px" />
        </div>
        <div class="tier-stats">
          {getTierStats().map(stat => (
            <div class="tier-item" key={stat.tier}>
              <div class="tier-header">
                <div class="tier-color" style={{ backgroundColor: stat.color }}></div>
                <div class="tier-name">{stat.tier}</div>
              </div>
              <div class="tier-details">
                <div class="tier-revenue">
                  <span class="tier-label">Revenue</span>
                  <span class="tier-value">Le {stat.revenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div class="tier-metrics">
                  <span class="tier-percentage">{stat.percentage}%</span>
                  <span class="tier-count">{stat.count} merchants</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .revenue-tier-widget {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          height: 100%;
        }

        .revenue-tier-widget h3 {
          margin: 0 0 20px 0;
          font-size: 1.1em;
          color: #1f2937;
        }

        .tier-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: center;
        }

        .tier-chart {
          display: flex;
          justify-content: center;
        }

        .tier-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tier-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .tier-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .tier-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .tier-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.9em;
        }

        .tier-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tier-revenue {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tier-label {
          font-size: 0.7em;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .tier-value {
          font-size: 0.85em;
          font-weight: 700;
          color: #1f2937;
        }

        .tier-metrics {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: right;
        }

        .tier-percentage {
          font-size: 0.85em;
          font-weight: 700;
          color: #1f2937;
        }

        .tier-count {
          font-size: 0.75em;
          color: #6b7280;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .tier-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
