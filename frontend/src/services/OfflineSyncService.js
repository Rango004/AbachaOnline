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
const DB_VERSION = 2; // Upgraded for new object stores

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

      // Messages for offline chat
      if (!database.objectStoreNames.contains('messages')) {
        const messageStore = database.createObjectStore('messages', {
          keyPath: 'id',
          autoIncrement: true
        });
        messageStore.createIndex('conversationId', 'conversation_id');
        messageStore.createIndex('timestamp', 'timestamp');
        messageStore.createIndex('syncStatus', 'syncStatus'); // 'pending', 'synced', 'failed'
        messageStore.createIndex('clientUuid', 'clientUuid'); // For deduplication
      }

      // Image cache (Cloudinary images as blobs)
      if (!database.objectStoreNames.contains('imageCache')) {
        const imgStore = database.createObjectStore('imageCache', { keyPath: 'url' });
        imgStore.createIndex('cachedAt', 'cachedAt');
        imgStore.createIndex('size', 'size');
      }

      // Merchant menus
      if (!database.objectStoreNames.contains('menus')) {
        const menuStore = database.createObjectStore('menus', { keyPath: 'merchantId' });
        menuStore.createIndex('cachedAt', 'cachedAt');
      }

      // Delivery addresses
      if (!database.objectStoreNames.contains('addresses')) {
        const addrStore = database.createObjectStore('addresses', { keyPath: 'id' });
        addrStore.createIndex('userId', 'user_id');
        addrStore.createIndex('isDefault', 'is_default');
      }

      // Wishlist
      if (!database.objectStoreNames.contains('wishlist')) {
        const wishStore = database.createObjectStore('wishlist', { keyPath: 'productId' });
        wishStore.createIndex('userId', 'user_id');
        wishStore.createIndex('cachedAt', 'cachedAt');
      }

      // Conflicts (for manual resolution)
      if (!database.objectStoreNames.contains('conflicts')) {
        const conflictStore = database.createObjectStore('conflicts', {
          keyPath: 'id',
          autoIncrement: true
        });
        conflictStore.createIndex('timestamp', 'timestamp');
        conflictStore.createIndex('resolved', 'resolved');
        conflictStore.createIndex('type', 'type');
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
    type: options.type || 'api', // 'api', 'order', 'profile'
    metadata: options.metadata || null // For tracking/display purposes
  };

  const id = await db.add('syncQueue', request);
  console.log(`[OfflineSync] Queued request #${id}: ${method} ${url}`, options.metadata || '');

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
        // Construct full URL with API base
        const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
        const baseURL = `${API_BASE}/api/v1`;
        const fullUrl = req.url.startsWith('http') ? req.url : `${baseURL}${req.url}`;

        // Get auth token
        const token = localStorage.getItem('token');

        const response = await fetch(fullUrl, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
  try {
    await initOfflineDB();

    if (!products || products.length === 0) {
      console.log('[OfflineSync] No products to cache');
      return;
    }

    const tx = db.transaction('products', 'readwrite');
    let cachedCount = 0;

    for (const product of products) {
      // Handle both id and product_id (API may return either)
      const productId = product.id || product.product_id;
      if (!productId) {
        console.warn('[OfflineSync] Skipping product without id:', product.name || 'unknown');
        continue;
      }

      try {
        await tx.store.put({
          ...product,
          id: productId, // Ensure id is set for keyPath (use product_id if id is missing)
          product_id: productId, // Also ensure product_id is set for consistency
          cachedAt: Date.now()
        });
        cachedCount++;
      } catch (productError) {
        console.error('[OfflineSync] Failed to cache product:', productId, productError.message);
      }
    }

    await tx.done;
    console.log(`[OfflineSync] Cached ${cachedCount}/${products.length} products`);
  } catch (error) {
    console.error('[OfflineSync] Failed to cache products:', error.message);
  }
}

/**
 * Get cached products
 */
