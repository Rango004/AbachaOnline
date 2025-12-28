const axios = require('axios');

/**
 * OSRM Routing Service
 * Provides accurate road-based distance calculations
 * Uses public OSRM server (router.project-osrm.org) as fallback
 */
class OSRMRoutingService {
  constructor(options = {}) {
    this.localUrl = options.osrmUrl || 'http://localhost:5000';
    this.publicUrl = 'https://router.project-osrm.org';
    this.osrmUrl = this.localUrl; // Start with local
    this.enabled = options.enabled !== false; // Default enabled
    this.timeout = options.timeout || 10000; // Increased for public server
    this.distanceCache = new Map();
    this.cacheSize = options.cacheSize || 10000;
    this.isAvailable = false;
    this.usingPublic = false;

    // Check OSRM availability on init
    this.checkAvailability();
  }

  /**
   * Check if OSRM server is available (try local first, then public)
   */
  async checkAvailability() {
    if (!this.enabled) return false;

    // Try local OSRM first with a test route
    try {
      // OSRM doesn't have /status endpoint, so test with a simple route
      const testUrl = `${this.localUrl}/route/v1/driving/-12.071,8.112;-12.072,8.113?overview=false`;
      const response = await axios.get(testUrl, {
        timeout: 3000
      });
      if (response.status === 200 && response.data.code === 'Ok') {
        this.osrmUrl = this.localUrl;
        this.isAvailable = true;
        this.usingPublic = false;
        console.log(`[OSRM] Local service available at ${this.localUrl}`);
        return true;
      }
    } catch (error) {
      console.warn(`[OSRM] Local service unavailable at ${this.localUrl}: ${error.message}`);
    }

    // Try public OSRM server
    try {
      // Public server doesn't have /status, test with a simple route
      const testUrl = `${this.publicUrl}/route/v1/driving/-12.071,8.112;-12.072,8.113?overview=false`;
      const response = await axios.get(testUrl, { timeout: 5000 });
      if (response.status === 200 && response.data.code === 'Ok') {
        this.osrmUrl = this.publicUrl;
        this.isAvailable = true;
        this.usingPublic = true;
        console.log(`[OSRM] Using public server at ${this.publicUrl}`);
        return true;
      }
    } catch (error) {
      console.warn(`[OSRM] Public service also unavailable: ${error.message}`);
    }

    this.isAvailable = false;
    console.warn(`[OSRM] No OSRM service available - will use straight lines`);
    return false;
  }

  /**
   * Get cached distance
   */
  getCachedDistance(from, to) {
    const key = `${from[0]},${from[1]}_${to[0]},${to[1]}`;
    return this.distanceCache.get(key);
  }

  /**
   * Cache distance
   */
  cacheDistance(from, to, distance) {
    if (this.distanceCache.size >= this.cacheSize) {
      // Simple LRU: clear oldest 10% when full
      const toDelete = Math.floor(this.cacheSize * 0.1);
      const entries = Array.from(this.distanceCache.entries());
      entries.slice(0, toDelete).forEach(([key]) => {
        this.distanceCache.delete(key);
      });
    }

    const key = `${from[0]},${from[1]}_${to[0]},${to[1]}`;
    this.distanceCache.set(key, distance);
  }

