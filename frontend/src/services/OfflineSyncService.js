/**
 * OfflineSyncService - Complete offline-first data management
 *
 * Features:
 * - Request queuing when offline
 * - Automatic sync when back online
 * - Storage cleanup policies
 * - Conflict resolution (last-write-wins)
 */

import { openDB } from 'idb';
import { getNetworkStatus, watchNetworkStatus } from './NativeBridge';

// Database name and version
const DB_NAME = 'abachaonline-offline';
const DB_VERSION = 1;

// Storage limits
const MAX_CACHE_SIZE_MB = 30;
const PRODUCT_CACHE_DAYS = 7;
const ORDER_HISTORY_DAYS = 30;
const STORAGE_CLEANUP_THRESHOLD = 0.8; // 80%

let db = null;
let syncInProgress = false;
let listeners = [];

/**
 * Initialize the offline database
 */
export async function initOfflineDB() {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Sync queue for pending requests
      if (!database.objectStoreNames.contains('syncQueue')) {
        const syncStore = database.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true
        });
        syncStore.createIndex('status', 'status');
        syncStore.createIndex('timestamp', 'timestamp');
      }

      // Cached products
      if (!database.objectStoreNames.contains('products')) {
        const productStore = database.createObjectStore('products', {
          keyPath: 'id'
        });
        productStore.createIndex('cachedAt', 'cachedAt');
        productStore.createIndex('merchantId', 'merchant_id');
      }

      // Cached orders
      if (!database.objectStoreNames.contains('orders')) {
        const orderStore = database.createObjectStore('orders', {
          keyPath: 'id'
        });
        orderStore.createIndex('status', 'order_status');
        orderStore.createIndex('completedAt', 'completedAt');
        orderStore.createIndex('studentId', 'student_id');
      }

      // User profile cache
      if (!database.objectStoreNames.contains('userProfile')) {
        database.createObjectStore('userProfile', { keyPath: 'id' });
      }

      // Cart items (for offline cart)
      if (!database.objectStoreNames.contains('cart')) {
        database.createObjectStore('cart', { keyPath: 'productId' });
      }
    }
  });

  // Start watching network status
  watchNetworkStatus(handleNetworkChange);

  // Run initial cleanup
  cleanupStorage();

  console.log('[OfflineSync] Database initialized');
  return db;
}

/**
 * Handle network status changes
 */
async function handleNetworkChange({ connected, connectionType }) {
  console.log(`[OfflineSync] Network changed: ${connected ? 'online' : 'offline'} (${connectionType})`);

  notifyListeners({ type: 'networkChange', connected, connectionType });

  if (connected) {
    // Sync when we come back online
    await processPendingSync();
  }
}

/**
 * Queue a request for later sync
 */
export async function queueRequest(url, method, data, options = {}) {
  await initOfflineDB();

  const request = {
    url,
    method,
    data,
    headers: options.headers || {},
    timestamp: Date.now(),
    retries: 0,
    status: 'pending',
    priority: options.priority || 'normal', // 'high', 'normal', 'low'
    type: options.type || 'api' // 'api', 'order', 'profile'
  };

  const id = await db.add('syncQueue', request);
  console.log(`[OfflineSync] Queued request #${id}: ${method} ${url}`);

  notifyListeners({ type: 'queued', id, request });

  // Try to sync immediately if online
  const status = await getNetworkStatus();
  if (status.connected) {
    processPendingSync();
  }

  return id;
}

/**
 * Process all pending sync requests
 */