export async function getCachedProducts(merchantId = null) {
  try {
    await initOfflineDB();

    if (!db) {
      console.error('[OfflineSync] Database not initialized');
      return [];
    }

    let products;
    if (merchantId) {
      products = await db.getAllFromIndex('products', 'merchantId', merchantId);
    } else {
      products = await db.getAll('products');
    }

    console.log(`[OfflineSync] Retrieved ${products?.length || 0} cached products from IndexedDB`);

    // Debug: Log first product to verify structure
    if (products && products.length > 0) {
      console.log('[OfflineSync] Sample cached product:', {
        id: products[0].id,
        product_id: products[0].product_id,
        name: products[0].name,
        cachedAt: products[0].cachedAt
      });
    }

    return products || [];
  } catch (error) {
    console.error('[OfflineSync] Failed to get cached products:', error.message, error);
    return [];
  }
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
 * ========================================
 * IMAGE CACHING METHODS
 * ========================================
 */

/**
 * Batch cache product images
 */
export async function cacheProductImages(products) {
  if (!Array.isArray(products)) return;

  let cachedCount = 0;
  for (const product of products) {
    if (product.images && Array.isArray(product.images)) {
      for (const imageUrl of product.images) {
        try {
          await cacheImage(imageUrl);
          cachedCount++;
        } catch (error) {
          console.warn(`[OfflineSync] Failed to cache image ${imageUrl}:`, error.message);
        }
      }
    }
  }

  console.log(`[OfflineSync] Cached ${cachedCount} product images`);
}

/**
 * ========================================
 * MESSAGE QUEUING METHODS
 * ========================================
 */

/**
 * Queue a message for offline chat
 */
export async function queueMessage(conversationId, messageData) {
  await initOfflineDB();

  const message = {
    conversation_id: conversationId,
    ...messageData,
    syncStatus: 'pending',
    timestamp: messageData.timestamp || Date.now(),
    clientUuid: messageData.clientUuid || `msg_${Date.now()}_${Math.random()}`
  };

  const id = await db.add('messages', message);
  console.log(`[OfflineSync] Queued message #${id} for conversation ${conversationId}`);

  notifyListeners({ type: 'messageQueued', id, message });

  return id;
}

/**
 * Get cached messages for a conversation
 */
export async function getCachedMessages(conversationId) {
  await initOfflineDB();
  return db.getAllFromIndex('messages', 'conversationId', conversationId);
}

/**
 * Sync pending messages
 */
export async function syncMessages() {
  await initOfflineDB();

  const pendingMessages = await db.getAllFromIndex('messages', 'syncStatus', 'pending');

  if (pendingMessages.length === 0) {
    return { success: true, synced: 0 };
  }

  console.log(`[OfflineSync] Syncing ${pendingMessages.length} messages`);

  let syncedCount = 0;

  for (const message of pendingMessages) {
    try {
      // Will be implemented with OfflineFirstAPI
      // For now, just mark as synced
      await db.put('messages', {
        ...message,
        syncStatus: 'synced'
      });
      syncedCount++;
    } catch (error) {
      console.error(`[OfflineSync] Failed to sync message #${message.id}:`, error);
      await db.put('messages', {
        ...message,
        syncStatus: 'failed'
      });
    }
  }

  return { success: true, synced: syncedCount };
}

/**
 * Cache merchant menu
 */
export async function cacheMenu(merchantId, menuData) {
  await initOfflineDB();

  await db.put('menus', {
    merchantId,
    menuData,
    cachedAt: Date.now()
  });

  console.log(`[OfflineSync] Cached menu for merchant ${merchantId}`);
}

/**
 * Get cached menu
 */
export async function getCachedMenu(merchantId) {
  await initOfflineDB();
  return db.get('menus', merchantId);
}

/**
 * Cache addresses
 */
export async function cacheAddresses(addresses) {
  await initOfflineDB();
  const tx = db.transaction('addresses', 'readwrite');

  for (const address of addresses) {
    await tx.store.put({
      ...address,
      cachedAt: Date.now()
    });
  }

  await tx.done;
  console.log(`[OfflineSync] Cached ${addresses.length} addresses`);
}

/**
 * Get cached addresses
 */
export async function getCachedAddresses(userId) {
  await initOfflineDB();

  if (userId) {
    return db.getAllFromIndex('addresses', 'userId', userId);
  }
  return db.getAll('addresses');
}

/**
 * Cache user profile for offline access
 */
export async function cacheUserProfile(profile) {
  try {
    await initOfflineDB();

    if (!profile || !profile.id) {
      console.log('[OfflineSync] No profile to cache or missing id');
      return;
    }

    await db.put('userProfile', {
      ...profile,
      cachedAt: Date.now()
    });

    console.log(`[OfflineSync] Cached user profile for user ${profile.id}`);
  } catch (error) {
    console.error('[OfflineSync] Failed to cache user profile:', error.message);
  }
}

/**
 * Get cached user profile
 */
export async function getCachedUserProfile(userId) {
  try {
    await initOfflineDB();

    if (userId) {
      return db.get('userProfile', userId);
    }

    // If no userId provided, get the first (and likely only) cached profile
    const profiles = await db.getAll('userProfile');
    return profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('[OfflineSync] Failed to get cached profile:', error.message);
    return null;
  }
}

/**
 * Cache dashboard stats for offline access (merchant, rider, etc.)
 */
export async function cacheDashboardStats(role, stats) {
  try {
    await initOfflineDB();

    // Store in userProfile store with a special key pattern
    const statsKey = `dashboard_${role}`;
    await db.put('userProfile', {
      id: statsKey,
      role,
      stats,
      cachedAt: Date.now()
    });

    console.log(`[OfflineSync] Cached ${role} dashboard stats`);
  } catch (error) {
    console.error('[OfflineSync] Failed to cache dashboard stats:', error.message);
  }
}

/**
 * Get cached dashboard stats
 */
export async function getCachedDashboardStats(role) {
  try {
    await initOfflineDB();

    const statsKey = `dashboard_${role}`;
    const cached = await db.get('userProfile', statsKey);

    if (cached && cached.stats) {
      console.log(`[OfflineSync] Retrieved ${role} dashboard stats from cache`);
      return cached.stats;
    }

    return null;
  } catch (error) {
    console.error('[OfflineSync] Failed to get cached dashboard stats:', error.message);
    return null;
  }
}

/**
 * Cache wishlist
 */
export async function cacheWishlist(items) {
  await initOfflineDB();
  const tx = db.transaction('wishlist', 'readwrite');

  for (const item of items) {
    await tx.store.put({
      ...item,
      cachedAt: Date.now()
    });
  }

  await tx.done;
  console.log(`[OfflineSync] Cached ${items.length} wishlist items`);
}

/**
 * Get cached wishlist
 */
export async function getCachedWishlist(userId) {
  await initOfflineDB();

  if (userId) {
    return db.getAllFromIndex('wishlist', 'userId', userId);
  }
  return db.getAll('wishlist');
}

/**
 * Detect conflict between local and server data
 */
export async function detectConflict(operation, serverData) {
  await initOfflineDB();

  // Get local version based on operation type
  let localData;
  switch (operation.type) {
    case 'cart':
      localData = await getOfflineCart();
      break;
    case 'wishlist':
      localData = await getCachedWishlist(operation.userId);
      break;
    case 'addresses':
      localData = await getCachedAddresses(operation.userId);
      break;
    default:
      return null;
  }

  if (!localData) return null;

  // Check if data differs
  const hasConflict = JSON.stringify(localData) !== JSON.stringify(serverData);

  if (hasConflict) {
    const conflict = {
      type: operation.type,
      local: localData,
      server: serverData,
      timestamp: Date.now(),
      resolved: false,
      canMerge: canMerge(operation.type),
      operationId: operation.id
    };

    const id = await db.add('conflicts', conflict);
    console.log(`[OfflineSync] Conflict detected for ${operation.type}, ID: ${id}`);

    notifyListeners({ type: 'conflict', conflictId: id, conflict });

    return { ...conflict, id };
  }

  return null;
}

/**
 * Check if a data type can be automatically merged
 */
function canMerge(type) {
  // Cart and wishlist can be merged (union of items)
  return ['cart', 'wishlist'].includes(type);
}

/**
 * Resolve a conflict
 */
export async function resolveConflict(conflictId, strategy) {
  await initOfflineDB();

  const conflict = await db.get('conflicts', conflictId);
  if (!conflict) {
    throw new Error(`Conflict ${conflictId} not found`);
  }

  let resolvedData;

  switch (strategy) {
    case 'local':
      resolvedData = conflict.local;
      break;
    case 'server':
      resolvedData = conflict.server;
      break;
    case 'merge':
      if (!conflict.canMerge) {
        throw new Error(`Cannot merge ${conflict.type} conflicts`);
      }
      resolvedData = mergeData(conflict.local, conflict.server, conflict.type);
      break;
    default:
      throw new Error(`Unknown resolution strategy: ${strategy}`);
  }

  // Mark conflict as resolved
  await db.put('conflicts', {
    ...conflict,
    resolved: true,
    resolvedAt: Date.now(),
    strategy,
    resolvedData
  });

  console.log(`[OfflineSync] Resolved conflict #${conflictId} with strategy: ${strategy}`);
  notifyListeners({ type: 'conflictResolved', conflictId, strategy });

  return resolvedData;
}

/**
 * Merge local and server data (for cart and wishlist)
 */
function mergeData(local, server, type) {
  if (type === 'cart' || type === 'wishlist') {
    // Union of items by product ID
    const merged = [...local];
    const localIds = new Set(local.map(item => item.productId || item.product_id));

    for (const serverItem of server) {
      const itemId = serverItem.productId || serverItem.product_id;
      if (!localIds.has(itemId)) {
        merged.push(serverItem);
      }
    }

    return merged;
  }

  // Default: server wins
  return server;
}

/**
 * Get unresolved conflicts
 */
export async function getUnresolvedConflicts() {
  await initOfflineDB();
  // Get all conflicts and filter for unresolved ones
  // Note: Cannot use getAllFromIndex with boolean keys in IndexedDB
  const allConflicts = await db.getAll('conflicts');
  return allConflicts.filter(c => c.resolved === false || c.resolved === undefined);
}

/**
 * Cache an image as a blob in IndexedDB
 * @param {string} imageUrl - The image URL to cache
 * @param {Blob} blob - Optional blob to cache directly (if already fetched)
 */
export async function cacheImage(imageUrl, blob = null) {
  try {
    await initOfflineDB();

    // Check if already cached
    const existing = await db.get('imageCache', imageUrl);
    if (existing) {
      return existing;
    }

    let imageBlob = blob;

    // If blob not provided, fetch it
    if (!imageBlob) {
      try {
        // Try direct fetch first
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        imageBlob = await response.blob();
      } catch (fetchError) {
        // Fallback: Use Image element with canvas conversion for CORS images
        console.warn(`[OfflineSync] Fetch failed, trying canvas method:`, fetchError.message);
        imageBlob = await fetchImageViaCanvas(imageUrl);
        if (!imageBlob) {
          throw new Error('Both fetch methods failed');
        }
      }
    }

    const size = imageBlob.size;

    // Store in IndexedDB
    const cacheEntry = {
      url: imageUrl,
      blob: imageBlob,
      size,
      cachedAt: Date.now(),
      contentType: imageBlob.type
    };

    await db.put('imageCache', cacheEntry);
    console.log(`[OfflineSync] Cached image: ${imageUrl} (${(size / 1024).toFixed(1)}KB)`);

    return cacheEntry;
  } catch (error) {
    console.error(`[OfflineSync] Failed to cache image ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Fetch image using Image element and canvas (for CORS images)
 * @param {string} imageUrl - The image URL
 * @returns {Promise<Blob|null>} - Image blob or null
 */
async function fetchImageViaCanvas(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        console.error('[OfflineSync] Canvas conversion failed:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error('[OfflineSync] Image load failed');
      resolve(null);
    };

    // Start loading
    img.src = imageUrl;
  });
}

/**
 * Get cached image blob URL
 */
export async function getCachedImageUrl(imageUrl) {
  try {
    await initOfflineDB();
    const cached = await db.get('imageCache', imageUrl);

    if (cached && cached.blob) {
      // Create a blob URL for display
      return URL.createObjectURL(cached.blob);
    }

    return null;
  } catch (error) {
    console.error(`[OfflineSync] Failed to get cached image ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Cache multiple images in batch
 */
export async function cacheImages(imageUrls) {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (const url of imageUrls) {
    if (!url) continue;

    try {
      // Check if already cached
      const existing = await db.get('imageCache', url);
      if (existing) {
        results.skipped++;
        continue;
      }

      const cached = await cacheImage(url);
      if (cached) {
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
    }
  }

  console.log(`[OfflineSync] Batch cached images: ${results.success} success, ${results.failed} failed, ${results.skipped} skipped`);
  return results;
}

/**
 * Add optimistic update tracking
 */
export async function addOptimisticUpdate(operation, rollbackData) {
  // Store in memory for now, can be persisted if needed
  const updateId = `opt_${Date.now()}_${Math.random()}`;

  console.log(`[OfflineSync] Optimistic update: ${updateId}`, operation);

  notifyListeners({
    type: 'optimisticUpdate',
    updateId,
    operation,
    rollbackData
  });

  return updateId;
}

/**
 * Rollback optimistic update
 */
export async function rollbackOptimisticUpdate(updateId, rollbackData) {
  console.log(`[OfflineSync] Rolling back optimistic update: ${updateId}`);

  notifyListeners({
    type: 'rollback',
    updateId,
    rollbackData
  });
}

/**
 * Enhanced cleanup with new stores
 */
async function cleanupNewStores() {
  await initOfflineDB();

  const now = Date.now();
  let deletedCount = {
    images: 0,
    messages: 0,
    menus: 0
  };

  // Cleanup old cached images (older than 30 days)
  const imageCutoff = now - (30 * 24 * 60 * 60 * 1000);
  const images = await db.getAll('imageCache');
  for (const img of images) {
    if (img.cachedAt < imageCutoff) {
      await db.delete('imageCache', img.url);
      deletedCount.images++;
    }
  }

  // Cleanup synced messages (older than 30 days)
  const messageCutoff = now - (30 * 24 * 60 * 60 * 1000);
  const messages = await db.getAllFromIndex('messages', 'syncStatus', 'synced');
  for (const msg of messages) {
    if (msg.timestamp < messageCutoff) {
      await db.delete('messages', msg.id);
      deletedCount.messages++;
    }
  }

  // Cleanup old cached menus (older than 7 days)
  const menuCutoff = now - (7 * 24 * 60 * 60 * 1000);
  const menus = await db.getAll('menus');
  for (const menu of menus) {
    if (menu.cachedAt < menuCutoff) {
      await db.delete('menus', menu.merchantId);
      deletedCount.menus++;
    }
  }

  return deletedCount;
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

      // Cleanup new stores
      const newStoreDeleted = await cleanupNewStores();

      console.log(`[OfflineSync] Cleanup complete: ${deletedProducts} products, ${deletedOrders} orders, ${deletedSync} sync requests, ${newStoreDeleted.images} images, ${newStoreDeleted.messages} messages, ${newStoreDeleted.menus} menus`);
      notifyListeners({
        type: 'cleanup',
        deletedProducts,
        deletedOrders,
        deletedSync,
        ...newStoreDeleted
      });
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
  await db.clear('messages');
  await db.clear('imageCache');
  await db.clear('menus');
  await db.clear('addresses');
  await db.clear('wishlist');
  await db.clear('conflicts');

  console.log('[OfflineSync] All offline data cleared');
}

export default {
  // Core
  get db() { return db; }, // Export db as getter for live reference
  initOfflineDB,
  queueRequest,
  processPendingSync,
  getPendingSyncCount,
  getFailedSyncRequests,
  retryFailedRequests,

  // Products & Orders
  cacheProducts,
  getCachedProducts,
  cacheOrders,
  getCachedOrders,

  // Cart
  saveCart,
  getOfflineCart,

  // Images
  cacheImage,
  getCachedImageUrl,
  cacheImages,
  cacheProductImages,

  // Messages
  queueMessage,
  getCachedMessages,
  syncMessages,

  // Menus
  cacheMenu,
  getCachedMenu,

  // Addresses
  cacheAddresses,
  getCachedAddresses,

  // User Profile
  cacheUserProfile,
  getCachedUserProfile,

  // Dashboard Stats
  cacheDashboardStats,
  getCachedDashboardStats,

  // Wishlist
  cacheWishlist,
  getCachedWishlist,

  // Conflicts
  detectConflict,
  resolveConflict,
  getUnresolvedConflicts,

  // Optimistic updates
  addOptimisticUpdate,
  rollbackOptimisticUpdate,

  // Storage & Sync
  cleanupStorage,
  getStorageStats,
  onSyncEvent,
  forceSyncNow,
  clearAllOfflineData
};
