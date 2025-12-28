import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import AlertCard from './AlertCard';
import api from '../services/api';

export default function AlertsPanel({ stats }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stats) {
      generateAlerts();
    }
  }, [stats]);

  const generateAlerts = async () => {
    setLoading(true);
    const generatedAlerts = [];

    try {
      // Fetch real data from backend
      const refundData = await api.getAdminRefundAnalytics();
      const systemHealth = await api.getAdminSystemHealth();

      // Alert: High refund rate
      const refundRate = refundData?.refund_rate || 0;
      if (refundRate > 10) {
        generatedAlerts.push({
          id: 'high-refunds',
          severity: 'high',
          title: '⚠️ High Refund Rate Detected',
          subtitle: `${refundRate.toFixed(1)}% of delivered orders refunded`,
          message: `Current refund rate (${refundRate.toFixed(1)}%) exceeds the normal threshold of 10%. This may indicate quality or delivery issues.`,
          details: [
            `Requested: ${refundData.requested_count}`,
            `Escalated: ${refundData.escalated_count}`,
            `Approved: ${refundData.approved_count}`,
            `Period: Last 30 days`
          ],
          action: {
            label: 'Review Refunds',
            onClick: () => route('/admin/refunds'),
          },
        });
      }

      // Alert: High pending refunds needing escalation
      if (refundData?.requested_count > 10) {
        generatedAlerts.push({
          id: 'pending-refunds',
          severity: 'high',
          title: '🔔 Refunds Pending Admin Review',
          subtitle: `${refundData.requested_count} refunds awaiting decision`,
          message: `There are ${refundData.requested_count} refund requests that need admin review and decision.`,
          details: [
            `Pending review: ${refundData.requested_count}`,
            `Escalated: ${refundData.escalated_count}`,
            `Approval rate: ${refundData.refund_approval_rate?.toFixed(1) || 0}%`,
            `Action: Process pending refunds promptly`
          ],
          action: {
            label: 'Process Refunds',
            onClick: () => route('/admin/refunds'),
          },
        });
      }

      // Alert: High active orders
      if (stats && stats.active_orders > 500) {
        generatedAlerts.push({
          id: 'high-active-orders',
          severity: 'medium',
          title: '📦 High Active Order Volume',
          subtitle: `${stats.active_orders} orders currently processing`,
          message: `Active orders are ${((stats.active_orders / stats.total_orders) * 100).toFixed(1)}% of total. Monitor system capacity.`,
          details: [
            `Active orders: ${stats.active_orders}`,
            `Total orders: ${stats.total_orders}`,
            `Completion rate: ${stats.completed_orders > 0 ? ((stats.completed_orders / stats.total_orders) * 100).toFixed(1) : 0}%`
          ],
        });
      }

      // Alert: Pending refunds from system
      if (systemHealth?.pending_refunds > 20) {
        generatedAlerts.push({
          id: 'refund-backlog',
          severity: 'high',
          title: '⏳ Refund Processing Backlog',
          subtitle: `${systemHealth.pending_refunds} refunds in pipeline`,
          message: `There is a backlog of ${systemHealth.pending_refunds} refund requests in the system that need processing.`,
          details: [
            `Pending refunds: ${systemHealth.pending_refunds}`,
            `Cancelled orders: ${systemHealth.cancelled_orders}`,
            `Recommendation: Increase refund processing resources`
          ],
          action: {
            label: 'View Backlog',
            onClick: () => console.log('Navigate to refund backlog'),
          },
        });
      }

      // Alert: Delivery performance
      if (systemHealth?.deliveries_24h > 0) {
        const onTimeRate = (systemHealth.on_time_24h / systemHealth.deliveries_24h) * 100;
        if (onTimeRate < 95) {
          generatedAlerts.push({
            id: 'delivery-rate',
            severity: 'medium',
            title: '🚗 Delivery On-Time Rate Below Target',
            subtitle: `${onTimeRate.toFixed(1)}% on-time (target: 95%)`,
            message: `Rider on-time delivery rate is ${onTimeRate.toFixed(1)}%, below the 95% SLA target.`,
            details: [
              `On-time deliveries (24h): ${systemHealth.on_time_24h}`,
              `Total deliveries (24h): ${systemHealth.deliveries_24h}`,
              `SLA target: 95%`
            ],
            action: {
              label: 'View Riders',
              onClick: () => console.log('Navigate to rider performance'),
            },
          });
        }
      }

      // Alert: High average delivery time
      const avgDeliveryHours = parseFloat(systemHealth?.avg_delivery_hours_7d) || 0;
      if (avgDeliveryHours > 2) {
        generatedAlerts.push({
          id: 'delivery-time',
          severity: 'medium',
          title: '⏱️ High Average Delivery Time',
          subtitle: `${avgDeliveryHours.toFixed(1)}h avg (SLA: 2h)`,
          message: `7-day average delivery time is ${avgDeliveryHours.toFixed(1)} hours, exceeding the 2-hour SLA.`,
          details: [
            `7-day average: ${avgDeliveryHours.toFixed(1)} hours`,
            `24h revenue: Le ${systemHealth.revenue_24h?.toLocaleString() || 0}`,
            `24h deliveries: ${systemHealth.deliveries_24h}`
          ],
          action: {
            label: 'Optimize Routes',
            onClick: () => console.log('Navigate to route optimization'),
          },
        });
      }

      // Alert: Cancelled orders
      if (systemHealth?.cancelled_orders > 50) {
        generatedAlerts.push({
          id: 'cancelled-orders',
          severity: 'low',
          title: '❌ High Order Cancellation Count',
          subtitle: `${systemHealth.cancelled_orders} cancelled orders`,
          message: `There have been ${systemHealth.cancelled_orders} order cancellations. Investigate patterns.`,
          details: [
            `Cancelled orders: ${systemHealth.cancelled_orders}`,
            `Pending orders: ${systemHealth.pending_orders}`,
            `Recommendation: Review cancellation reasons`
          ],
        });
      }

      if (generatedAlerts.length === 0) {
        // Add a success message if no alerts
        generatedAlerts.push({
          id: 'all-clear',
          severity: 'info',
          title: '✅ System Status: All Clear',
          subtitle: 'All metrics within normal ranges',
          message: 'No critical or warning alerts detected. All systems operational.',
          details: [
            `Active orders: ${stats?.active_orders || 0}`,
            `Refund rate: ${refundRate.toFixed(1)}%`,
            `Pending refunds: ${systemHealth?.pending_refunds || 0}`
          ],
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error generating alerts:', error);
      // Fallback: Show error alert
      setAlerts([{
        id: 'error',
        severity: 'high',
        title: 'Alert System Error',
        subtitle: 'Failed to fetch alert data',
        message: `Unable to load alert metrics: ${error.message}`,
        details: ['Check backend connectivity', 'Verify API endpoints'],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter((a) => a.id !== alertId));
  };

  const filteredAlerts =
    selectedSeverity === 'all' ? alerts : alerts.filter((a) => a.severity === selectedSeverity);

  const severityCounts = {
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'low').length,
  };

  return (
    <div class="alerts-panel">
      <div class="alerts-header">
        <h3>🔔 Performance Alerts ({alerts.length})</h3>
        <div class="severity-filters">
          <button
            class={`filter-btn ${selectedSeverity === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSeverity('all')}
          >
            All ({alerts.length})
          </button>
          {severityCounts.critical > 0 && (
            <button
              class={`filter-btn critical ${selectedSeverity === 'critical' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('critical')}
            >
              🔴 Critical ({severityCounts.critical})
            </button>
          )}
          {severityCounts.high > 0 && (
            <button
              class={`filter-btn high ${selectedSeverity === 'high' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('high')}
            >
              🟠 High ({severityCounts.high})
            </button>
          )}
          {severityCounts.medium > 0 && (
            <button
              class={`filter-btn medium ${selectedSeverity === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('medium')}
            >
              🟡 Medium ({severityCounts.medium})
            </button>
          )}
          {severityCounts.low > 0 && (
            <button
              class={`filter-btn low ${selectedSeverity === 'low' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('low')}
            >
              🔵 Low ({severityCounts.low})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div class="alerts-loading">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div class="alerts-empty">
          {selectedSeverity === 'all'
            ? '✅ All systems operational. No alerts at this time.'
            : `✅ No ${selectedSeverity} severity alerts.`}
        </div>
      ) : (
        <div class="alerts-list">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))}
        </div>
      )}

      <style>{`
        .alerts-panel {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .alerts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .alerts-header h3 {
          margin: 0;
          font-size: 1.1em;
          color: #1f2937;
        }

        .severity-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85em;
          font-weight: 500;
          transition: all 0.3s ease;
          color: #6b7280;
        }

        .filter-btn:hover {
          background: #f3f4f6;
        }

        .filter-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .filter-btn.critical.active {
          background: #dc2626;
          border-color: #dc2626;
        }

        .filter-btn.high.active {
          background: #f59e0b;
          border-color: #f59e0b;
        }

        .filter-btn.medium.active {
          background: #f59e0b;
          border-color: #f59e0b;
        }

        .filter-btn.low.active {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .alerts-loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .alerts-empty {
          text-align: center;
          padding: 40px;
          color: #10b981;
          font-weight: 500;
          background: #f0fdf4;
          border-radius: 6px;
        }

        .alerts-list {
          max-height: 600px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .alerts-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .severity-filters {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
