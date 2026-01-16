import { useState, useEffect } from 'preact/hooks';
import OfflineSync from '../services/OfflineSyncService';
import TileCacheService from '../services/TileCacheService';
import { getNetworkStatus } from '../services/NativeBridge';

/**
 * StorageManager Component
 * UI for managing offline storage and cached data
 */
export default function StorageManager({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(null);
  const [downloadingMap, setDownloadingMap] = useState(false);
  const [mapProgress, setMapProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const offlineStats = await OfflineSync.getStorageStats();

      // Get additional stats
      let tileStats = { tileCount: 0, totalSizeMB: 0 };
      try {
        tileStats = await TileCacheService.getCacheStats();
      } catch (e) {
        console.warn('[StorageManager] Could not get tile stats:', e);
      }

      setStats({
        ...offlineStats,
        tiles: tileStats.tileCount || 0,
        tilesSizeMB: tileStats.totalSizeMB || 0
      });
    } catch (err) {
      console.error('[StorageManager] Failed to load stats:', err);
      setError('Failed to load storage statistics');
    } finally {
      setLoading(false);
    }
  };

  const clearCategory = async (category) => {
    if (!confirm(`Are you sure you want to clear ${category}? This cannot be undone.`)) {
      return;
    }

    try {
      setClearing(category);
      setError(null);

      switch (category) {
        case 'products':
          await OfflineSync.db?.clear?.('products');
          setSuccess('Cached products cleared');
          break;
        case 'orders':
          await OfflineSync.db?.clear?.('orders');
          setSuccess('Order history cleared');
          break;
        case 'images':
          await OfflineSync.db?.clear?.('imageCache');
          setSuccess('Cached images cleared');
          break;
        case 'messages':
          // Only clear synced messages, keep pending
          const messages = await OfflineSync.db?.getAllFromIndex?.('messages', 'syncStatus', 'synced');
          if (messages) {
            for (const msg of messages) {
              await OfflineSync.db?.delete?.('messages', msg.id);
            }
          }
          setSuccess('Old messages cleared');
          break;
        case 'tiles':
          await TileCacheService.clearCache();
          setSuccess('Map tiles cleared');
          break;
        case 'all':
          await OfflineSync.cleanupStorage();
          await TileCacheService.clearCache();
          setSuccess('All cached data cleared');
          break;
        default:
          break;
      }

      await loadStats();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`[StorageManager] Failed to clear ${category}:`, err);
      setError(`Failed to clear ${category}`);
    } finally {
      setClearing(null);
    }
  };

  const downloadCampusMap = async () => {
    const { connected } = await getNetworkStatus();
    if (!connected) {
      setError('Please connect to WiFi to download map tiles');
      return;
    }

    try {
      setDownloadingMap(true);
      setMapProgress(0);
      setError(null);

      await TileCacheService.backgroundPreloadCampus((progress) => {
        setMapProgress(progress);
      });

      setSuccess('Campus map downloaded successfully!');
      await loadStats();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[StorageManager] Failed to download map:', err);
      setError('Failed to download map tiles');
    } finally {
      setDownloadingMap(false);
      setMapProgress(0);
    }
  };

  const getUsagePercent = () => {
    if (!stats || !stats.quotaMB || !stats.usageMB) return 0;
    return Math.round((parseFloat(stats.usageMB) / parseFloat(stats.quotaMB)) * 100);
  };

  const getStorageColor = () => {
    const percent = getUsagePercent();
    if (percent > 90) return '#f44336';
    if (percent > 70) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div class="storage-manager-overlay" onClick={onClose}>
      <div class="storage-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>Storage Management</h2>
          <button class="close-btn" onClick={onClose}>x</button>
        </div>

        <div class="modal-content">
          {error && (
            <div class="alert alert-error">{error}</div>
          )}
          {success && (
            <div class="alert alert-success">{success}</div>
          )}

          {loading ? (
            <div class="loading-state">
              <p>Loading storage statistics...</p>
            </div>
          ) : (
            <>
              {/* Storage Overview */}
              <div class="storage-overview">
                <div class="storage-meter">
                  <div class="meter-label">
                    <span>Storage Used</span>
                    <span>{stats?.usageMB || 0} MB / {stats?.quotaMB || 100} MB</span>
                  </div>
                  <div class="meter-bar">
                    <div
                      class="meter-fill"
                      style={{
                        width: `${getUsagePercent()}%`,
                        background: getStorageColor()
                      }}
                    />
                  </div>
                  <div class="meter-percent">{getUsagePercent()}% used</div>
                </div>
              </div>

              {/* Storage Breakdown */}
              <div class="storage-breakdown">
                <h3>Cached Data</h3>

                <div class="storage-item">
                  <div class="item-info">
                    <span class="item-icon">📦</span>
                    <div class="item-details">
                      <span class="item-name">Products</span>
                      <span class="item-count">{stats?.products || 0} items cached</span>
                    </div>
                  </div>
                  <button
                    class="btn-clear"
                    onClick={() => clearCategory('products')}
                    disabled={clearing === 'products' || !stats?.products}
                  >
                    {clearing === 'products' ? 'Clearing...' : 'Clear'}
                  </button>
                </div>

                <div class="storage-item">
                  <div class="item-info">
                    <span class="item-icon">🛒</span>
                    <div class="item-details">
                      <span class="item-name">Orders</span>
                      <span class="item-count">{stats?.orders || 0} orders cached</span>
                    </div>
                  </div>
                  <button
                    class="btn-clear"
                    onClick={() => clearCategory('orders')}
                    disabled={clearing === 'orders' || !stats?.orders}
                  >
                    {clearing === 'orders' ? 'Clearing...' : 'Clear'}
                  </button>
                </div>

                <div class="storage-item">
                  <div class="item-info">
                    <span class="item-icon">🖼️</span>
                    <div class="item-details">
                      <span class="item-name">Images</span>
                      <span class="item-count">Product & profile images</span>
                    </div>
                  </div>
                  <button
                    class="btn-clear"
                    onClick={() => clearCategory('images')}
                    disabled={clearing === 'images'}
                  >
                    {clearing === 'images' ? 'Clearing...' : 'Clear'}
                  </button>
                </div>

                <div class="storage-item">
                  <div class="item-info">
                    <span class="item-icon">💬</span>
                    <div class="item-details">
                      <span class="item-name">Messages</span>
                      <span class="item-count">Old synced messages</span>
                    </div>
                  </div>
                  <button
                    class="btn-clear"
                    onClick={() => clearCategory('messages')}
                    disabled={clearing === 'messages'}
                  >
                    {clearing === 'messages' ? 'Clearing...' : 'Clear'}
                  </button>
                </div>

                <div class="storage-item">
                  <div class="item-info">
                    <span class="item-icon">🗺️</span>
                    <div class="item-details">
                      <span class="item-name">Map Tiles</span>
                      <span class="item-count">
                        {stats?.tiles || 0} tiles ({stats?.tilesSizeMB?.toFixed(1) || 0} MB)
                      </span>
                    </div>
                  </div>
                  <button
                    class="btn-clear"
                    onClick={() => clearCategory('tiles')}
                    disabled={clearing === 'tiles' || !stats?.tiles}
                  >
                    {clearing === 'tiles' ? 'Clearing...' : 'Clear'}
                  </button>
                </div>
              </div>

              {/* Sync Queue */}
              <div class="sync-queue-section">
                <h3>Sync Queue</h3>
                <div class="queue-stats">
                  <div class="queue-stat">
                    <span class="stat-value">{stats?.pendingSync || 0}</span>
                    <span class="stat-label">Pending</span>
                  </div>
                  <div class="queue-stat">
                    <span class="stat-value" style={{ color: '#f44336' }}>{stats?.failedSync || 0}</span>
                    <span class="stat-label">Failed</span>
                  </div>
                  <div class="queue-stat">
                    <span class="stat-value">{stats?.cartItems || 0}</span>
                    <span class="stat-label">Cart Items</span>
                  </div>
                </div>
              </div>

              {/* Map Download Section */}
              <div class="map-download-section">
                <h3>Offline Maps</h3>
                <p class="section-description">
                  Download the campus map for offline navigation (requires WiFi)
                </p>

                {downloadingMap ? (
                  <div class="download-progress">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        style={{ width: `${mapProgress}%` }}
                      />
                    </div>
                    <span>{mapProgress}% downloaded</span>
                  </div>
                ) : (
                  <button
                    class="btn-download"
                    onClick={downloadCampusMap}
                    disabled={downloadingMap}
                  >
                    Download Campus Map
                  </button>
                )}
              </div>

              {/* Clear All */}
              <div class="clear-all-section">
                <button
                  class="btn-clear-all"
                  onClick={() => clearCategory('all')}
                  disabled={clearing === 'all'}
                >
                  {clearing === 'all' ? 'Clearing All Data...' : 'Clear All Cached Data'}
                </button>
                <p class="warning-text">
                  This will remove all cached products, orders, images, and map tiles.
                  Pending operations will not be affected.
                </p>
              </div>
            </>
          )}
        </div>

        <style>{`
          .storage-manager-overlay {
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

          .storage-manager-modal {
            background: white;
            border-radius: 12px;
            width: 100%;
            max-width: 500px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }

          .storage-manager-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #eee;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px 12px 0 0;
          }

          .storage-manager-modal .modal-header h2 {
            margin: 0;
            font-size: 18px;
          }

          .storage-manager-modal .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            line-height: 32px;
          }

          .storage-manager-modal .modal-content {
            padding: 20px;
          }

          .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .alert-error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #ef9a9a;
          }

          .alert-success {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #a5d6a7;
          }

          .loading-state {
            text-align: center;
            padding: 40px;
            color: #666;
          }

          .storage-overview {
            margin-bottom: 24px;
          }

          .storage-meter {
            background: #f5f5f5;
            border-radius: 8px;
            padding: 16px;
          }

          .meter-label {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 8px;
          }

          .meter-bar {
            height: 12px;
            background: #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
          }

          .meter-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.3s;
          }

          .meter-percent {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 8px;
          }

          .storage-breakdown h3,
          .sync-queue-section h3,
          .map-download-section h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #333;
          }

          .storage-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 8px;
          }

          .item-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .item-icon {
            font-size: 24px;
          }

          .item-details {
            display: flex;
            flex-direction: column;
          }

          .item-name {
            font-weight: 600;
            color: #333;
            font-size: 14px;
          }

          .item-count {
            font-size: 12px;
            color: #666;
          }

          .btn-clear {
            padding: 6px 12px;
            border: 1px solid #e0e0e0;
            background: white;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            color: #666;
            transition: all 0.2s;
          }

          .btn-clear:hover:not(:disabled) {
            background: #f5f5f5;
            border-color: #bbb;
          }

          .btn-clear:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .sync-queue-section {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #eee;
          }

          .queue-stats {
            display: flex;
            gap: 16px;
          }

          .queue-stat {
            flex: 1;
            text-align: center;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 8px;
          }

          .stat-value {
            display: block;
            font-size: 24px;
            font-weight: 700;
            color: #333;
          }

          .stat-label {
            font-size: 12px;
            color: #666;
          }

          .map-download-section {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #eee;
          }

          .section-description {
            font-size: 13px;
            color: #666;
            margin: 0 0 12px 0;
          }

          .btn-download {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-download:hover:not(:disabled) {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          }

          .btn-download:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .download-progress {
            text-align: center;
          }

          .download-progress .progress-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .download-progress .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #2196f3, #1976d2);
            transition: width 0.3s;
          }

          .download-progress span {
            font-size: 13px;
            color: #666;
          }

          .clear-all-section {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #eee;
          }

          .btn-clear-all {
            width: 100%;
            padding: 12px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-clear-all:hover:not(:disabled) {
            background: #d32f2f;
          }

          .btn-clear-all:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .warning-text {
            font-size: 12px;
            color: #999;
            text-align: center;
            margin: 12px 0 0 0;
          }

          @media (max-width: 480px) {
            .storage-manager-modal {
              max-height: 90vh;
            }

            .queue-stats {
              flex-wrap: wrap;
            }

            .queue-stat {
              min-width: calc(50% - 8px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
