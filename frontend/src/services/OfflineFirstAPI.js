/**
 * OfflineFirstAPI - Wrapper around api.js with offline-first behavior
 *
 * Features:
 * - GET requests: Try cache first when offline, fetch from server when online
 * - POST/PUT/DELETE: Queue operations when offline with optimistic responses
 * - Automatic retry with exponential backoff
 * - Priority-based queuing (high, normal, low)
 * - Seamless integration with existing api.js
 */

import api from './api';
import OfflineSync from './OfflineSyncService';
import { getNetworkStatus } from './NativeBridge';

/**
 * Exponential backoff calculator
 */
function getRetryDelay(retries) {
  return Math.min(1000 * Math.pow(2, retries), 30000); // Max 30 seconds
}

/**
 * Wrapper for GET requests with cache fallback
 */
export async function get(endpoint, options = {}) {
  const { connected } = await getNetworkStatus();

  if (!connected) {
    // Try to get from cache when offline
    console.log(`[OfflineAPI] Offline GET ${endpoint} - checking cache`);

    const cached = await getCachedData(endpoint);
    if (cached) {
      console.log(`[OfflineAPI] Returning cached data for ${endpoint}`);
      return { data: cached, fromCache: true };
    }

    throw new Error('Offline and no cached data available');
  }

  // Online - fetch and cache
  try {
    const result = await api.get(endpoint, options);

    // Cache the response
    await cacheData(endpoint, result.data);

    return result;
  } catch (error) {
    // If request fails, try cache as fallback
    const cached = await getCachedData(endpoint);
    if (cached) {
      console.warn(`[OfflineAPI] GET ${endpoint} failed, returning cached data`);
      return { data: cached, fromCache: true, error: error.message };
    }
    throw error;
  }
}

/**
 * Wrapper for POST requests with offline queuing
 */
export async function post(endpoint, body, options = {}) {
  const { connected } = await getNetworkStatus();

  if (!connected) {
    // Queue for later sync
    console.log(`[OfflineAPI] Offline POST ${endpoint} - queuing request`);

    const queueId = await OfflineSync.queueRequest(
      endpoint,
      'POST',
      body,
      {
        ...options,
        priority: options.priority || 'high',
        type: options.type || 'api'
      }
    );

    // Return optimistic response
    return {
      data: {
        success: true,
        queued: true,
        queueId,
        ...body
      },
      fromQueue: true
    };
  }

  // Online - execute immediately
  try {
    return await api.post(endpoint, body, options);
  } catch (error) {
    // If request fails but looks like network issue, queue it
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      console.warn(`[OfflineAPI] POST ${endpoint} failed, queuing...`);

      const queueId = await OfflineSync.queueRequest(
        endpoint,
        'POST',
        body,
        {
          ...options,
          priority: options.priority || 'high'
        }
      );

      return {
        data: {
          success: true,
          queued: true,
          queueId,
          ...body
        },
        fromQueue: true
      };
    }

    throw error;
  }
}

/**
 * Wrapper for PUT requests with offline queuing
 */
export async function put(endpoint, body, options = {}) {
  const { connected } = await getNetworkStatus();

  if (!connected) {
    console.log(`[OfflineAPI] Offline PUT ${endpoint} - queuing request`);

    const queueId = await OfflineSync.queueRequest(
      endpoint,
      'PUT',
      body,
      {
        ...options,
        priority: options.priority || 'normal'
      }
    );

    return {
      data: {
        success: true,
        queued: true,
        queueId,
        ...body
      },
      fromQueue: true
    };
  }

  // Online - execute immediately
  try {
    return await api.put(endpoint, body, options);
  } catch (error) {
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      console.warn(`[OfflineAPI] PUT ${endpoint} failed, queuing...`);

      const queueId = await OfflineSync.queueRequest(
        endpoint,
        'PUT',
        body,
        {
          ...options,
          priority: options.priority || 'normal'
        }
      );

      return {
        data: {
          success: true,
          queued: true,
          queueId,
          ...body
        },
        fromQueue: true
      };
    }

    throw error;
  }
}

/**
 * Wrapper for PATCH requests with offline queuing
 */
