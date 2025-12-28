import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';
import PieChart from './PieChart';

export default function PayoutStatusWidget() {
  const [merchantPerformance, setMerchantPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayoutData = async () => {
      try {
        const data = await api.getAdminMerchantPerformance(100);
        setMerchantPerformance(data?.merchants || []);
      } catch (err) {
        console.error('Error loading payout data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPayoutData();
  }, []);

  const calculatePayoutCounts = () => {
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

  const payoutCounts = calculatePayoutCounts();
  const total = Object.values(payoutCounts).reduce((a, b) => a + b, 0);

  const payoutData = {
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

  const getStatusStats = () => [
    { label: 'Pending', count: payoutCounts.pending, color: '#f59e0b', percentage: total > 0 ? ((payoutCounts.pending / total) * 100).toFixed(1) : 0 },
    { label: 'Processing', count: payoutCounts.processing, color: '#3b82f6', percentage: total > 0 ? ((payoutCounts.processing / total) * 100).toFixed(1) : 0 },
    { label: 'Completed', count: payoutCounts.completed, color: '#10b981', percentage: total > 0 ? ((payoutCounts.completed / total) * 100).toFixed(1) : 0 },
    { label: 'Failed', count: payoutCounts.failed, color: '#ef4444', percentage: total > 0 ? ((payoutCounts.failed / total) * 100).toFixed(1) : 0 },
  ];

  if (loading) {
    return <div class="payout-widget"><p>Loading payout data...</p></div>;
  }

  return (
    <div class="payout-widget">
      <h3>💳 Payout Status Distribution</h3>
      <div class="payout-content">
        <div class="payout-chart">
          <PieChart data={payoutData} height="280px" />
        </div>
        <div class="payout-stats">
          {getStatusStats().map(stat => (
            <div class="stat-item" key={stat.label}>
              <div class="stat-color" style={{ backgroundColor: stat.color }}></div>
              <div class="stat-info">
                <div class="stat-label">{stat.label}</div>
                <div class="stat-count">{stat.count}</div>
              </div>
              <div class="stat-percentage">{stat.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .payout-widget {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          height: 100%;
        }

        .payout-widget h3 {
          margin: 0 0 20px 0;
          font-size: 1.1em;
          color: #1f2937;
        }

        .payout-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: center;
        }

        .payout-chart {
          display: flex;
          justify-content: center;
        }

        .payout-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .stat-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 0.8em;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .stat-count {
          font-size: 1.2em;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-percentage {
          font-size: 0.9em;
          font-weight: 600;
          color: #374151;
          text-align: right;
        }

        @media (max-width: 768px) {
          .payout-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