export async function processPendingSync() {
  if (syncInProgress) {
    console.log('[OfflineSync] Sync already in progress, skipping');
    return;
  }

  await initOfflineDB();
  syncInProgress = true;

  try {
    const pending = await db.getAllFromIndex('syncQueue', 'status', 'pending');

    if (pending.length === 0) {
      console.log('[OfflineSync] No pending requests');
      syncInProgress = false;
      return;
    }

    console.log(`[OfflineSync] Processing ${pending.length} pending requests`);
    notifyListeners({ type: 'syncStart', count: pending.length });

    // Sort by priority and timestamp
    pending.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });

    let successCount = 0;
    let failCount = 0;

    for (const req of pending) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            ...req.headers
          },
          body: req.data ? JSON.stringify(req.data) : undefined
        });

        if (response.ok) {
          // Success - remove from queue
          await db.delete('syncQueue', req.id);
          successCount++;
          console.log(`[OfflineSync] Synced request #${req.id}`);
          notifyListeners({ type: 'syncSuccess', id: req.id });
        } else if (response.status === 409) {
          // Conflict - handle with last-write-wins
          console.warn(`[OfflineSync] Conflict on request #${req.id}, server wins`);
          await db.delete('syncQueue', req.id);
          notifyListeners({ type: 'syncConflict', id: req.id });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`[OfflineSync] Failed request #${req.id}:`, error.message);

        // Increment retry count
        const newRetries = req.retries + 1;
        const newStatus = newRetries >= 3 ? 'failed' : 'pending';

        await db.put('syncQueue', {
          ...req,
          retries: newRetries,
          status: newStatus,
          lastError: error.message,
          lastAttempt: Date.now()
        });

        if (newStatus === 'failed') {
          failCount++;
          notifyListeners({ type: 'syncFailed', id: req.id, error: error.message });
        }
      }
    }

    console.log(`[OfflineSync] Sync complete: ${successCount} success, ${failCount} failed`);
    notifyListeners({ type: 'syncComplete', successCount, failCount });

  } finally {
    syncInProgress = false;
  }
}

/**
 * Get pending sync count
 */
export async function getPendingSyncCount() {
  await initOfflineDB();
  const pending = await db.getAllFromIndex('syncQueue', 'status', 'pending');
  return pending.length;
}

/**
 * Get failed sync requests
 */
export async function getFailedSyncRequests() {
  await initOfflineDB();
  return db.getAllFromIndex('syncQueue', 'status', 'failed');
}

/**
 * Retry failed requests
 */
export async function retryFailedRequests() {
  await initOfflineDB();
  const failed = await db.getAllFromIndex('syncQueue', 'status', 'failed');

  for (const req of failed) {
    await db.put('syncQueue', {
      ...req,
      status: 'pending',
      retries: 0
    });
  }

  if (failed.length > 0) {
    processPendingSync();
  }
}

/**
 * Cache products for offline access
 */
export async function cacheProducts(products) {
  await initOfflineDB();
  const tx = db.transaction('products', 'readwrite');

  for (const product of products) {
    await tx.store.put({
      ...product,
      cachedAt: Date.now()
    });
  }

  await tx.done;
  console.log(`[OfflineSync] Cached ${products.length} products`);
}

/**
 * Get cached products
 */
export async function getCachedProducts(merchantId = null) {
  await initOfflineDB();

  if (merchantId) {
    return db.getAllFromIndex('products', 'merchantId', merchantId);
  }
  return db.getAll('products');
}

/**
 * Cache orders for offline access
 */
export async function cacheOrders(orders) {
  await initOfflineDB();
  const tx = db.transaction('orders', 'readwrite');

  for (const order of orders) {
    await tx.store.put({
      ...order,
      cachedAt: Date.now(),
      completedAt: order.order_status === 'delivered' ? Date.now() : null
    });
  }

  await tx.done;
  console.log(`[OfflineSync] Cached ${orders.length} orders`);
}

/**
 * Get cached orders
 */
export async function getCachedOrders() {
  await initOfflineDB();
  return db.getAll('orders');
}

/**
 * Save cart for offline
 */
export async function saveCart(items) {
  await initOfflineDB();
  const tx = db.transaction('cart', 'readwrite');
  await tx.store.clear();

  for (const item of items) {
    await tx.store.put(item);
  }

  await tx.done;
}

/**
 * Get offline cart
 */
export async function getOfflineCart() {
  await initOfflineDB();
  return db.getAll('cart');
}

/**
 * Cleanup old cached data when storage is running low
 */
