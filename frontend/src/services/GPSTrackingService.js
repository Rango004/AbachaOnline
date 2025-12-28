/**
 * GPS Tracking Service for Riders
 * Handles real-time location tracking, distance calculations, and delivery verification
 */

class GPSTrackingService {
  constructor(options = {}) {
    this.watchId = null;
    this.currentLocation = null;
    this.locationHistory = [];
    this.maxHistoryLength = options.maxHistoryLength || 100;
    this.accuracy = options.accuracy || 10; // Minimum accuracy in meters
    this.timeout = options.timeout || 10000; // Timeout in milliseconds
    this.maximumAge = options.maximumAge || 30000; // Maximum age of cached location
    this.listeners = [];
    this.isTracking = false;
  }

  /**
   * Start continuous GPS tracking
   * @param {Function} onLocationUpdate - Callback when location updates
   * @returns {Promise<boolean>} - True if tracking started
   */
  async startTracking(onLocationUpdate) {
    return new Promise((resolve, reject) => {
      if (this.isTracking) {
        console.warn('[GPSTracking] Tracking already active');
        resolve(true);
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser'));
        return;
      }

      try {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.handleLocationUpdate(position, onLocationUpdate);
            this.isTracking = true;

            // Start watching position
            this.watchId = navigator.geolocation.watchPosition(
              (position) => this.handleLocationUpdate(position, onLocationUpdate),
              (error) => this.handleLocationError(error),
              {
                enableHighAccuracy: true,
                timeout: this.timeout,
                maximumAge: this.maximumAge
              }
            );

            console.log('[GPSTracking] Tracking started, watch ID:', this.watchId);
            resolve(true);
          },
          (error) => {
            console.error('[GPSTracking] Initial position error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: this.timeout,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error('[GPSTracking] Error starting tracking:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop GPS tracking
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('[GPSTracking] Tracking stopped');
    }
  }

  /**
   * Handle location update
   * @private
   */
  handleLocationUpdate(position, callback) {
    const { latitude, longitude, accuracy, heading, speed } = position.coords;
    const timestamp = position.timestamp;

    // Check if accuracy meets minimum requirement
    if (accuracy > this.accuracy) {
      console.warn(`[GPSTracking] Accuracy ${accuracy}m exceeds threshold ${this.accuracy}m`);
      // Still process but with lower confidence
    }

    this.currentLocation = {
      lat: latitude,
      lon: longitude,
      accuracy: accuracy,
      heading: heading, // Direction in degrees 0-360
      speed: speed, // Speed in m/s
      timestamp: timestamp,
      datetime: new Date(timestamp)
    };

    // Add to history
    this.addToHistory(this.currentLocation);

    // Notify listeners
    if (callback) {
      callback(this.currentLocation);
    }

    this.listeners.forEach(listener => listener(this.currentLocation));
  }

  /**
   * Handle location errors
   * @private
   */
  handleLocationError(error) {
    const errorMessages = {
      1: 'Permission denied - User rejected location permission',
      2: 'Position unavailable - Unable to retrieve location',
      3: 'Timeout - Location request took too long'
    };

    console.error(`[GPSTracking] Error (${error.code}):`, errorMessages[error.code] || error.message);

    // Continue tracking despite errors
  }

  /**
   * Add location to history
   * @private
   */
  addToHistory(location) {
    this.locationHistory.push(location);

    // Keep history size manageable
    if (this.locationHistory.length > this.maxHistoryLength) {
      this.locationHistory.shift();
    }
  }

  /**
   * Subscribe to location updates
   * @param {Function} callback - Called on each location update
   * @returns {Function} - Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Get current location
   * @returns {Object|null} - Current location or null if not available
   */
  getCurrentLocation() {
    return this.currentLocation;
  }

  /**
   * Get location history
   * @returns {Array} - Array of historical locations
   */
  getLocationHistory() {
    return [...this.locationHistory];
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {Array} coord1 - [lat, lon]
   * @param {Array} coord2 - [lat, lon]
   * @returns {number} - Distance in meters
   */
  static calculateDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Calculate distance from current location to target
   * @param {Array} targetCoord - [lat, lon]
   * @returns {number|null} - Distance in meters or null if no current location
   */
  getDistanceToTarget(targetCoord) {
    if (!this.currentLocation) return null;

    const currentCoord = [this.currentLocation.lat, this.currentLocation.lon];
    return GPSTrackingService.calculateDistance(currentCoord, targetCoord);
  }

  /**
   * Estimate ETA to target based on current speed
   * @param {Array} targetCoord - [lat, lon]
   * @returns {object|null} - { minutes: number, confidence: string } or null
   */
  estimateETA(targetCoord) {
    if (!this.currentLocation || !this.currentLocation.speed) {
      return null;
    }

    const distanceM = this.getDistanceToTarget(targetCoord);
    if (distanceM === null) return null;

    // If speed is 0, estimate 1 m/s
    const speed = this.currentLocation.speed || 1;
    const timeSeconds = distanceM / speed;
    const minutes = Math.ceil(timeSeconds / 60);

    return {
      minutes,
      distanceM,
      confidence: this.currentLocation.accuracy <= 20 ? 'high' : 'low'
    };
  }

  /**
   * Verify delivery location (check if within radius)
   * @param {Array} deliveryCoord - [lat, lon]
   * @param {number} radiusMeters - Acceptable delivery radius
   * @returns {object} - { verified: boolean, distance: number }
   */
  verifyDeliveryLocation(deliveryCoord, radiusMeters = 50) {
    if (!this.currentLocation) {
      return { verified: false, distance: null, reason: 'No GPS location available' };
    }

    const distance = this.getDistanceToTarget(deliveryCoord);

    return {
      verified: distance <= radiusMeters,
      distance: distance,
      withinRadius: radiusMeters,
      currentAccuracy: this.currentLocation.accuracy,
      reason: distance <= radiusMeters ? 'Within delivery zone' : `Outside delivery zone (${Math.round(distance)}m away)`
    };
  }

  /**
   * Calculate total distance traveled
   * @returns {number} - Distance in meters
   */
  getTotalDistanceTraveled() {
    if (this.locationHistory.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < this.locationHistory.length; i++) {
      const prev = this.locationHistory[i - 1];
      const curr = this.locationHistory[i];

      const distance = GPSTrackingService.calculateDistance(
        [prev.lat, prev.lon],
        [curr.lat, curr.lon]
      );

      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Get average speed in m/s from history
   * @returns {number|null} - Average speed or null
   */
  getAverageSpeed() {
    if (this.locationHistory.length < 2) return null;

    const firstLocation = this.locationHistory[0];
    const lastLocation = this.locationHistory[this.locationHistory.length - 1];

    const distanceM = this.getTotalDistanceTraveled();
    const timeSeconds = (lastLocation.timestamp - firstLocation.timestamp) / 1000;

    return timeSeconds > 0 ? distanceM / timeSeconds : null;
  }

  /**
   * Clear location history
   */
  clearHistory() {
    this.locationHistory = [];
  }

  /**
   * Export location data for persistence
   * @returns {object} - Exportable location data
   */
  export() {
    return {
      currentLocation: this.currentLocation,
      locationHistory: this.locationHistory,
      totalDistance: this.getTotalDistanceTraveled(),
      averageSpeed: this.getAverageSpeed(),
      sessionStart: this.locationHistory.length > 0 ? this.locationHistory[0].datetime : null,
      sessionEnd: this.currentLocation ? this.currentLocation.datetime : null
    };
  }

  /**
   * Check if tracking is active
   * @returns {boolean}
   */
  isActive() {
    return this.isTracking;
  }

  /**
   * Get tracking status
   * @returns {object} - Status information
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      hasLocation: this.currentLocation !== null,
      currentLocation: this.currentLocation,
      historyLength: this.locationHistory.length,
      totalDistance: this.getTotalDistanceTraveled(),
      averageSpeed: this.getAverageSpeed()
    };
  }
}

export default GPSTrackingService;
