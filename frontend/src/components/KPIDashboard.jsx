import { useState, useEffect } from 'preact/hooks';
import StatCard from './StatCard';
import api from '../services/api';

export default function KPIDashboard({ stats }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      setLoading(false);
      // Generate mock KPI data based on stats
      if (stats) {
        const completion_rate = stats.total_orders > 0
          ? ((stats.completed_orders / stats.total_orders) * 100).toFixed(1)
          : 0;
        const avg_order_value = stats.total_orders > 0
          ? (stats.total_revenue / stats.total_orders).toFixed(2)
          : 0;

        setKpis({
          // Order Metrics
          total_orders: stats.total_orders || 0,
          pending_orders: Math.floor((stats.active_orders || 0) * 0.6),
          delivered_orders: stats.completed_orders || 0,
          cancelled_orders: Math.floor((stats.total_orders || 0) * 0.05),
          on_time_rate: '94.2',

          // Revenue Metrics
          total_revenue: stats.total_revenue || 0,
          avg_order_value: avg_order_value,
          daily_average: stats.today_revenue || 0,
          commission_earned: (stats.total_revenue * 0.05).toFixed(2),

          // Merchant Metrics
          active_merchants: stats.total_merchants || 0,
          high_performers: Math.floor((stats.total_merchants || 0) * 0.2),
          at_risk_merchants: Math.floor((stats.total_merchants || 0) * 0.08),
          avg_fulfillment_time: '2.5',

          // Rider Metrics
          total_riders: stats.total_riders || 0,
          avg_delivery_time: '22.5',
          on_time_deliveries: '91.8',
          active_riders: Math.floor((stats.total_riders || 0) * 0.75),

          // Customer Metrics
          total_customers: stats.total_customers || 0,
          repeat_customers: Math.floor((stats.total_customers || 0) * 0.35),
          at_risk_customers: Math.floor((stats.total_customers || 0) * 0.12),
          avg_customer_value: (stats.total_revenue / Math.max(stats.total_customers, 1)).toFixed(2),

          // System Health
          api_response_time: '142ms',
          error_rate: '0.23',
          database_load: '42',
          uptime: '99.98',

          // Trend data (mock)
          completion_rate_trend: [82, 84, 86, 88, 90, 92, 94],
          revenue_trend: [1500, 2100, 1900, 2500, 2300, 2800, 3100],
          delivery_time_trend: [28, 27, 26, 25, 24, 23, 22.5],
        });
      }
    } catch (err) {
      console.error('Error loading KPIs:', err);
    }
  };

  if (loading) {
    return <div class="kpi-loading">Loading KPIs...</div>;
  }

  if (!kpis) {
    return <div class="kpi-empty">No KPI data available</div>;
  }

  return (
    <div class="kpi-dashboard">
      {/* Orders Section */}
      <div class="kpi-section">
        <h3 class="section-title">📦 Order Metrics</h3>
        <div class="kpi-grid">
          <StatCard
            icon="📦"
            title="Total Orders"
            value={kpis.total_orders}
            trendValue={8.5}
            trendLabel="vs last month"
            sparklineData={[45, 52, 48, 61, 55, 67, 72]}
            color="#3b82f6"
          />
          <StatCard
            icon="⏳"
            title="Pending Orders"
            value={kpis.pending_orders}
            trendValue={-3.2}
            trendLabel="vs yesterday"
            sparklineData={[12, 15, 13, 18, 14, 16, 11]}
            color="#f59e0b"
          />
          <StatCard
            icon="✅"
            title="Delivered Orders"
            value={kpis.delivered_orders}
            trendValue={12.1}
            trendLabel="vs last month"
            sparklineData={[35, 38, 42, 45, 48, 52, 56]}
            color="#10b981"
          />
          <StatCard
            icon="❌"
            title="Cancelled Orders"
            value={kpis.cancelled_orders}
            trendValue={-5.3}
            trendLabel="vs last month"
            sparklineData={[8, 7, 8, 6, 5, 4, 3]}
            color="#ef4444"
          />
          <StatCard
            icon="⚡"
            title="On-Time Rate"
            value={`${kpis.on_time_rate}%`}
            trendValue={2.1}
            trendLabel="vs last period"
            sparklineData={[88, 89, 90, 91, 92, 93, 94.2]}
            color="#8b5cf6"
          />
          <StatCard
            icon="📊"
            title="Completion Rate"
            value={`${((kpis.delivered_orders / (kpis.total_orders || 1)) * 100).toFixed(1)}%`}
            trendValue={3.8}
            trendLabel="vs last month"
            sparklineData={[86, 87, 88, 89, 91, 92, 93]}
            color="#06b6d4"
          />
        </div>
      </div>

      {/* Revenue Section */}
      <div class="kpi-section">
        <h3 class="section-title">💰 Revenue Metrics</h3>
        <div class="kpi-grid">
          <StatCard
            icon="💵"
            title="Total Revenue"
            value={`Le ${parseFloat(kpis.total_revenue).toFixed(2)}`}
            trendValue={15.3}
            trendLabel="vs last month"
            sparklineData={[2000, 2300, 2100, 2800, 2600, 3100, 3200]}
            color="#3b82f6"
          />
          <StatCard
            icon="📈"
            title="Avg Order Value"
            value={`Le ${kpis.avg_order_value}`}
            trendValue={6.2}
            trendLabel="vs last month"
            sparklineData={[450, 480, 520, 510, 550, 570, 600]}
            color="#10b981"
          />
          <StatCard
            icon="📅"
            title="Daily Average"
            value={`Le ${parseFloat(kpis.daily_average).toFixed(2)}`}
            trendValue={4.5}
            trendLabel="vs yesterday"
            sparklineData={[280, 320, 350, 400, 420, 450, 500]}
            color="#f59e0b"
          />
          <StatCard
            icon="🏦"
            title="Commission Earned"
            value={`Le ${kpis.commission_earned}`}
            trendValue={15.3}
            trendLabel="vs last month"
            sparklineData={[100, 115, 105, 140, 130, 155, 160]}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Merchant Section */}
      <div class="kpi-section">
        <h3 class="section-title">🏪 Merchant Metrics</h3>
        <div class="kpi-grid">
          <StatCard
            icon="🏪"
            title="Active Merchants"
            value={kpis.active_merchants}
            trendValue={5.2}
            trendLabel="vs last month"
            sparklineData={[45, 48, 50, 52, 53, 54, 56]}
            color="#3b82f6"
          />
          <StatCard
            icon="⭐"
            title="High Performers"
            value={kpis.high_performers}
            trendValue={8.5}
            trendLabel="vs last month"
            sparklineData={[9, 9, 10, 10, 10, 11, 11]}
            color="#10b981"
          />
          <StatCard
            icon="⚠️"
            title="At-Risk Merchants"
            value={kpis.at_risk_merchants}
            trendValue={-2.1}
            trendLabel="vs last month"
            sparklineData={[6, 5, 5, 4, 4, 4, 4]}
            color="#ef4444"
          />
          <StatCard
            icon="⏱️"
            title="Avg Fulfillment"
            value={`${kpis.avg_fulfillment_time}h`}
            trendValue={-8.3}
            trendLabel="vs last month"
            sparklineData={[3.2, 3.0, 2.9, 2.7, 2.6, 2.5, 2.5]}
            color="#06b6d4"
          />
        </div>
      </div>

      {/* Rider Section */}
      <div class="kpi-section">
        <h3 class="section-title">🚚 Rider Metrics</h3>
        <div class="kpi-grid">
          <StatCard
            icon="🚚"
            title="Total Riders"
            value={kpis.total_riders}
            trendValue={6.1}
            trendLabel="vs last month"
            sparklineData={[28, 30, 32, 33, 34, 35, 36]}
            color="#3b82f6"
          />
          <StatCard
            icon="⏱️"
            title="Avg Delivery Time"
            value={`${kpis.avg_delivery_time}min`}
            trendValue={-5.6}
            trendLabel="vs last month"
            sparklineData={[28, 27, 26, 25, 24, 23, 22.5]}
            color="#f59e0b"
          />
          <StatCard
            icon="✅"
            title="On-Time Rate"
            value={`${kpis.on_time_deliveries}%`}
            trendValue={3.4}
            trendLabel="vs last month"
            sparklineData={[86, 87, 88, 89, 90, 91, 91.8]}
            color="#10b981"
          />
          <StatCard
            icon="🟢"
            title="Active Riders"
            value={kpis.active_riders}
            trendValue={4.3}
            trendLabel="vs yesterday"
            sparklineData={[25, 26, 27, 27, 28, 28, 27]}
            color="#06b6d4"
          />
        </div>
      </div>

      {/* Customer Section */}
      <div class="kpi-section">
        <h3 class="section-title">👥 Customer Metrics</h3>
        <div class="kpi-grid">
          <StatCard
            icon="👥"
            title="Total Customers"
            value={kpis.total_customers}
            trendValue={9.2}
            trendLabel="vs last month"
            sparklineData={[180, 195, 210, 225, 235, 245, 260]}
            color="#3b82f6"
          />
          <StatCard
            icon="🔄"
            title="Repeat Customers"
            value={kpis.repeat_customers}
            trendValue={12.5}
            trendLabel="vs last month"
            sparklineData={[70, 75, 80, 85, 88, 90, 91]}
            color="#10b981"
          />
          <StatCard
            icon="⚠️"
            title="At-Risk Customers"
            value={kpis.at_risk_customers}
            trendValue={-4.2}
            trendLabel="vs last month"
            sparklineData={[38, 36, 34, 32, 30, 28, 31]}
            color="#ef4444"
          />
          <StatCard
            icon="💳"
            title="Avg Customer Value"
            value={`Le ${kpis.avg_customer_value}`}
            trendValue={3.8}
            trendLabel="vs last month"
            sparklineData={[1850, 1920, 1980, 2050, 2100, 2150, 2200]}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* System Health Section */}
      <div class="kpi-section">
        <h3 class="section-title">🔧 System Health</h3>
        <div class="kpi-grid">
          <StatCard
            icon="⚡"
            title="API Response Time"
            value={kpis.api_response_time}
            trendValue={-8.5}
            trendLabel="faster than average"
            sparklineData={[180, 170, 160, 150, 145, 142, 142]}
            color="#10b981"
          />
          <StatCard
            icon="❌"
            title="Error Rate"
            value={`${kpis.error_rate}%`}
            trendValue={-0.12}
            trendLabel="vs yesterday"
            sparklineData={[0.5, 0.45, 0.4, 0.35, 0.28, 0.25, 0.23]}
            color="#ef4444"
          />
          <StatCard
            icon="💾"
            title="Database Load"
            value={`${kpis.database_load}%`}
            trendValue={2.1}
            trendLabel="vs yesterday"
            sparklineData={[35, 36, 38, 40, 41, 42, 42]}
            color="#f59e0b"
          />
          <StatCard
            icon="🟢"
            title="System Uptime"
            value={`${kpis.uptime}%`}
            trendValue={0.02}
            trendLabel="vs last month"
            sparklineData={[99.95, 99.96, 99.97, 99.98, 99.98, 99.99, 99.98]}
            color="#10b981"
          />
        </div>
      </div>

      <style>{`
        .kpi-dashboard {
          padding: 20px;
        }

        .kpi-loading, .kpi-empty {
          padding: 40px;
          text-align: center;
          color: #6b7280;
          font-size: 1.1em;
        }

        .kpi-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 1.3em;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #e5e7eb;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 1.1em;
          }
        }
      `}</style>
    </div>
  );
}
