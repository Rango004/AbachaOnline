/**
 * Tile Cache Service - Manages offline caching of map tiles using IndexedDB
 * Stores OpenStreetMap tiles for offline rendering
 *
 * Enhanced Features:
 * - Intelligent preloading for user's delivery addresses
 * - Route-based tile preloading for riders
 * - Background preloading on WiFi only
 * - Campus area preloading
 */

import { getNetworkStatus } from './NativeBridge';

// Njala University campus bounds (approximate)
const NJALA_CAMPUS_BOUNDS = {
  north: 8.12094,
  south: 8.10478,
  east: -12.06219,
  west: -12.07981
};

// Default zoom levels for different use cases
const ZOOM_LEVELS = {
  overview: 14,
  navigation: 16,
  detail: 17,
  max: 18
};

class TileCacheService {
  constructor(dbName = 'wego-tiles', storeName = 'tiles', maxSize = 50 * 1024 * 1024) {
    // 50 MB default limit
    this.dbName = dbName;
    this.storeName = storeName;
    this.maxSize = maxSize;
    this.db = null;
    this.currentSize = 0;
    this.isPreloading = false;
    this.preloadProgress = { current: 0, total: 0 };
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('[TileCache] Error opening database:', request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('z', 'z', { unique: false });
          console.log('[TileCache] Created object store:', this.storeName);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[TileCache] Database initialized');
        this.calculateSize().then(() => resolve());
      };
    });
  }

  /**
   * Cache a tile blob
   */
  async cacheTile(url, blob, tileCoordinates = {}) {
    if (!this.db) await this.init();

    // Check if size limit would be exceeded
    if (this.currentSize + blob.size > this.maxSize) {
      await this.evictOldestTiles(blob.size);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);

      const tile = {
        url,
        blob,
        timestamp: Date.now(),
        size: blob.size,
        ...tileCoordinates
      };

      const request = store.put(tile);

      request.onerror = () => {
        console.error('[TileCache] Error caching tile:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.currentSize += blob.size;
        console.log('[TileCache] Cached tile:', url, `(${blob.size} bytes)`);
        resolve();
      };
    });
  }

  /**
   * Retrieve a cached tile
   */
  async getTile(url) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(url);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log('[TileCache] Retrieved cached tile:', url);
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Check if tile is cached
   */
  async isCached(url) {
    const tile = await this.getTile(url);
    return tile !== null;
  }

  /**
   * Cache tiles for a specific region (zoom level and bounds)
   */
  async cacheTilesForRegion(bounds, zoomLevel, tileServerUrl = 'https://a.tile.openstreetmap.org') {
    const tilesNeeded = this.getTilesInBounds(bounds, zoomLevel);
    console.log(`[TileCache] Caching ${tilesNeeded.length} tiles for zoom ${zoomLevel}`);

    for (const tile of tilesNeeded) {
      const { x, y, z } = tile;
      const tileUrl = `${tileServerUrl}/${z}/${x}/${y}.png`;

      try {
        const response = await fetch(tileUrl);
        if (response.ok) {
          const blob = await response.blob();
          await this.cacheTile(tileUrl, blob, { x, y, z });
        }
      } catch (error) {
        console.warn(`[TileCache] Error fetching tile ${x},${y},${z}:`, error);
      }

      // Minimal delay to prevent server overload (reduced from 50ms to 10ms for faster loading)
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  /**
   * Calculate tiles needed for region
   * Uses proper Web Mercator projection and Slippy Map tile coordinate system
   * @private
   */
  getTilesInBounds(bounds, z) {
    const tiles = [];

    // Convert lat/lon to Slippy Map tile coordinates using Web Mercator projection
    const latlonToTile = (lat, lon, zoom) => {
      // Web Mercator projection
      const n = Math.pow(2, zoom);

      // X coordinate from longitude
      const x = Math.floor(((lon + 180) / 360) * n);

      // Y coordinate from latitude (inverted)
      const latRad = (lat * Math.PI) / 180;
      const y = Math.floor(
        ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
      );

      return {
        x: Math.max(0, Math.min(n - 1, x)),
        y: Math.max(0, Math.min(n - 1, y)),
        z: zoom
      };
    };

    // Get tile coordinates for all four corners
    const nw = latlonToTile(bounds.north, bounds.west, z);
    const ne = latlonToTile(bounds.north, bounds.east, z);
    const sw = latlonToTile(bounds.south, bounds.west, z);
    const se = latlonToTile(bounds.south, bounds.east, z);

    // Calculate bounds
    const minX = Math.min(nw.x, ne.x, sw.x, se.x);
    const maxX = Math.max(nw.x, ne.x, sw.x, se.x);
    const minY = Math.min(nw.y, ne.y, sw.y, se.y);
    const maxY = Math.max(nw.y, ne.y, sw.y, se.y);

    console.log(`[TileCache] Zoom ${z}: X=${minX}-${maxX}, Y=${minY}-${maxY}, Total tiles=${(maxX - minX + 1) * (maxY - minY + 1)}`);

    // Generate all tiles in the bounded region
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push({ x, y, z });
      }
    }

    return tiles;
  }

  /**
   * Evict oldest tiles to make space
   * @private
   */
  async evictOldestTiles(spaceNeeded) {
    if (!this.db) return;

    console.log(`[TileCache] Need to free ${spaceNeeded} bytes`);

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      let freed = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor && freed < spaceNeeded) {
          const tile = cursor.value;
          freed += tile.size;
          this.currentSize -= tile.size;

          const deleteRequest = store.delete(tile.url);
          deleteRequest.onsuccess = () => {
            console.log(`[TileCache] Deleted tile: ${tile.url} (freed ${tile.size} bytes)`);
            cursor.continue();
          };
        } else {
          console.log(`[TileCache] Freed ${freed} bytes`);
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clear all cached tiles
   */
  async clear() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.currentSize = 0;
        console.log('[TileCache] Cache cleared');
        resolve();
      };
    });
  }

  /**
   * Calculate total cache size
   */
  async calculateSize() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        const tiles = request.result;
        this.currentSize = tiles.reduce((sum, tile) => sum + tile.size, 0);
        console.log(`[TileCache] Total size: ${this.formatBytes(this.currentSize)}`);
        resolve(this.currentSize);
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        const tiles = request.result;
        const size = tiles.reduce((sum, tile) => sum + tile.size, 0);
        const zoomLevels = new Set(tiles.map((t) => t.z)).size;

        resolve({
          tileCount: tiles.length,
          totalSize: size,
          formattedSize: this.formatBytes(size),
          zoomLevels: zoomLevels,
          utilizationPercent: ((size / this.maxSize) * 100).toFixed(1)
        });
      };
    });
  }

  /**
   * Format bytes to human readable
   * @private
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ============================================
  // ENHANCED PRELOADING METHODS
  // ============================================

  /**
   * Preload tiles for user's saved delivery addresses
   * @param {Array} addresses - Array of address objects with latitude/longitude
   */
  async preloadUserArea(addresses) {
    if (!addresses || addresses.length === 0) {
      console.log('[TileCache] No addresses to preload');
      return { success: false, reason: 'no_addresses' };
    }

    // Check network - only preload on WiFi
    try {
      const { connected, connectionType } = await getNetworkStatus();
      if (!connected) {
        console.log('[TileCache] Skipping preload - offline');
        return { success: false, reason: 'offline' };
      }
      if (connectionType !== 'wifi' && connectionType !== 'ethernet') {
        console.log('[TileCache] Skipping preload - not on WiFi');
        return { success: false, reason: 'not_wifi' };
      }
    } catch (err) {
      console.warn('[TileCache] Network check failed, proceeding with preload');
    }

    // Calculate bounds that encompass all addresses
    const bounds = this.calculateBoundsFromAddresses(addresses);
    if (!bounds) {
      console.log('[TileCache] Could not calculate bounds from addresses');
      return { success: false, reason: 'invalid_bounds' };
    }

    console.log('[TileCache] Preloading tiles for user addresses area');
    this.isPreloading = true;

    try {
      // Preload at multiple zoom levels for different use cases
      for (const zoom of [ZOOM_LEVELS.overview, ZOOM_LEVELS.navigation, ZOOM_LEVELS.detail]) {
        await this.cacheTilesForRegion(bounds, zoom);
      }

      return { success: true, bounds };
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Calculate bounds from array of addresses with coordinates
   * @private
   */
  calculateBoundsFromAddresses(addresses) {
    const validAddresses = addresses.filter(
      a => a.latitude && a.longitude &&
           !isNaN(parseFloat(a.latitude)) &&
           !isNaN(parseFloat(a.longitude))
    );

    if (validAddresses.length === 0) return null;

    let north = -90, south = 90, east = -180, west = 180;

    for (const addr of validAddresses) {
      const lat = parseFloat(addr.latitude);
      const lon = parseFloat(addr.longitude);

      north = Math.max(north, lat);
      south = Math.min(south, lat);
      east = Math.max(east, lon);
      west = Math.min(west, lon);
    }

    // Add padding around the bounds (approximately 500 meters)
    const padding = 0.005;
    return {
      north: north + padding,
      south: south - padding,
      east: east + padding,
      west: west - padding
    };
  }

  /**
   * Preload tiles along a delivery route
   * @param {Object} route - Route object with coordinates array
   */
  async preloadDeliveryRoute(route) {
    if (!route || !route.coordinates || route.coordinates.length < 2) {
      console.log('[TileCache] Invalid route for preloading');
      return { success: false, reason: 'invalid_route' };
    }

    // Check network
    try {
      const { connected } = await getNetworkStatus();
      if (!connected) {
        return { success: false, reason: 'offline' };
      }
    } catch (err) {
      // Continue anyway
    }

    const bounds = this.calculateRouteBounds(route.coordinates);
    if (!bounds) {
      return { success: false, reason: 'invalid_bounds' };
    }

    console.log('[TileCache] Preloading tiles for delivery route');
    this.isPreloading = true;

    try {
      // For routes, we primarily need navigation-level zoom
      await this.cacheTilesForRegion(bounds, ZOOM_LEVELS.navigation);
      return { success: true, bounds };
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Calculate bounds from route coordinates
   * @private
   */
  calculateRouteBounds(coordinates) {
    if (!coordinates || coordinates.length === 0) return null;

    let north = -90, south = 90, east = -180, west = 180;

    for (const coord of coordinates) {
      // Handle different coordinate formats: [lat, lon], [lon, lat], or {lat, lon}
      let lat, lon;
      if (Array.isArray(coord)) {
        // Assume [lat, lon] format (Leaflet style)
        lat = coord[0];
        lon = coord[1];
      } else if (coord.lat !== undefined && coord.lng !== undefined) {
        lat = coord.lat;
        lon = coord.lng;
      } else if (coord.latitude !== undefined && coord.longitude !== undefined) {
        lat = coord.latitude;
        lon = coord.longitude;
      } else {
        continue;
      }

      if (isNaN(lat) || isNaN(lon)) continue;

      north = Math.max(north, lat);
      south = Math.min(south, lat);
      east = Math.max(east, lon);
      west = Math.min(west, lon);
    }

    // Add padding for route context
    const padding = 0.002;
    return {
      north: north + padding,
      south: south - padding,
      east: east + padding,
      west: west - padding
    };
  }

  /**
   * Background preload of the entire campus area
   * Only runs on WiFi to conserve mobile data
   * @param {Function} onProgress - Optional callback for progress updates
   */
  async backgroundPreloadCampus(onProgress = null) {
    // Check network - only on WiFi
    try {
      const { connected, connectionType } = await getNetworkStatus();
      if (!connected) {
        console.log('[TileCache] Skipping campus preload - offline');
        return { success: false, reason: 'offline' };
      }
      if (connectionType !== 'wifi' && connectionType !== 'ethernet') {
        console.log('[TileCache] Skipping campus preload - not on WiFi (using ' + connectionType + ')');
        return { success: false, reason: 'not_wifi' };
      }
    } catch (err) {
      console.warn('[TileCache] Network check failed');
      return { success: false, reason: 'network_error' };
    }

    // Check battery level if available
    try {
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        if (battery.level < 0.2 && !battery.charging) {
          console.log('[TileCache] Skipping campus preload - low battery');
          return { success: false, reason: 'low_battery' };
        }
      }
    } catch (err) {
      // Battery API not available, continue anyway
    }

    console.log('[TileCache] Starting background campus preload...');
    this.isPreloading = true;

    try {
      // Calculate total tiles for progress tracking
      let totalTiles = 0;
      const zoomLevels = [ZOOM_LEVELS.overview, 15, ZOOM_LEVELS.navigation];

      for (const zoom of zoomLevels) {
        const tiles = this.getTilesInBounds(NJALA_CAMPUS_BOUNDS, zoom);
        totalTiles += tiles.length;
      }

      this.preloadProgress = { current: 0, total: totalTiles };

      // Preload at multiple zoom levels
      for (const zoom of zoomLevels) {
        await this.cacheTilesForRegionWithProgress(NJALA_CAMPUS_BOUNDS, zoom, (current, total) => {
          this.preloadProgress.current++;
          if (onProgress) {
            onProgress(this.preloadProgress.current, this.preloadProgress.total);
          }
        });
      }

      const stats = await this.getStats();
      console.log(`[TileCache] Campus preload complete: ${stats.tileCount} tiles, ${stats.formattedSize}`);

      return {
        success: true,
        tilesLoaded: totalTiles,
        cacheSize: stats.formattedSize
      };
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Cache tiles with progress callback
   * @private
   */
  async cacheTilesForRegionWithProgress(bounds, zoomLevel, onTileProgress, tileServerUrl = 'https://a.tile.openstreetmap.org') {
    const tilesNeeded = this.getTilesInBounds(bounds, zoomLevel);
    console.log(`[TileCache] Caching ${tilesNeeded.length} tiles for zoom ${zoomLevel}`);

    let cached = 0;
    for (const tile of tilesNeeded) {
      const { x, y, z } = tile;
      const tileUrl = `${tileServerUrl}/${z}/${x}/${y}.png`;

      // Check if already cached
      const existing = await this.getTile(tileUrl);
      if (existing) {
        cached++;
        if (onTileProgress) onTileProgress(cached, tilesNeeded.length);
        continue;
      }

      try {
        const response = await fetch(tileUrl);
        if (response.ok) {
          const blob = await response.blob();
          await this.cacheTile(tileUrl, blob, { x, y, z });
        }
      } catch (error) {
        console.warn(`[TileCache] Error fetching tile ${x},${y},${z}:`, error);
      }

      cached++;
      if (onTileProgress) onTileProgress(cached, tilesNeeded.length);

      // Small delay to prevent server overload
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  /**
   * Get preload progress
   */
  getPreloadProgress() {
    return {
      isPreloading: this.isPreloading,
      ...this.preloadProgress
    };
  }

  /**
   * Cancel ongoing preload (sets flag, actual cancellation is graceful)
   */
  cancelPreload() {
    if (this.isPreloading) {
      this.isPreloading = false;
      console.log('[TileCache] Preload cancelled');
    }
  }

  /**
   * Check if a location is within the cached campus area
   */
  isLocationInCampus(lat, lon) {
    return (
      lat >= NJALA_CAMPUS_BOUNDS.south &&
      lat <= NJALA_CAMPUS_BOUNDS.north &&
      lon >= NJALA_CAMPUS_BOUNDS.west &&
      lon <= NJALA_CAMPUS_BOUNDS.east
    );
  }
}

// Export singleton instance for easy use
const tileCacheService = new TileCacheService();

export default tileCacheService;

// Also export the class for testing or custom instances
export { TileCacheService, NJALA_CAMPUS_BOUNDS, ZOOM_LEVELS };