  /**
   * Get distance from OSRM
   * Format: [latitude, longitude]
   * Returns distance in meters
   */
  async getOSRMDistance(from, to) {
    if (!this.isAvailable) {
      return null;
    }

    try {
      // Check cache first
      const cached = this.getCachedDistance(from, to);
      if (cached) {
        return cached;
      }

      // OSRM uses [longitude, latitude] format
      const fromCoords = `${from[1]},${from[0]}`;
      const toCoords = `${to[1]},${to[0]}`;

      const url = `${this.osrmUrl}/route/v1/driving/${fromCoords};${toCoords}`;

      const response = await axios.get(url, {
        params: {
          overview: 'false' // We only need distance, not route geometry
        },
        timeout: this.timeout
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const distance = Math.round(response.data.routes[0].distance);
        this.cacheDistance(from, to, distance);
        return distance;
      }

      return null;
    } catch (error) {
      console.error(`[OSRM] Distance calculation error:`, error.message);
      // If OSRM fails, mark as unavailable
      this.isAvailable = false;
      return null;
    }
  }

  /**
   * Get distance with fallback logic
   * @param {Array} from - [latitude, longitude]
   * @param {Array} to - [latitude, longitude]
   * @param {Function} fallback - Fallback function (e.g., haversine)
   * @returns {number} Distance in meters
   */
  async getDistance(from, to, fallback = null) {
    // Try OSRM first if available
    if (this.isAvailable && this.enabled) {
      const osrmDistance = await this.getOSRMDistance(from, to);
      if (osrmDistance) {
        return osrmDistance;
      }
    }

    // Fall back to provided function
    if (fallback) {
      return fallback(from, to);
    }

    // If no fallback, return null
    return null;
  }

  /**
   * Get multiple distances in batch
   * Useful for distance matrices
   */
  async getMultipleDistances(locations, fallback = null) {
    const distances = [];

    for (let i = 0; i < locations.length; i++) {
      const row = [];
      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          row.push(0);
        } else {
          const distance = await this.getDistance(locations[i], locations[j], fallback);
          row.push(distance || 0);
        }
      }
      distances.push(row);
    }

    return distances;
  }

  /**
   * Check if service is ready
   */
  async isReady() {
    if (this.isAvailable) {
      return true;
    }

    // Try to reconnect
    return await this.checkAvailability();
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache() {
    this.distanceCache.clear();
  }

  /**
   * Get cache stats for monitoring
   */
  getCacheStats() {
    return {
      size: this.distanceCache.size,
      maxSize: this.cacheSize,
      utilization: ((this.distanceCache.size / this.cacheSize) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Get route geometry from OSRM for display on map
   * @param {Array} waypoints - Array of [latitude, longitude] coordinates
   * @returns {Object} - { geometry: [[lon, lat], ...], distance: meters, duration: seconds }
   */
  async getRouteGeometry(waypoints) {
    if (!this.isAvailable || waypoints.length < 2) {
      return null;
    }

    try {
      // OSRM uses [longitude, latitude] format
      const coords = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
      const url = `${this.osrmUrl}/route/v1/driving/${coords}`;

      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson'
        },
        timeout: this.timeout
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          geometry: route.geometry.coordinates, // Already in [lon, lat] format for GeoJSON
          distance: Math.round(route.distance),
          duration: Math.round(route.duration)
        };
      }

      return null;
    } catch (error) {
      console.error(`[OSRM] Route geometry error:`, error.message);
      return null;
    }
  }

  /**
   * Get route geometry with fallback to straight lines
   * @param {Array} waypoints - Array of [latitude, longitude] coordinates
   * @returns {Array} - Array of [lon, lat] coordinates for MapLibre
   */
  async getRouteGeometryWithFallback(waypoints) {
    // Try OSRM first
    const osrmResult = await this.getRouteGeometry(waypoints);
    if (osrmResult && osrmResult.geometry) {
      console.log(`[OSRM] Got road geometry with ${osrmResult.geometry.length} points`);
      return {
        coordinates: osrmResult.geometry,
        distance: osrmResult.distance,
        duration: osrmResult.duration,
        source: 'osrm'
      };
    }

    // Fallback: convert waypoints to [lon, lat] format
    console.log(`[OSRM] Fallback to straight lines`);
    const fallbackCoords = waypoints.map(wp => [wp[1], wp[0]]); // [lat, lon] -> [lon, lat]
    return {
      coordinates: fallbackCoords,
      distance: null,
      duration: null,
      source: 'fallback'
    };
  }
}

module.exports = OSRMRoutingService;
