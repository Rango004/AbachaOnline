import TrendSparkline from './TrendSparkline';

export default function StatCard({
  icon,
  title,
  value,
  subtitle,
  color = '#3b82f6',
  trendValue = 0,
  trendLabel = 'vs last period',
  sparklineData = [],
  onClick = null,
}) {
  const isPositive = trendValue >= 0;
  const trendArrow = isPositive ? '↑' : '↓';
  const performanceColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div
      class="stat-card-enhanced"
      onClick={onClick}
      style={{
        '--stat-color': color,
        '--performance-color': performanceColor,
      }}
    >
      <div class="stat-card-header">
        <div class="stat-icon">{icon}</div>
        {sparklineData.length > 0 && (
          <div class="stat-sparkline">
            <TrendSparkline values={sparklineData} color={color} />
          </div>
        )}
      </div>

      <div class="stat-card-body">
        <h3 class="stat-value">{value}</h3>
        <p class="stat-title">{title}</p>
        {subtitle && <p class="stat-subtitle">{subtitle}</p>}
      </div>

      {trendValue !== 0 && (
        <div class="stat-card-footer">
          <div class="trend-indicator">
            <span class="trend-arrow" style={{ color: performanceColor }}>
              {trendArrow}
            </span>
            <span class="trend-value" style={{ color: performanceColor }}>
              {Math.abs(trendValue)}%
            </span>
          </div>
          <span class="trend-label">{trendLabel}</span>
        </div>
      )}

      <style>{`
        .stat-card-enhanced {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: ${onClick ? 'pointer' : 'default'};
          border-left: 4px solid var(--stat-color);
          position: relative;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .stat-card-enhanced:hover {
          ${
            onClick
              ? `
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            transform: translateY(-4px);
          `
              : ''
          }
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .stat-icon {
          font-size: 2rem;
          min-width: 50px;
        }

        .stat-sparkline {
          width: 80px;
          height: 40px;
        }

        .stat-card-body {
          flex-grow: 1;
        }

        .stat-value {
          font-size: 1.8em;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1f2937;
          word-break: break-word;
        }

        .stat-title {
          font-size: 0.9em;
          color: #6b7280;
          margin: 0;
          font-weight: 500;
        }

        .stat-subtitle {
          font-size: 0.8em;
          color: #9ca3af;
          margin: 4px 0 0 0;
        }

        .stat-card-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .trend-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .trend-arrow {
          font-size: 1.2em;
          font-weight: 700;
        }

        .trend-value {
          font-size: 0.9em;
          font-weight: 600;
        }

        .trend-label {
          font-size: 0.75em;
          color: #9ca3af;
          margin-left: auto;
        }
      `}</style>
    </div>
  );
}
