const OSRM_URL = 'http://localhost:5000';

class OSRMService {
  /**
   * Get route between two coordinates
   */
  async getRoute(startLat, startLng, endLat, endLng) {
    try {
      const url = `${OSRM_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        legs: route.legs
      };
    } catch (error) {
      throw new Error(`OSRM route error: ${error.message}`);
    }
  }

  /**
   * Get distance matrix between multiple points
   */
  async getDistanceMatrix(coordinates) {
    try {
      const coords = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
      const url = `${OSRM_URL}/table/v1/driving/${coords}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok') {
        throw new Error('Distance matrix calculation failed');
      }

      return {
        distances: data.distances,
        durations: data.durations
      };
    } catch (error) {
      throw new Error(`OSRM distance matrix error: ${error.message}`);
    }
  }

  /**
   * Optimize route for multiple deliveries
   */
  async optimizeRoute(startCoord, deliveryCoords) {
    try {
      const allCoords = [startCoord, ...deliveryCoords];
      const coords = allCoords.map(c => `${c.lng},${c.lat}`).join(';');
      
      const url = `${OSRM_URL}/trip/v1/driving/${coords}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.trips || data.trips.length === 0) {
        throw new Error('Route optimization failed');
      }

      const trip = data.trips[0];
      return {
        waypoints: trip.waypoints,
        distance: trip.distance,
        duration: trip.duration,
        geometry: trip.geometry,
        legs: trip.legs
      };
    } catch (error) {
      throw new Error(`OSRM optimization error: ${error.message}`);
    }
  }

  /**
   * Get nearest point on road network
   */
  async snapToRoad(lat, lng) {
    try {
      const url = `${OSRM_URL}/nearest/v1/driving/${lng},${lat}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.waypoints || data.waypoints.length === 0) {
        throw new Error('Snap to road failed');
      }

      const waypoint = data.waypoints[0];
      return {
        lat: waypoint.location[1],
        lng: waypoint.location[0],
        distance: waypoint.distance
      };
    } catch (error) {
      throw new Error(`OSRM snap to road error: ${error.message}`);
    }
  }

  /**
   * Calculate delivery time estimate
   */
  async getDeliveryEstimate(merchantLat, merchantLng, deliveryLat, deliveryLng) {
    try {
      const route = await this.getRoute(merchantLat, merchantLng, deliveryLat, deliveryLng);
      const durationMinutes = Math.ceil(route.duration / 60);
      const distanceKm = (route.distance / 1000).toFixed(2);

      return {
        distance_km: parseFloat(distanceKm),
        duration_minutes: durationMinutes,
        estimated_arrival: new Date(Date.now() + route.duration * 1000)
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OSRMService();
