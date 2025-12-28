const db = require('../config/database');

class RiderLocationService {
  /**
   * Update rider's current location
   * Called periodically (every 30 seconds) as rider delivers
   */
  async updateRiderLocation(riderId, orderId, latitude, longitude, accuracy = null, altitude = null, speed = null, heading = null) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Validate coordinates
      if (!this.isValidCoordinate(latitude, longitude)) {
        throw new Error('Invalid latitude or longitude');
      }

      // Insert into location history
      const historyResult = await client.query(
        `INSERT INTO rider_location_history
         (rider_id, order_id, latitude, longitude, accuracy, altitude, speed, heading, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING id, created_at`,
        [riderId, orderId, latitude, longitude, accuracy, altitude, speed, heading]
      );

      // Update or insert current location
      const currentResult = await client.query(
        `INSERT INTO rider_current_location
         (rider_id, order_id, latitude, longitude, accuracy, altitude, speed, heading, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (rider_id) DO UPDATE SET
           order_id = $2,
           latitude = $3,
           longitude = $4,
           accuracy = $5,
           altitude = $6,
           speed = $7,
           heading = $8,
           last_updated = NOW()
         RETURNING *`,
        [riderId, orderId, latitude, longitude, accuracy, altitude, speed, heading]
      );

      await client.query('COMMIT');

      return {
        success: true,
        location_id: historyResult.rows[0].id,
        location: currentResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get rider's current location
   */
  async getRiderCurrentLocation(riderId) {
    try {
      const result = await db.query(
        `SELECT * FROM rider_current_location WHERE rider_id = $1`,
        [riderId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get rider's location history for a specific order or time range
   */
  async getRiderLocationHistory(riderId, orderId = null, limit = 100, offset = 0) {
    try {
      let query = `
        SELECT id, rider_id, order_id, latitude, longitude, accuracy,
               altitude, speed, heading, timestamp, created_at
        FROM rider_location_history
        WHERE rider_id = $1
      `;
      let params = [riderId];

      if (orderId) {
        query += ` AND order_id = $2`;
        params.push(orderId);
      }

      query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate estimated time to arrival (ETA) based on current location and delivery address
   * Uses simple distance-based estimation (not actual routing)
   */
  async calculateETA(riderLocation, deliveryLocation) {
    try {
      // Calculate straight-line distance using Haversine formula
      const distance = this.calculateDistance(
        riderLocation.latitude,
        riderLocation.longitude,
        deliveryLocation.latitude,
        deliveryLocation.longitude
      );

      // Assume average delivery speed of 20 km/h (urban delivery)
      const speedKmH = 20;
      const timeMinutes = Math.ceil((distance / speedKmH) * 60);

      return {
        distance_km: parseFloat(distance.toFixed(2)),
        eta_minutes: timeMinutes,
        estimated_arrival: new Date(Date.now() + timeMinutes * 60000)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get delivery progress for an order (location updates count, timeline)
   */
  async getDeliveryProgress(orderId) {
    try {
      const result = await db.query(
        `SELECT
           o.id,
           o.tracking_number,
           o.order_status,
           o.delivery_address,
           rcl.latitude as rider_latitude,
           rcl.longitude as rider_longitude,
           rcl.accuracy,
           rcl.speed,
           rcl.last_updated,
           COUNT(DISTINCT rlh.id) as total_location_updates,
           MIN(rlh.created_at) as first_update,
           MAX(rlh.created_at) as last_update
         FROM orders o
         LEFT JOIN rider_current_location rcl ON o.rider_id = rcl.rider_id
         LEFT JOIN rider_location_history rlh ON o.id = rlh.order_id
         WHERE o.id = $1
         GROUP BY o.id, rcl.rider_id, rcl.latitude, rcl.longitude, rcl.accuracy, rcl.speed, rcl.last_updated`,
        [orderId]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = result.rows[0];

      return {
        order_id: order.id,
        tracking_number: order.tracking_number,
        status: order.order_status,
        rider_location: order.rider_latitude ? {
          latitude: parseFloat(order.rider_latitude),
          longitude: parseFloat(order.rider_longitude),
          accuracy: order.accuracy,
          speed: order.speed,
          last_updated: order.last_updated
        } : null,
        delivery_address: order.delivery_address,
        location_updates_count: parseInt(order.total_location_updates),
        first_location_update: order.first_update,
        last_location_update: order.last_update
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active riders with their current locations and orders
   */
  async getActiveRidersLocations() {
    try {
      const result = await db.query(`
        SELECT
          u.id as rider_id,
          u.name,
          u.phone,
          rcl.latitude,
          rcl.longitude,
          rcl.accuracy,
          rcl.speed,
          rcl.last_updated,
          rcl.order_id,
          o.tracking_number,
          o.delivery_address,
          o.order_status
        FROM users u
        LEFT JOIN rider_current_location rcl ON u.id = rcl.rider_id
        LEFT JOIN orders o ON rcl.order_id = o.id
        WHERE u.role = 'rider'
          AND rcl.rider_id IS NOT NULL
          AND rcl.last_updated > NOW() - INTERVAL '30 minutes'
        ORDER BY rcl.last_updated DESC
      `);

      return result.rows.map(row => ({
        rider_id: row.rider_id,
        rider_name: row.name,
        rider_phone: row.phone,
        location: {
          latitude: row.latitude ? parseFloat(row.latitude) : null,
          longitude: row.longitude ? parseFloat(row.longitude) : null,
          accuracy: row.accuracy,
          speed: row.speed,
          last_updated: row.last_updated
        },
        current_order: row.order_id ? {
          id: row.order_id,
          tracking_number: row.tracking_number,
          delivery_address: row.delivery_address,
          status: row.order_status
        } : null
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clean up old location history (older than 30 days)
   * Run this periodically via cron job
   */
  async cleanupOldLocationHistory(daysToKeep = 30) {
    try {
      const result = await db.query(
        `DELETE FROM rider_location_history
         WHERE created_at < NOW() - INTERVAL '1 day' * $1
         RETURNING COUNT(*) as deleted_count`,
        [daysToKeep]
      );

      return {
        success: true,
        deleted_count: result.rows[0].deleted_count || 0
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Validate latitude and longitude
   */
  isValidCoordinate(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Helper: Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Helper: Convert degrees to radians
   */
  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = RiderLocationService;
