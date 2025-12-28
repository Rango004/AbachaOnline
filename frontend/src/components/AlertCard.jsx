export default function AlertCard({ alert, onDismiss }) {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#f59e0b',
      medium: '#f59e0b',
      low: '#3b82f6',
    };
    return colors[severity] || '#6b7280';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
    };
    return icons[severity] || '⚠️';
  };

  return (
    <div
      class="alert-card"
      style={{
        '--alert-color': getSeverityColor(alert.severity),
      }}
    >
      <div class="alert-header">
        <div class="alert-title-section">
          <span class="alert-icon">{getSeverityIcon(alert.severity)}</span>
          <div>
            <h4 class="alert-title">{alert.title}</h4>
            <p class="alert-subtitle">{alert.subtitle}</p>
          </div>
        </div>
        {onDismiss && (
          <button class="alert-dismiss" onClick={() => onDismiss(alert.id)}>
            ✕
          </button>
        )}
      </div>

      <p class="alert-message">{alert.message}</p>

      {alert.details && (
        <div class="alert-details">
          <ul>
            {alert.details.map((detail, idx) => (
              <li key={idx}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {alert.action && (
        <button class="alert-action" onClick={alert.action.onClick}>
          {alert.action.label}
        </button>
      )}

      <style>{`
        .alert-card {
          background: white;
          border-left: 4px solid var(--alert-color);
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .alert-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .alert-title-section {
          display: flex;
          gap: 12px;
          flex: 1;
        }

        .alert-icon {
          font-size: 1.3em;
          min-width: 24px;
          margin-top: 2px;
        }

        .alert-title {
          margin: 0 0 4px 0;
          font-size: 1em;
          font-weight: 600;
          color: #1f2937;
        }

        .alert-subtitle {
          margin: 0;
          font-size: 0.8em;
          color: #6b7280;
        }

        .alert-dismiss {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 1.2em;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
        }

        .alert-dismiss:hover {
          color: #6b7280;
        }

        .alert-message {
          margin: 0 0 12px 0;
          font-size: 0.9em;
          color: #374151;
          line-height: 1.5;
        }

        .alert-details {
          background: #f9fafb;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .alert-details ul {
          margin: 0;
          padding-left: 20px;
          list-style: disc;
        }

        .alert-details li {
          margin: 4px 0;
          font-size: 0.85em;
          color: #6b7280;
        }

        .alert-action {
          padding: 8px 12px;
          background: var(--alert-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85em;
          font-weight: 500;
          transition: opacity 0.3s ease;
        }

        .alert-action:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