export async function cleanupStorage() {
  try {
    // Check storage usage
    if (!navigator.storage || !navigator.storage.estimate) {
      console.log('[OfflineSync] Storage API not available');
      return;
    }

    const { usage, quota } = await navigator.storage.estimate();
    const percentUsed = usage / quota;
    const usageMB = (usage / 1024 / 1024).toFixed(2);
    const quotaMB = (quota / 1024 / 1024).toFixed(2);

    console.log(`[OfflineSync] Storage: ${usageMB}MB / ${quotaMB}MB (${(percentUsed * 100).toFixed(1)}%)`);

    if (percentUsed > STORAGE_CLEANUP_THRESHOLD) {
      console.log('[OfflineSync] Storage threshold exceeded, cleaning up...');
      await initOfflineDB();

      // Delete old cached products (older than 7 days)
      const productCutoff = Date.now() - (PRODUCT_CACHE_DAYS * 24 * 60 * 60 * 1000);
      const oldProducts = await db.getAllFromIndex('products', 'cachedAt');
      let deletedProducts = 0;

      for (const product of oldProducts) {
        if (product.cachedAt < productCutoff) {
          await db.delete('products', product.id);
          deletedProducts++;
        }
      }

      // Delete old delivered orders (older than 30 days)
      const orderCutoff = Date.now() - (ORDER_HISTORY_DAYS * 24 * 60 * 60 * 1000);
      const orders = await db.getAll('orders');
      let deletedOrders = 0;

      for (const order of orders) {
        if (order.order_status === 'delivered' && order.completedAt && order.completedAt < orderCutoff) {
          await db.delete('orders', order.id);
          deletedOrders++;
        }
      }

      // Delete failed sync requests older than 7 days
      const syncCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const syncRequests = await db.getAll('syncQueue');
      let deletedSync = 0;

      for (const req of syncRequests) {
        if (req.status === 'failed' && req.timestamp < syncCutoff) {
          await db.delete('syncQueue', req.id);
          deletedSync++;
        }
      }

      console.log(`[OfflineSync] Cleanup complete: ${deletedProducts} products, ${deletedOrders} orders, ${deletedSync} sync requests`);
      notifyListeners({ type: 'cleanup', deletedProducts, deletedOrders, deletedSync });
    }
  } catch (error) {
    console.error('[OfflineSync] Cleanup failed:', error);
  }
}

/**
 * Get storage stats
 */
export async function getStorageStats() {
  try {
    await initOfflineDB();

    const stats = {
      products: (await db.getAll('products')).length,
      orders: (await db.getAll('orders')).length,
      pendingSync: (await db.getAllFromIndex('syncQueue', 'status', 'pending')).length,
      failedSync: (await db.getAllFromIndex('syncQueue', 'status', 'failed')).length,
      cartItems: (await db.getAll('cart')).length
    };

    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      stats.usageMB = (usage / 1024 / 1024).toFixed(2);
      stats.quotaMB = (quota / 1024 / 1024).toFixed(2);
      stats.percentUsed = ((usage / quota) * 100).toFixed(1);
    }

    return stats;
  } catch (error) {
    console.error('[OfflineSync] Failed to get storage stats:', error);
    return null;
  }
}

/**
 * Subscribe to sync events
 */
export function onSyncEvent(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

/**
 * Notify all listeners
 */
function notifyListeners(event) {
  listeners.forEach(callback => {
    try {
      callback(event);
    } catch (error) {
      console.error('[OfflineSync] Listener error:', error);
    }
  });
}

/**
 * Force sync now
 */
export async function forceSyncNow() {
  const status = await getNetworkStatus();
  if (!status.connected) {
    console.log('[OfflineSync] Cannot sync - offline');
    return { success: false, reason: 'offline' };
  }

  await processPendingSync();
  return { success: true };
}

/**
 * Clear all offline data (for logout)
 */
export async function clearAllOfflineData() {
  await initOfflineDB();

  await db.clear('syncQueue');
  await db.clear('products');
  await db.clear('orders');
  await db.clear('userProfile');
  await db.clear('cart');

  console.log('[OfflineSync] All offline data cleared');
}

export default {
  initOfflineDB,
  queueRequest,
  processPendingSync,
  getPendingSyncCount,
  getFailedSyncRequests,
  retryFailedRequests,
  cacheProducts,
  getCachedProducts,
  cacheOrders,
  getCachedOrders,
  saveCart,
  getOfflineCart,
  cleanupStorage,
  getStorageStats,
  onSyncEvent,
  forceSyncNow,
  clearAllOfflineData
};
