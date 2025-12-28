import { useState, useEffect } from 'preact/hooks';

/**
 * ConnectivityBadge Component
 * Shows online/offline status and sync progress
 */
export default function ConnectivityBadge({ syncManager }) {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    syncProgress: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);

  useEffect(() => {
    if (!syncManager) return;

    // Subscribe to sync events
    const unsubscribe = syncManager.subscribe((event) => {
      console.log('[ConnectivityBadge] Event:', event);

      setStatus((prev) => {
        let newStatus = { ...prev };

        if (event.type === 'online') {
          newStatus.isOnline = true;
        } else if (event.type === 'offline') {
          newStatus.isOnline = false;
        } else if (event.type === 'sync-start') {
          newStatus.isSyncing = true;
          newStatus.syncProgress = 0;
        } else if (event.type === 'operation-synced' || event.type === 'operation-sync-failed') {
          const total = syncManager.getStatus().pendingCount || 1;
          newStatus.syncProgress = Math.round(((total - event.operationId) / total) * 100);
        } else if (event.type === 'sync-complete') {
          newStatus.isSyncing = false;
          newStatus.syncProgress = 100;
          newStatus.pendingCount = event.pendingCount;

          // Show notification
          if (event.successCount > 0) {
            showNotification(
              `✅ Synced ${event.successCount} operation${event.successCount !== 1 ? 's' : ''}`,
              'success'
            );
          }
          if (event.failureCount > 0) {
            showNotification(
              `⚠️ Failed to sync ${event.failureCount} operation${event.failureCount !== 1 ? 's' : ''}`,
              'warning'
            );
          }
        } else if (event.type === 'operation-queued') {
          newStatus.pendingCount = syncManager.getStatus().pendingCount;
          showNotification('📋 Operation queued (will sync when online)', 'info');
        }

        return newStatus;
      });
    });

    // Get initial status
    const initialStatus = syncManager.getStatus();
    setStatus((prev) => ({
      ...prev,
      pendingCount: initialStatus.pendingCount,
      isSyncing: false
    }));

    return unsubscribe;
  }, [syncManager]);

  const showNotification = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Could integrate with a toast notification library here
  };

  const details = syncManager?.getStatus() || { pendingOperations: [] };

  return (
    <div class="connectivity-badge" onClick={() => setShowDetails(!showDetails)}>
      {/* Status indicator */}
      <div class={`status-indicator ${status.isOnline ? 'online' : 'offline'}`}>
        <span class="status-dot"></span>
        <span class="status-text">
          {status.isOnline
            ? status.isSyncing
              ? '🔄 Syncing...'
              : '✅ Online'
            : '❌ Offline'}
        </span>
      </div>

      {/* Pending operations count */}
      {status.pendingCount > 0 && (
        <div class="pending-badge">
          {status.pendingCount}
        </div>
      )}

      {/* Expanded details panel */}
      {showDetails && (
        <div class="connectivity-details" onClick={(e) => e.stopPropagation()}>
          <div class="details-header">
            <h4>Sync Status</h4>
            <button class="close-btn" onClick={() => setShowDetails(false)}>×</button>
          </div>

          <div class="details-content">
            {/* Status info */}
            <div class="detail-section">
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class={`detail-value ${status.isOnline ? 'online' : 'offline'}`}>
                  {status.isOnline ? '🌐 Online' : '📡 Offline'}
                </span>
              </div>

              {status.isSyncing && (
                <div class="detail-row">
                  <span class="detail-label">Syncing:</span>
                  <span class="detail-value syncing">
                    {status.syncProgress}%
                  </span>
                </div>
              )}

              {status.pendingCount > 0 && (
                <div class="detail-row">
                  <span class="detail-label">Pending:</span>
                  <span class="detail-value pending">
                    {status.pendingCount} operation{status.pendingCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {status.isSyncing && (
              <div class="progress-container">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style={{ width: `${status.syncProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Pending operations list */}
            {details.pendingOperations && details.pendingOperations.length > 0 && (
              <div class="detail-section">
                <div class="section-header" onClick={() => setExpandedDetails(!expandedDetails)}>
                  <h5>Pending Operations ({details.pendingOperations.length})</h5>
                  <span class="expand-icon">{expandedDetails ? '▼' : '▶'}</span>
                </div>

                {expandedDetails && (
                  <div class="operations-list">
                    {details.pendingOperations.map((op) => (
                      <div key={op.id} class="operation-item">
                        <div class="operation-type">{op.type}</div>
                        <div class="operation-endpoint">{op.endpoint}</div>
                        <div class="operation-time">
                          {new Date(op.createdAt).toLocaleTimeString()}
                        </div>
                        {op.retries > 0 && (
                          <div class="operation-retries">
                            Retries: {op.retries}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div class="detail-actions">
              {!status.isOnline && (
                <p class="offline-message">
                  📡 You are offline. Changes will sync when you're back online.
                </p>
              )}

              {status.isOnline && status.pendingCount > 0 && !status.isSyncing && (
                <button
                  class="btn-sync"
                  onClick={async () => {
                    await syncManager.syncQueue();
                  }}
                >
                  🔄 Sync Now
                </button>
              )}

              {status.pendingCount > 0 && (
                <button
                  class="btn-clear"
                  onClick={async () => {
                    if (confirm('Clear all pending operations?')) {
                      await syncManager.clearQueue();
                      setStatus((prev) => ({ ...prev, pendingCount: 0 }));
                      showNotification('✓ Cleared all pending operations', 'info');
                    }
                  }}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>

            {/* Info text */}
            <div class="detail-info">
              <small>
                {status.isOnline
                  ? 'Your connection is stable. All operations will sync automatically.'
                  : 'Your connection is unavailable. Operations will be queued and synced when online.'}
              </small>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .connectivity-badge {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1500;
          cursor: pointer;
          font-size: 12px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          border: 2px solid #ddd;
        }

        .status-indicator.online {
          border-color: #4caf50;
          background: #f1f8f4;
        }

        .status-indicator.offline {
          border-color: #f44336;
          background: #fef5f5;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
        }

        .status-indicator.online .status-dot {
          background: #4caf50;
          animation: pulse-online 2s infinite;
        }

        .status-indicator.offline .status-dot {
          background: #f44336;
        }

        @keyframes pulse-online {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .status-text {
          font-weight: 500;
          color: #333;
          min-width: 80px;
        }

        .pending-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff9800;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
          animation: badge-pulse 2s infinite;
        }

        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .connectivity-details {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 320px;
          max-height: 400px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          overflow-y: auto;
          z-index: 1501;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .details-header h4 {
          margin: 0;
          font-size: 14px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
        }

        .details-content {
          padding: 12px 16px;
        }

        .detail-section {
          margin-bottom: 12px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 6px 0;
        }

        .section-header h5 {
          margin: 0;
          font-size: 12px;
          color: #333;
        }

        .expand-icon {
          font-size: 10px;
          color: #999;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-label {
          color: #999;
          font-weight: 500;
        }

        .detail-value {
          color: #333;
          font-weight: 600;
        }

        .detail-value.online {
          color: #4caf50;
        }

        .detail-value.offline {
          color: #f44336;
        }

        .detail-value.syncing {
          color: #2196f3;
        }

        .detail-value.pending {
          color: #ff9800;
        }

        .progress-container {
          margin: 8px 0;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #f0f0f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2196f3, #1976d2);
          transition: width 0.3s;
        }

        .operations-list {
          max-height: 150px;
          overflow-y: auto;
        }

        .operation-item {
          padding: 8px;
          background: #f9f9f9;
          border-radius: 4px;
          margin-bottom: 6px;
          border-left: 3px solid #2196f3;
          font-size: 11px;
        }

        .operation-type {
          font-weight: 600;
          color: #333;
        }

        .operation-endpoint {
          color: #666;
          font-family: monospace;
          font-size: 10px;
          margin-top: 2px;
        }

        .operation-time {
          color: #999;
          font-size: 10px;
          margin-top: 2px;
        }

        .operation-retries {
          color: #f44336;
          font-size: 10px;
          margin-top: 2px;
        }

        .detail-actions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .offline-message {
          margin: 0;
          padding: 8px;
          background: #fff3cd;
          border-left: 3px solid #ffc107;
          color: #856404;
          font-size: 12px;
          border-radius: 3px;
        }

        .btn-sync,
        .btn-clear {
          width: 100%;
          padding: 8px;
          margin-bottom: 6px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-sync {
          background: #2196f3;
          color: white;
        }

        .btn-sync:hover {
          background: #1976d2;
        }

        .btn-clear {
          background: #f44336;
          color: white;
        }

        .btn-clear:hover {
          background: #da190b;
        }

        .detail-info {
          margin-top: 8px;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 3px;
          color: #666;
        }

        .detail-info small {
          line-height: 1.4;
        }

        @media (max-width: 480px) {
          .connectivity-badge {
            bottom: 10px;
            right: 10px;
          }

          .connectivity-details {
            bottom: 60px;
            right: 10px;
            width: calc(100% - 20px);
            max-width: 320px;
          }
        }
      `}</style>
    </div>
  );
}
