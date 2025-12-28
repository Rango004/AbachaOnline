/**
 * Tile Cache Service - Manages offline caching of map tiles using IndexedDB
 * Stores OpenStreetMap tiles for offline rendering
 */

class TileCacheService {
  constructor(dbName = 'wego-tiles', storeName = 'tiles', maxSize = 50 * 1024 * 1024) {
    // 50 MB default limit
    this.dbName = dbName;
    this.storeName = storeName;
    this.maxSize = maxSize;
    this.db = null;
    this.currentSize = 0;
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
}

export default TileCacheService;
