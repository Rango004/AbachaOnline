/**
 * Service Worker for WeGo Delivery PWA
 * Handles offline support, caching, and background sync
 */

const CACHE_NAME = 'wego-cache-v1';
const TILE_CACHE_NAME = 'wego-tiles-v1';
const SYNC_TAG = 'wego-sync';

// URLs to cache on install
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/main.css',
  '/js/main.js'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/v1\/locations\/geojson/,
  /\/api\/v1\/rider\/routes\/geojson/,
  /\/api\/v1\/rider\/dashboard/
];

// Tile server URLs
const TILE_URLS = [
  /https:\/\/[a-z]\.tile\.openstreetmap\.org\//
];

/**
 * Install event - cache essential files
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app files');
      return cache.addAll(URLS_TO_CACHE);
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== TILE_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  self.clients.claim();
});

/**
 * Fetch event - implement caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('Offline - Request cannot be completed', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
    );
    return;
  }

  // Handle map tile requests - cache with network fallback
  if (isTileRequest(url)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(TILE_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
    );
    return;
  }

  // Handle API requests - network first, cache fallback
  if (isAPIRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((response) => {
            if (response) {
              console.log('[SW] Using cached API response for:', request.url);
              return response;
            }

            // Return offline response
            return new Response(
              JSON.stringify({
                error: 'offline',
                message: 'You are offline. Using cached data where available.'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle other requests - cache first, network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
      );
    })
  );
});

/**
 * Background sync event - sync pending deliveries when online
 */
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncPendingDeliveries());
  }
});

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  if (type === 'CACHE_TILE') {
    // Cache a specific tile
    cacheTile(data.url);
  } else if (type === 'CLEAR_CACHE') {
    // Clear cache
    clearCache(data.cacheName || CACHE_NAME);
  } else if (type === 'GET_CACHE_SIZE') {
    // Get cache size
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ size });
    });
  }
});

/**
 * Helper function to check if request is for tiles
 */
function isTileRequest(url) {
  return TILE_URLS.some((pattern) => pattern.test(url.href));
}

/**
 * Helper function to check if request is for API
 */
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.href));
}

/**
 * Sync pending deliveries
 */
async function syncPendingDeliveries() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    for (const request of keys) {
      if (request.url.includes('/delivery/verify')) {
        try {
          const response = await fetch(request.clone());
          if (response.ok) {
            console.log('[SW] Successfully synced:', request.url);
            await cache.delete(request);
          }
        } catch (error) {
          console.log('[SW] Sync failed for:', request.url, error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

/**
 * Cache a specific tile
 */
async function cacheTile(url) {
  try {
    const cache = await caches.open(TILE_CACHE_NAME);
    const response = await fetch(url);
    if (response && response.status === 200) {
      await cache.put(url, response);
      console.log('[SW] Cached tile:', url);
    }
  } catch (error) {
    console.error('[SW] Error caching tile:', error);
  }
}

/**
 * Clear cache
 */
async function clearCache(cacheName) {
  try {
    await caches.delete(cacheName);
    console.log('[SW] Cleared cache:', cacheName);
  } catch (error) {
    console.error('[SW] Error clearing cache:', error);
  }
}

/**
 * Get total cache size
 */
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error('[SW] Error calculating cache size:', error);
    return 0;
  }
}