export async function patch(endpoint, body, options = {}) {
  const { connected } = await getNetworkStatus();

  if (!connected) {
    console.log(`[OfflineAPI] Offline PATCH ${endpoint} - queuing request`);

    const queueId = await OfflineSync.queueRequest(
      endpoint,
      'PATCH',
      body,
      {
        ...options,
        priority: options.priority || 'normal'
      }
    );

    return {
      data: {
        success: true,
        queued: true,
        queueId,
        ...body
      },
      fromQueue: true
    };
  }

  // Online - execute immediately
  try {
    return await api.patch(endpoint, body, options);
  } catch (error) {
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      console.warn(`[OfflineAPI] PATCH ${endpoint} failed, queuing...`);

      const queueId = await OfflineSync.queueRequest(
        endpoint,
        'PATCH',
        body,
        {
          ...options,
          priority: options.priority || 'normal'
        }
      );

      return {
        data: {
          success: true,
          queued: true,
          queueId,
          ...body
        },
        fromQueue: true
      };
    }

    throw error;
  }
}

/**
 * Wrapper for DELETE requests with offline queuing
 */
export async function del(endpoint, options = {}) {
  const { connected } = await getNetworkStatus();

  if (!connected) {
    console.log(`[OfflineAPI] Offline DELETE ${endpoint} - queuing request`);

    const queueId = await OfflineSync.queueRequest(
      endpoint,
      'DELETE',
      null,
      {
        ...options,
        priority: options.priority || 'normal'
      }
    );

    return {
      data: {
        success: true,
        queued: true,
        queueId
      },
      fromQueue: true
    };
  }

  // Online - execute immediately
  try {
    return await api.delete(endpoint, options);
  } catch (error) {
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      console.warn(`[OfflineAPI] DELETE ${endpoint} failed, queuing...`);

      const queueId = await OfflineSync.queueRequest(
        endpoint,
        'DELETE',
        null,
        {
          ...options,
          priority: options.priority || 'normal'
        }
      );

      return {
        data: {
          success: true,
          queued: true,
          queueId
        },
        fromQueue: true
      };
    }

    throw error;
  }
}

/**
 * Cache data for an endpoint
 */
async function cacheData(endpoint, data) {
  try {
    await OfflineSync.initOfflineDB();

    // Determine what type of data this is and cache accordingly
    if (endpoint.includes('/products')) {
      if (Array.isArray(data)) {
        await OfflineSync.cacheProducts(data);
      } else if (data.products) {
        await OfflineSync.cacheProducts(data.products);
      }
    } else if (endpoint.includes('/orders')) {
      if (Array.isArray(data)) {
        await OfflineSync.cacheOrders(data);
      } else if (data.orders) {
        await OfflineSync.cacheOrders(data.orders);
      }
    } else if (endpoint.includes('/menu')) {
      const merchantId = extractMerchantId(endpoint);
      if (merchantId) {
        await OfflineSync.cacheMenu(merchantId, data);
      }
    }
    // Add more endpoint-specific caching as needed

  } catch (error) {
    console.error('[OfflineAPI] Failed to cache data:', error);
  }
}

/**
 * Get cached data for an endpoint
 */
async function getCachedData(endpoint) {
  try {
    await OfflineSync.initOfflineDB();

    if (endpoint.includes('/products')) {
      const merchantId = extractMerchantId(endpoint);
      const products = await OfflineSync.getCachedProducts(merchantId);
      return products.length > 0 ? products : null;
    } else if (endpoint.includes('/orders')) {
      const orders = await OfflineSync.getCachedOrders();
      return orders.length > 0 ? orders : null;
    } else if (endpoint.includes('/menu')) {
      const merchantId = extractMerchantId(endpoint);
      if (merchantId) {
        const menu = await OfflineSync.getCachedMenu(merchantId);
        return menu ? menu.menuData : null;
      }
    } else if (endpoint.includes('/cart')) {
      const cart = await OfflineSync.getOfflineCart();
      return cart.length > 0 ? cart : null;
    }

    return null;
  } catch (error) {
    console.error('[OfflineAPI] Failed to get cached data:', error);
    return null;
  }
}

/**
 * Extract merchant ID from endpoint
 */
function extractMerchantId(endpoint) {
  const match = endpoint.match(/\/merchants?\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Check if response is from offline queue
 */
export function isQueuedResponse(response) {
  return response?.fromQueue === true;
}

/**
 * Check if response is from cache
 */
export function isCachedResponse(response) {
  return response?.fromCache === true;
}

/**
 * Get pending sync count
 */
export async function getPendingSyncCount() {
  return await OfflineSync.getPendingSyncCount();
}

/**
 * Force sync all pending requests
 */
export async function forceSyncNow() {
  return await OfflineSync.forceSyncNow();
}

/**
 * Subscribe to sync events
 */
export function onSyncEvent(callback) {
  return OfflineSync.onSyncEvent(callback);
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  isQueuedResponse,
  isCachedResponse,
  getPendingSyncCount,
  forceSyncNow,
  onSyncEvent
};
