import { useState, useEffect } from 'preact/hooks';
import OfflineSync from '../services/OfflineSyncService';

/**
 * ConflictResolver Component
 * UI for resolving sync conflicts between local and server data
 */
export default function ConflictResolver({ onConflictResolved }) {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    loadConflicts();

    // Subscribe to conflict events
    const unsubscribe = OfflineSync.onSyncEvent((event) => {
      if (event.type === 'conflict') {
        setConflicts(prev => [...prev, event.conflict]);
      } else if (event.type === 'conflictResolved') {
        setConflicts(prev => prev.filter(c => c.id !== event.conflictId));
        if (onConflictResolved) {
          onConflictResolved(event.conflictId, event.strategy);
        }
      }
    });

    return unsubscribe;
  }, []);

  const loadConflicts = async () => {
    try {
      setLoading(true);
      const unresolvedConflicts = await OfflineSync.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts || []);
    } catch (err) {
      console.error('[ConflictResolver] Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (conflictId, strategy) => {
    try {
      setResolving(conflictId);
      await OfflineSync.resolveConflict(conflictId, strategy);
      setConflicts(prev => prev.filter(c => c.id !== conflictId));

      if (onConflictResolved) {
        onConflictResolved(conflictId, strategy);
      }
    } catch (err) {
      console.error('[ConflictResolver] Failed to resolve conflict:', err);
      alert(`Failed to resolve conflict: ${err.message}`);
    } finally {
      setResolving(null);
    }
  };

  const renderConflictPreview = (data, type) => {
    if (!data) return <p>No data</p>;

    if (type === 'cart' && Array.isArray(data)) {
      return (
        <div style={{ fontSize: '12px' }}>
          <p><strong>{data.length} items:</strong></p>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            {data.slice(0, 3).map((item, idx) => (
              <li key={idx}>{item.name || item.product_name || `Item ${item.productId}`} x{item.quantity || 1}</li>
            ))}
            {data.length > 3 && <li>...and {data.length - 3} more</li>}
          </ul>
        </div>
      );
    }

    if (type === 'wishlist' && Array.isArray(data)) {
      return (
        <div style={{ fontSize: '12px' }}>
          <p><strong>{data.length} items in wishlist</strong></p>
        </div>
      );
    }

    if (type === 'addresses' && Array.isArray(data)) {
      return (
        <div style={{ fontSize: '12px' }}>
          <p><strong>{data.length} addresses:</strong></p>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            {data.slice(0, 2).map((addr, idx) => (
              <li key={idx}>{addr.address_label || addr.delivery_address?.substring(0, 30)}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Default: show JSON preview
    return (
      <pre style={{ fontSize: '10px', maxHeight: '100px', overflow: 'auto', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const getConflictIcon = (type) => {
    switch (type) {
      case 'cart': return '🛒';
      case 'wishlist': return '❤️';
      case 'addresses': return '📍';
      case 'product': return '📦';
      default: return '⚠️';
    }
  };

  if (loading) {
    return null;
  }

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div class="conflict-resolver-overlay">
      <div class="conflict-resolver-modal">
        <div class="modal-header">
          <h2>⚠️ Sync Conflicts Detected</h2>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            The following items were changed both online and offline. Please choose how to resolve each conflict.
          </p>
        </div>

        <div class="conflicts-list">
          {conflicts.map(conflict => (
            <div key={conflict.id} class="conflict-card">
              <div class="conflict-header">
                <h3>
                  {getConflictIcon(conflict.type)} {conflict.type.charAt(0).toUpperCase() + conflict.type.slice(1)} Conflict
                </h3>
                <span class="conflict-time">
                  {new Date(conflict.timestamp).toLocaleString()}
                </span>
              </div>

              <div class="conflict-versions">
                {/* Local Version */}
                <div class="version local">
                  <h4>📱 Your Changes (Local)</h4>
                  {renderConflictPreview(conflict.local, conflict.type)}
                  <button
                    class="btn-resolve btn-local"
                    onClick={() => handleResolve(conflict.id, 'local')}
                    disabled={resolving === conflict.id}
                  >
                    {resolving === conflict.id ? 'Resolving...' : '✅ Keep Mine'}
                  </button>
                </div>

                {/* Server Version */}
                <div class="version server">
                  <h4>☁️ Server Version</h4>
                  {renderConflictPreview(conflict.server, conflict.type)}
                  <button
                    class="btn-resolve btn-server"
                    onClick={() => handleResolve(conflict.id, 'server')}
                    disabled={resolving === conflict.id}
                  >
                    {resolving === conflict.id ? 'Resolving...' : '⬇️ Use Server'}
                  </button>
                </div>
              </div>

              {/* Merge Option */}
              {conflict.canMerge && (
                <div class="merge-section">
                  <button
                    class="btn-resolve btn-merge"
                    onClick={() => handleResolve(conflict.id, 'merge')}
                    disabled={resolving === conflict.id}
                  >
                    {resolving === conflict.id ? 'Merging...' : '🔄 Merge Both (Recommended)'}
                  </button>
                  <p class="merge-description">
                    Combines items from both versions without losing any data
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div class="modal-footer">
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            💡 Tip: "Merge Both" is usually the safest option for cart and wishlist conflicts
          </p>
        </div>
      </div>

      <style>{`
        .conflict-resolver-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .conflict-resolver-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 700px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .modal-header p {
          color: rgba(255, 255, 255, 0.9);
        }

        .conflicts-list {
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .conflict-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: #fafafa;
        }

        .conflict-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #fff3e0;
          border-bottom: 1px solid #ffcc80;
        }

        .conflict-header h3 {
          margin: 0;
          font-size: 16px;
          color: #e65100;
        }

        .conflict-time {
          font-size: 12px;
          color: #999;
        }

        .conflict-versions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e0e0e0;
        }

        @media (max-width: 600px) {
          .conflict-versions {
            grid-template-columns: 1fr;
          }
        }

        .version {
          padding: 16px;
          background: white;
        }

        .version h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #333;
        }

        .version.local {
          border-right: 1px solid #e0e0e0;
        }

        .version.local h4 {
          color: #1565c0;
        }

        .version.server h4 {
          color: #2e7d32;
        }

        .btn-resolve {
          width: 100%;
          padding: 10px 16px;
          margin-top: 12px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-resolve:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-local {
          background: #e3f2fd;
          color: #1565c0;
          border: 1px solid #90caf9;
        }

        .btn-local:hover:not(:disabled) {
          background: #bbdefb;
        }

        .btn-server {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #a5d6a7;
        }

        .btn-server:hover:not(:disabled) {
          background: #c8e6c9;
        }

        .merge-section {
          padding: 16px;
          background: white;
          border-top: 1px solid #e0e0e0;
          text-align: center;
        }

        .btn-merge {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
          max-width: 300px;
        }

        .btn-merge:hover:not(:disabled) {
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
        }

        .merge-description {
          margin: 8px 0 0 0;
          font-size: 12px;
          color: #666;
        }

        .modal-footer {
          padding: 16px 24px;
          background: #f5f5f5;
          border-top: 1px solid #e0e0e0;
          border-radius: 0 0 12px 12px;
        }
      `}</style>
    </div>
  );
}
