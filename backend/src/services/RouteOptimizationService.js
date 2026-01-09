const db = require('../config/database');
const RouteOptimizer = require('./RouteOptimizer');
const OSRMRoutingService = require('./OSRMRoutingService');

class RouteOptimizationService {
  constructor() {
    // Initialize OSRM routing service for real road distances
    this.osrmService = new OSRMRoutingService({
      osrmUrl: 'http://localhost:5000',
      enabled: true,
      timeout: 5000,
      cacheSize: 10000
    });

    // Default depot location: Mobile Money, Njala University Campus
    // This is a central location from the imported business locations
    this.defaultDepotLocation = [8.11263730, -12.07158430];

    this.optimizer = new RouteOptimizer({
      depotLocation: this.defaultDepotLocation,
      roadMultiplier: 1.3,
      osrmService: this.osrmService,
      useOSRM: true
    });
  }

  /**
   * Get rider's current location or fallback to depot
   * Priority: rider's current GPS > rider's home location > default depot
   */
  async getRiderStartLocation(riderId) {
    try {
      const result = await db.query(`
        SELECT
          latitude as current_lat,
          longitude as current_lng,
          COALESCE(latitude, $2) as start_lat,
          COALESCE(longitude, $3) as start_lng
        FROM users
        WHERE id = $1 AND role = 'rider';
      `, [riderId, this.defaultDepotLocation[0], this.defaultDepotLocation[1]]);

      if (result.rows.length > 0) {
        const rider = result.rows[0];
        const location = [parseFloat(rider.start_lat), parseFloat(rider.start_lng)];

        if (rider.current_lat && rider.current_lng) {
          console.log(`[RouteOptimization] Using rider ${riderId} current GPS location: ${location}`);
        } else {
          console.log(`[RouteOptimization] Using default depot location for rider ${riderId}: ${location}`);
        }

        return location;
      }

      console.log(`[RouteOptimization] Rider ${riderId} not found, using default depot: ${this.defaultDepotLocation}`);
      return this.defaultDepotLocation;
    } catch (error) {
      console.error(`[RouteOptimization] Error getting rider location for ${riderId}:`, error.message);
      return this.defaultDepotLocation;
    }
  }

  /**
   * Optimize routes using pure JavaScript implementation
   * Uses Clarke-Wright Savings Algorithm with Nearest Neighbor fallback
   * @param {Array} orders - Array of orders with customer locations
   * @param {Array} riders - Array of available riders with capacity
   * @param {string} method - Optimization method: 'clarke_wright' (default) or 'nearest_neighbor'
   * @param {Array} depotLocation - [latitude, longitude] of starting point (rider location or depot)
   * @returns {Promise<Object>} - Optimization results
   */
  async optimizeRoutes(orders, riders, method = 'clarke_wright', depotLocation = null) {
    // Use provided depot location or default
    const startLocation = depotLocation || this.defaultDepotLocation;
    try {
      // Format orders for optimizer
      const formattedOrders = orders.map(order => ({
        id: order.id,
        location: [parseFloat(order.latitude), parseFloat(order.longitude)]
      }));

      // DEBUG: Log what coordinates are being used
      console.log('[optimizeRoutes] Input orders with coordinates:');
      formattedOrders.forEach(o => {
        console.log(`  Order ${o.id}: location=${JSON.stringify(o.location)}, latitude_raw=${orders.find(ord => ord.id === o.id).latitude}, longitude_raw=${orders.find(ord => ord.id === o.id).longitude}`);
      });

      // Format riders for optimizer
      const formattedRiders = riders.map(rider => ({
        id: rider.id,
        capacity: rider.capacity || 5
      }));

      // Update optimizer's depot location for this optimization
      this.optimizer.depotLocation = startLocation;
      console.log(`[optimizeRoutes] Using start location: ${startLocation}`);

      // Run JavaScript optimizer with OSRM distance calculations
      const result = await this.optimizer.optimize(formattedOrders, formattedRiders, method);

      return result;

    } catch (error) {
      console.error('Route optimization error:', error);
      return {
        success: false,
        error: error.message,
        routes: []
      };
    }
  }

  /**
   * Fallback route assignment using simple nearest-neighbor (round-robin distribution)
   * This matches the output format of route_optimizer_v2.py
   * @param {Array} orders - Orders to assign
   * @param {Array} riders - Available riders
   * @param {Array} depotLocation - Starting location [lat, lon]
   * @returns {Object} - Simple assignment results in route_optimizer_v2 format
   */
  fallbackRouteAssignment(orders, riders, depotLocation = null) {
    console.log('Using fallback route assignment (nearest-neighbor round-robin)');

    if (!riders || riders.length === 0) {
      return {
        success: false,
        error: 'No available riders',
        routes: [],
        method: 'fallback_nearest_neighbor'
      };
    }

    const startLocation = depotLocation || this.defaultDepotLocation;
    const routes = [];
    const routeMap = new Map();

    // Initialize routes for each rider
    for (const rider of riders) {
      routeMap.set(rider.id, {
        rider_id: rider.id,
        route_coords: [startLocation],
        order_ids: [],
        distance_m: 0,
        num_deliveries: 0,
        capacity_remaining: rider.capacity || 5
      });
    }

    // Distribute orders round-robin across riders
    let riderIndex = 0;
    for (const order of orders) {
      const rider = riders[riderIndex % riders.length];
      const route = routeMap.get(rider.id);

      if (route && route.capacity_remaining > 0) {
        route.order_ids.push(order.id);
        route.route_coords.push([parseFloat(order.latitude), parseFloat(order.longitude)]);
        route.num_deliveries += 1;
        route.capacity_remaining -= 1;

        // Simple distance estimation (1000m per order)
        route.distance_m += 1000;
      }

      riderIndex = (riderIndex + 1) % riders.length;
    }

    // Add depot return to each route
    let totalDistance = 0;
    for (const route of routeMap.values()) {
      route.route_coords.push(startLocation);
      totalDistance += route.distance_m;

      // Remove internal properties not in output format
      delete route.capacity_remaining;
      routes.push(route);
    }

    return {
      success: true,
      method: 'fallback_nearest_neighbor',
      routes: routes,
      total_distance_m: totalDistance
    };
  }

  /**
   * Get ready orders for a merchant with GPS coordinates for route endpoints
   * Only fetches orders that are ready for pickup/delivery
   * Uses locations table for customer GPS data (dormitories, buildings, etc.)
   * Falls back to student_addresses, then user profile location
   * @param {number} merchantId - Merchant ID
   * @returns {Promise<Array>} - Array of ready orders with GPS coordinates
   */
  async getPendingOrders(merchantId) {
    try {
      const result = await db.query(
        `SELECT o.id, o.student_id, o.delivery_address, o.total_amount,
                o.created_at, o.tracking_number,
                COALESCE(l.latitude, l2.latitude, u.latitude) as latitude,
                COALESCE(l.longitude, l2.longitude, u.longitude) as longitude,
                COALESCE(l.name, l2.name, '') as location_name,
                u.name as customer_name, u.phone as customer_phone
         FROM orders o
         LEFT JOIN users u ON o.student_id = u.id
         LEFT JOIN locations l ON u.location_id = l.id
         LEFT JOIN student_addresses sa ON o.delivery_address = sa.address_label
                                        AND sa.student_id = o.student_id
         LEFT JOIN locations l2 ON sa.location_id = l2.id
         WHERE o.merchant_id = $1
           AND o.order_status = 'ready'
           AND o.rider_id IS NULL
           AND (COALESCE(l.latitude, l2.latitude, u.latitude) IS NOT NULL)
           AND (COALESCE(l.longitude, l2.longitude, u.longitude) IS NOT NULL)
         ORDER BY o.created_at ASC`,
        [merchantId]
      );

      console.log(`Fetched ${result.rows.length} ready orders with GPS coordinates for merchant ${merchantId}`);
      return result.rows;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  }

  /**
   * Get available riders with capacity and GPS coordinates for route start points
   * @param {number} limit - Maximum number of riders to retrieve
   * @returns {Promise<Array>} - Array of available riders with GPS data
   */
  async getAvailableRiders(limit = 10) {
    try {
      const result = await db.query(
        `SELECT u.id, u.name, u.phone,
                u.latitude, u.longitude,
                COUNT(o.id) as active_deliveries,
                5 as capacity
         FROM users u
         LEFT JOIN orders o ON u.id = o.rider_id
                            AND o.order_status IN ('ready', 'in_delivery')
         WHERE u.role = 'rider'
           AND u.is_verified = true
           AND u.latitude IS NOT NULL
           AND u.longitude IS NOT NULL
         GROUP BY u.id, u.name, u.phone, u.latitude, u.longitude
         HAVING COUNT(o.id) < 5
         ORDER BY COUNT(o.id) ASC
         LIMIT $1`,
        [limit]
      );

      const riders = result.rows.map(rider => ({
        ...rider,
        capacity: rider.capacity - rider.active_deliveries,
        current_location: rider.latitude && rider.longitude ?
          [rider.latitude, rider.longitude] : null
      }));

      console.log(`Fetched ${riders.length} available riders with GPS coordinates`);
      return riders;
    } catch (error) {
      console.error('Error fetching available riders:', error);
      throw error;
    }
  }

  /**
   * Save optimized route to database
   * @param {number} merchantId - Merchant ID
   * @param {number} riderId - Rider ID
   * @param {Array} route - Array of coordinates [[lat, lon], ...]
   * @param {number} distance - Total distance in meters
   * @param {Array} orderIds - Array of order IDs in this route
   * @param {string} source - 'rider_triggered' or 'auto_generated'
   * @param {string} algorithm - 'clarke_wright' or 'nearest_neighbor'
   * @returns {Promise<Object>} - Saved route object
   */
  async saveRoute(merchantId, riderId, route, distance, orderIds, source = 'rider_triggered', algorithm = 'clarke_wright') {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Check if delivery_routes table has optimization_source column
      // If not, create it (one-time migration)
      try {
        await client.query(
          `ALTER TABLE delivery_routes
           ADD COLUMN IF NOT EXISTS optimization_source VARCHAR(50),
           ADD COLUMN IF NOT EXISTS optimization_algorithm VARCHAR(50),
           ADD COLUMN IF NOT EXISTS optimized_at TIMESTAMP DEFAULT NOW()`
        );
      } catch (e) {
        // Column might already exist, continue
      }

      // Get road geometry from OSRM instead of straight lines
      const waypoints = route.route_coords || [];
      let routeCoordinates = waypoints;
      let actualDistance = distance;

      if (waypoints.length >= 2) {
        console.log(`[RouteOptimization] Getting OSRM road geometry for ${waypoints.length} waypoints`);
        const osrmResult = await this.osrmService.getRouteGeometryWithFallback(waypoints);
        if (osrmResult && osrmResult.coordinates) {
          routeCoordinates = osrmResult.coordinates; // Already in [lon, lat] format
          if (osrmResult.distance) {
            actualDistance = osrmResult.distance;
          }
          console.log(`[RouteOptimization] Got ${osrmResult.source} geometry with ${routeCoordinates.length} points, distance: ${actualDistance}m`);
        }
      }

      // Insert route with optimization metadata
      const routeResult = await client.query(
        `INSERT INTO delivery_routes
         (merchant_id, rider_id, route_coordinates, total_distance_m, order_ids, status,
          optimization_source, optimization_algorithm, optimized_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, NOW())
         RETURNING *`,
        [merchantId, riderId, JSON.stringify(routeCoordinates), actualDistance, orderIds, source, algorithm]
      );

      const savedRoute = routeResult.rows[0];

      // Update orders with rider assignment
      await client.query(
        `UPDATE orders
         SET rider_id = $1, assigned_at = NOW(), updated_at = NOW()
         WHERE id = ANY($2::int[])`,
        [riderId, orderIds]
      );

      // Add status history for each order
      // First, fetch all current order statuses
      const orderStatuses = {};
      if (orderIds.length > 0) {
        const statusResult = await client.query(
          `SELECT id, order_status FROM orders WHERE id = ANY($1::int[])`,
          [orderIds]
        );
        statusResult.rows.forEach(row => {
          orderStatuses[row.id] = row.order_status;
        });
      }

      // Only insert status history for orders that exist
      for (const orderId of orderIds) {
        if (orderStatuses[orderId]) {  // Only if order exists
          await client.query(
            `INSERT INTO order_status_history
             (order_id, status, notes, updated_by, updated_by_role)
             VALUES ($1, $2, 'Assigned to optimized delivery route', $3, 'system')`,
            [orderId, orderStatuses[orderId], riderId]
          );
        }
      }

      await client.query('COMMIT');
      return savedRoute;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error saving route:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate optimized routes
   * Supports three modes:
   * 1. Rider-triggered: Optimize pending orders for specific rider
   * 2. Auto-generated: System-triggered optimization for all pending orders
   * 3. Merchant-specific: Optimize orders for all merchants (legacy)
   *
   * @param {Object} options - Configuration options
   * @param {number} options.riderId - Rider ID (for rider-triggered optimization)
   * @param {number} options.merchantId - Merchant ID (for merchant-specific)
   * @param {string} options.source - 'rider_triggered' or 'auto_generated'
   * @param {string} options.method - 'clarke_wright' (default) or 'nearest_neighbor'
   * @returns {Promise<Object>} - Optimization results with saved routes and metrics
   */
  async generateOptimizedRoutes(options = {}) {
    try {
      const {
        riderId,
        merchantId,
        source = 'rider_triggered',
        method = 'clarke_wright'
      } = options;

      let orders;
      let riders;

      // Mode 1: Rider-triggered optimization
      if (riderId) {
        // Get pending orders for this specific rider
        orders = await this.getPendingOrdersForRider(riderId);

        if (!orders || orders.length === 0) {
          // If rider has no orders, find available rider with pending orders
          riders = await this.getAvailableRidersWithPendingOrders(1);
          if (riders.length === 0) {
            return {
              success: false,
              message: 'No pending orders available for optimization',
              routes: [],
              statistics: {
                orders_assigned: 0,
                riders_assigned: 0,
                total_routes: 0
              }
            };
          }
          orders = await this.getPendingOrdersForRider(riders[0].id);
        } else {
          riders = [{ id: riderId, capacity: 5 }];
        }
      }
      // Mode 2: Auto-generated (system) optimization
      else if (source === 'auto_generated') {
        // Get all pending orders across all merchants
        orders = await this.getAllPendingOrders();
        riders = await this.getAvailableRiders();
      }
      // Mode 3: Merchant-specific (legacy)
      else if (merchantId) {
        orders = await this.getPendingOrders(merchantId);
        riders = await this.getAvailableRiders();
      }

      if (!orders || orders.length === 0) {
        return {
          success: false,
          message: 'No pending orders to optimize',
          routes: [],
          statistics: {
            orders_assigned: 0,
            riders_assigned: 0,
            total_routes: 0
          }
        };
      }

      if (!riders || riders.length === 0) {
        return {
          success: false,
          message: 'No available riders for route assignment',
          routes: [],
          statistics: {
            orders_assigned: 0,
            riders_assigned: 0,
            total_routes: 0
          }
        };
      }

      // Get rider's starting location (current GPS or depot fallback)
      let riderStartLocation = this.defaultDepotLocation;
      if (riderId) {
        riderStartLocation = await this.getRiderStartLocation(riderId);
      } else if (riders && riders.length > 0) {
        // For auto-generated optimization, use first rider's location
        riderStartLocation = await this.getRiderStartLocation(riders[0].id);
      }

      // Run optimization (JavaScript implementation) with rider's start location
      const optimizationResult = await this.optimizeRoutes(orders, riders, method, riderStartLocation);

      // DEBUG: Log what optimizer returned
      console.log('[Optimize] Result:', {
        success: optimizationResult.success,
        routeCount: optimizationResult.routes.length,
        firstRoute: optimizationResult.routes[0] ? {
          rider_id: optimizationResult.routes[0].rider_id,
          order_ids: optimizationResult.routes[0].order_ids,
          distance_m: optimizationResult.routes[0].distance_m,
          route_coords_count: optimizationResult.routes[0].route_coords ? optimizationResult.routes[0].route_coords.length : 0,
          route_coords_sample: optimizationResult.routes[0].route_coords ? optimizationResult.routes[0].route_coords.slice(0, 2) : null
        } : null
      });

      if (!optimizationResult.success) {
        return {
          success: false,
          message: optimizationResult.error || 'Optimization failed',
          method: optimizationResult.method,
          routes: [],
          solve_time_ms: optimizationResult.solve_time_ms || 0,
          statistics: {
            orders_assigned: 0,
            riders_assigned: 0,
            total_routes: 0
          }
        };
      }

      // Save optimized routes to database
      const savedRoutes = [];
      const riderIds = new Set();

      for (const route of optimizationResult.routes) {
        try {
          const orderIds = route.order_ids || [];
          const distance = Math.round(route.distance_m) || 0;  // Convert to integer

          // Get merchant ID from first order
          const firstOrder = orders.find(o => o.id === orderIds[0]);
          const optimizationMerchantId = firstOrder?.merchant_id || merchantId;

          const savedRoute = await this.saveRoute(
            optimizationMerchantId,
            route.rider_id,
            route,  // Pass full route object with route_coords property
            distance,
            orderIds,
            source,
            optimizationResult.method
          );

          riderIds.add(route.rider_id);
          savedRoutes.push({
            ...savedRoute,
            num_deliveries: route.num_deliveries || orderIds.length,
            solve_time_ms: optimizationResult.solve_time_ms || 0
          });
        } catch (saveError) {
          console.error('Error saving route for rider', route.rider_id, ':', saveError);
        }
      }

      const totalDistance = optimizationResult.total_distance_m || 0;

      return {
        success: true,
        message: `Successfully optimized ${savedRoutes.length} routes for ${riderIds.size} riders`,
        method: optimizationResult.method,
        source: source,
        routes: savedRoutes,
        total_distance_m: totalDistance,
        solve_time_ms: optimizationResult.solve_time_ms || 0,
        statistics: {
          orders_assigned: orders.length,
          riders_assigned: riderIds.size,
          total_routes: savedRoutes.length,
          avg_distance_per_route: savedRoutes.length > 0 ? Math.round(totalDistance / savedRoutes.length) : 0,
          algorithm_quality: method === 'clarke_wright' ? '80-90% optimal' :
                           method === 'nearest_neighbor' ? '60-80% optimal' : 'unknown'
        }
      };

    } catch (error) {
      console.error('Error generating optimized routes:', error);
      throw error;
    }
  }

  /**
   * Get routes for a merchant
   * @param {number} merchantId - Merchant ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Array>} - Array of routes
   */
  async getMerchantRoutes(merchantId, status = null) {
    try {
      let query = `
        SELECT dr.*, u.name as rider_name, u.phone as rider_phone,
               array_agg(o.tracking_number) as tracking_numbers
        FROM delivery_routes dr
        LEFT JOIN users u ON dr.rider_id = u.id
        LEFT JOIN orders o ON o.id = ANY(dr.order_ids)
        WHERE dr.merchant_id = $1
      `;
      const params = [merchantId];

      if (status) {
        query += ` AND dr.status = $2`;
        params.push(status);
      }

      query += `
        GROUP BY dr.id, u.name, u.phone
        ORDER BY dr.created_at DESC
      `;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching merchant routes:', error);
      throw error;
    }
  }

  /**
   * Update route status
   * @param {number} routeId - Route ID
   * @param {string} status - New status (pending, active, completed, cancelled)
   * @returns {Promise<Object>} - Updated route
   */
  async updateRouteStatus(routeId, status) {
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const result = await db.query(
        `UPDATE delivery_routes
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, routeId]
      );

      if (result.rows.length === 0) {
        throw new Error('Route not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating route status:', error);
      throw error;
    }
  }

  /**
   * Get pending orders for a specific rider
   * Prioritizes: 1) Orders already assigned to rider (auto-assigned when confirmed)
   *              2) Optionally includes unassigned orders if rider has capacity
   * Uses locations table for customer GPS data (dormitories, buildings, etc.)
   * @param {number} riderId - Rider ID
   * @returns {Promise<Array>} - Array of ready orders for rider optimization
   */
  async getPendingOrdersForRider(riderId) {
    try {
      // Get ready orders already assigned to this rider (from auto-assignment)
      const assignedResult = await db.query(
        `SELECT o.id, o.merchant_id, o.student_id, o.delivery_address, o.total_amount,
                o.created_at, o.tracking_number,
                COALESCE(sa.latitude, l.latitude, l2.latitude, u.latitude) as latitude,
                COALESCE(sa.longitude, l.longitude, l2.longitude, u.longitude) as longitude,
                COALESCE(l.name, l2.name, '') as location_name,
                u.name as customer_name, u.phone as customer_phone
         FROM orders o
         LEFT JOIN users u ON o.student_id = u.id
         LEFT JOIN locations l ON u.location_id = l.id
         LEFT JOIN student_addresses sa ON o.delivery_address = sa.address_label
                                        AND sa.student_id = o.student_id
         LEFT JOIN locations l2 ON sa.location_id = l2.id
         WHERE o.rider_id = $1
           AND o.order_status = 'ready'
           AND (COALESCE(sa.latitude, l.latitude, l2.latitude, u.latitude) IS NOT NULL)
           AND (COALESCE(sa.longitude, l.longitude, l2.longitude, u.longitude) IS NOT NULL)
         ORDER BY o.created_at ASC`,
        [riderId]
      );

      const assignedOrders = assignedResult.rows;
      console.log(`Fetched ${assignedOrders.length} ready orders assigned to rider ${riderId}`);

      // If rider has capacity, also include unassigned orders they can claim
      const riderCapacity = 5;
      if (assignedOrders.length < riderCapacity) {
        const availableCapacity = riderCapacity - assignedOrders.length;
        const unassignedResult = await db.query(
          `SELECT o.id, o.merchant_id, o.student_id, o.delivery_address, o.total_amount,
                  o.created_at, o.tracking_number,
                  COALESCE(sa.latitude, l.latitude, l2.latitude, u.latitude) as latitude,
                  COALESCE(sa.longitude, l.longitude, l2.longitude, u.longitude) as longitude,
                  COALESCE(l.name, l2.name, '') as location_name,
                  u.name as customer_name, u.phone as customer_phone
           FROM orders o
           LEFT JOIN users u ON o.student_id = u.id
           LEFT JOIN locations l ON u.location_id = l.id
           LEFT JOIN student_addresses sa ON o.delivery_address = sa.address_label
                                          AND sa.student_id = o.student_id
           LEFT JOIN locations l2 ON sa.location_id = l2.id
           WHERE o.rider_id IS NULL
             AND o.order_status = 'ready'
             AND (COALESCE(sa.latitude, l.latitude, l2.latitude, u.latitude) IS NOT NULL)
             AND (COALESCE(sa.longitude, l.longitude, l2.longitude, u.longitude) IS NOT NULL)
           ORDER BY o.created_at ASC
           LIMIT $1`,
          [availableCapacity]
        );

        const unassignedOrders = unassignedResult.rows;
        console.log(`Fetched ${unassignedOrders.length} unassigned ready orders (capacity available for rider ${riderId})`);
        return [...assignedOrders, ...unassignedOrders];
      }

      return assignedOrders;
    } catch (error) {
      console.error('Error fetching pending orders for rider:', error);
      throw error;
    }
  }

  /**
   * Get all ready orders across all merchants
   * Used for system auto-optimization
   * Only fetches orders that are ready for pickup/delivery
   * Uses locations table for customer GPS data (dormitories, buildings, etc.)
   * @returns {Promise<Array>} - Array of all ready orders
   */
  async getAllPendingOrders() {
    try {
      const result = await db.query(
        `SELECT o.id, o.merchant_id, o.student_id, o.delivery_address, o.total_amount,
                o.created_at, o.tracking_number,
                COALESCE(l.latitude, l2.latitude, u.latitude) as latitude,
                COALESCE(l.longitude, l2.longitude, u.longitude) as longitude,
                COALESCE(l.name, l2.name, '') as location_name,
                m.name as merchant_name,
                u.name as customer_name, u.phone as customer_phone
         FROM orders o
         LEFT JOIN users u ON o.student_id = u.id
         LEFT JOIN users m ON o.merchant_id = m.id
         LEFT JOIN locations l ON u.location_id = l.id
         LEFT JOIN student_addresses sa ON o.delivery_address = sa.address_label
                                        AND sa.student_id = o.student_id
         LEFT JOIN locations l2 ON sa.location_id = l2.id
         WHERE o.order_status = 'ready'
           AND o.rider_id IS NULL
           AND (COALESCE(l.latitude, l2.latitude, u.latitude) IS NOT NULL)
           AND (COALESCE(l.longitude, l2.longitude, u.longitude) IS NOT NULL)
         ORDER BY o.created_at ASC`
      );

      console.log(`Fetched ${result.rows.length} ready orders system-wide`);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all pending orders:', error);
      throw error;
    }
  }

  /**
   * Get available riders for route assignment
   * Returns riders that have capacity available for new deliveries
   * @param {number} limit - Maximum riders to return
   * @returns {Promise<Array>} - Array of available riders
   */
  async getAvailableRidersWithPendingOrders(limit = 5) {
    try {
      const result = await db.query(
        `SELECT u.id, u.name, u.phone,
                u.latitude, u.longitude,
                COUNT(o.id) as active_deliveries,
                5 as capacity
         FROM users u
         LEFT JOIN orders o ON u.id = o.rider_id
                            AND o.order_status IN ('ready', 'in_delivery')
         WHERE u.role = 'rider'
           AND u.is_verified = true
           AND u.latitude IS NOT NULL
           AND u.longitude IS NOT NULL
         GROUP BY u.id, u.name, u.phone, u.latitude, u.longitude
         HAVING COUNT(o.id) < 5
         ORDER BY COUNT(o.id) ASC
         LIMIT $1`,
        [limit]
      );

      const riders = result.rows.map(rider => ({
        ...rider,
        capacity: rider.capacity - rider.active_deliveries,
        current_location: rider.latitude && rider.longitude ?
          [rider.latitude, rider.longitude] : null
      }));

      console.log(`Fetched ${riders.length} available riders with capacity`);
      return riders;
    } catch (error) {
      console.error('Error fetching available riders:', error);
      throw error;
    }
  }

  /**
   * Get optimization history for analytics
   * @param {number} limit - Number of recent optimizations to retrieve
   * @param {string} source - Filter by 'rider_triggered' or 'auto_generated'
   * @returns {Promise<Array>} - Array of recent optimizations
   */
  async getOptimizationHistory(limit = 50, source = null) {
    try {
      let query = `
        SELECT
          dr.id,
          dr.merchant_id,
          dr.rider_id,
          dr.optimization_source,
          dr.optimization_algorithm,
          dr.total_distance_m,
          dr.optimized_at,
          u.name as rider_name,
          COUNT(dr.order_ids) as num_orders,
          AVG(dr.total_distance_m) as avg_distance
        FROM delivery_routes dr
        LEFT JOIN users u ON dr.rider_id = u.id
        WHERE dr.optimized_at IS NOT NULL
      `;

      const params = [];

      if (source) {
        query += ` AND dr.optimization_source = $1`;
        params.push(source);
      }

      query += `
        GROUP BY dr.id, u.name
        ORDER BY dr.optimized_at DESC
        LIMIT $${params.length + 1}
      `;
      params.push(limit);

      const result = await db.query(query, params);

      return result.rows;
    } catch (error) {
      console.error('Error fetching optimization history:', error);
      throw error;
    }
  }

  /**
   * Get optimization statistics for admin dashboard
   * @param {string} startDate - Start date for filter
   * @param {string} endDate - End date for filter
   * @returns {Promise<Object>} - Statistics object
   */
  async getOptimizationStatistics(startDate = null, endDate = null) {
    try {
      let query = `
        SELECT
          COUNT(*) as total_optimizations,
          COUNT(CASE WHEN optimization_source = 'rider_triggered' THEN 1 END) as rider_triggered,
          COUNT(CASE WHEN optimization_source = 'auto_generated' THEN 1 END) as auto_generated,
          COUNT(CASE WHEN optimization_algorithm = 'clarke_wright' THEN 1 END) as clarke_wright_count,
          COUNT(CASE WHEN optimization_algorithm = 'nearest_neighbor' THEN 1 END) as nearest_neighbor_count,
          ROUND(AVG(total_distance_m)::numeric, 2) as avg_distance_m,
          ROUND(MIN(total_distance_m)::numeric, 2) as min_distance_m,
          ROUND(MAX(total_distance_m)::numeric, 2) as max_distance_m,
          SUM(ARRAY_LENGTH(order_ids, 1)) as total_orders_optimized
        FROM delivery_routes
        WHERE optimized_at IS NOT NULL
      `;

      const params = [];

      if (startDate) {
        query += ` AND optimized_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND optimized_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      const result = await db.query(query, params);
      return result.rows[0] || {};
    } catch (error) {
      console.error('Error fetching optimization statistics:', error);
      throw error;
    }
  }

  /**
   * Legacy method: Send route instructions via SMS
   * @param {number} orderId - Order ID
   * @param {Object} rider - Rider object
   * @returns {Promise<Object>} - SMS send result
   */
  async sendRouteInstructions(orderId, rider) {
    try {
      const order = await db.query(
        `SELECT o.*, u.phone as customer_phone, u.name as customer_name
         FROM orders o
         JOIN users u ON o.student_id = u.id
         WHERE o.id = $1`,
        [orderId]
      );

      if (order.rows.length === 0) {
        throw new Error('Order not found');
      }

      const orderData = order.rows[0];

      // Generate SMS instructions
      const smsMessage = this.generateSMSInstructions(orderData, rider);

      // Send SMS (integrate with your SMS provider)
      await this.sendSMS(rider.phone, smsMessage);

      return {
        success: true,
        rider_id: rider.id,
        rider_name: rider.name,
        message: 'SMS sent successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  generateSMSInstructions(order, rider) {
    const msg = `WeGo Delivery\n\n` +
      `Order #${order.id}\n` +
      `Pickup: ${order.merchant_name || 'Merchant'}\n` +
      `Deliver to: ${order.delivery_address}\n` +
      `Customer: ${order.customer_name}\n` +
      `Phone: ${order.customer_phone}\n` +
      `Amount: XAF ${parseFloat(order.total_amount).toFixed(2)}\n\n` +
      `Tracking: ${order.tracking_number}`;

    return msg;
  }

  async sendSMS(phone, message) {
    // Integrate with SMS provider (Twilio, Africa's Talking, etc.)
    console.log(`SMS to ${phone}:`, message);

    // TODO: Implement actual SMS sending
    // Example with Africa's Talking:
    // const africastalking = require('africastalking')({
    //   apiKey: process.env.AT_API_KEY,
    //   username: process.env.AT_USERNAME
    // });
    // await africastalking.SMS.send({ to: [phone], message });

    return { success: true };
  }

  /**
   * Check if rider has an active route (pending or active status)
   * @param {number} riderId - Rider ID
   * @returns {Promise<Object|null>} - Active route if exists, null otherwise
   */
  async getActiveRoute(riderId) {
    try {
      const result = await db.query(
        `SELECT * FROM delivery_routes
         WHERE rider_id = $1 AND status IN ('pending', 'active')
         ORDER BY created_at DESC LIMIT 1`,
        [riderId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking active route:', error);
      return null;
    }
  }

  /**
   * Generate both primary (Clarke-Wright) and alternate (Nearest Neighbor) routes
   * with comparison metrics
   * @param {Object} options - Same as generateOptimizedRoutes options
   * @returns {Promise<Object>} - Both routes with comparison and recommendation
   */
  async generateRoutesWithAlternative(options = {}) {
    try {
      const { riderId, merchantId, source = 'rider_triggered' } = options;

      // Check if rider already has an active route
      if (riderId) {
        const activeRoute = await this.getActiveRoute(riderId);
        if (activeRoute) {
          return {
            success: false,
            message: 'You already have an active route. Complete it before requesting a new one.',
            routes: [],
            statistics: { orders_assigned: 0, riders_assigned: 0, total_routes: 0 }
          };
        }
      }

      // Generate primary route with Clarke-Wright
      const primaryResult = await this.generateOptimizedRoutes({
        ...options,
        method: 'clarke_wright'
      });

      if (!primaryResult.success) {
        return primaryResult;
      }

      // Generate alternate route with Nearest Neighbor
      const alternateResult = await this.generateOptimizedRoutes({
        ...options,
        method: 'nearest_neighbor'
      });

      // Compare routes and determine recommendation
      const primaryRoute = primaryResult.routes[0];
      const alternateRoute = alternateResult.routes[0];

      const comparison = this.compareRoutes(primaryRoute, alternateRoute);

      return {
        success: true,
        primary_route: {
          ...primaryRoute,
          algorithm: 'clarke_wright'
        },
        alternate_route: alternateRoute ? {
          ...alternateRoute,
          algorithm: 'nearest_neighbor'
        } : null,
        recommendation: comparison.recommended,
        comparison: comparison.metrics
      };

    } catch (error) {
      console.error('Error generating routes with alternative:', error);
      return {
        success: false,
        message: error.message,
        routes: [],
        statistics: { orders_assigned: 0, riders_assigned: 0, total_routes: 0 }
      };
    }
  }

  /**
   * Compare two routes and return metrics + recommendation
   * @param {Object} route1 - First route (typically Clarke-Wright)
   * @param {Object} route2 - Second route (typically Nearest Neighbor)
   * @returns {Object} - Comparison metrics and recommendation
   */
  compareRoutes(route1, route2) {
    if (!route1 || !route2) {
      return {
        recommended: 'primary',
        metrics: {
          distance_diff_m: route1 ? route1.total_distance_m : 0,
          distance_diff_percent: 0
        }
      };
    }

    const distance1 = route1.total_distance_m || 0;
    const distance2 = route2.total_distance_m || 0;
    const difference = distance1 - distance2;
    const percentDiff = distance1 > 0 ? (difference / distance1 * 100).toFixed(2) : 0;

    return {
      recommended: distance2 < distance1 ? 'alternate' : 'primary',
      metrics: {
        primary_distance_m: distance1,
        alternate_distance_m: distance2,
        distance_diff_m: Math.abs(difference),
        distance_diff_percent: Math.abs(percentDiff),
        primary_stops: route1.num_deliveries || route1.order_ids.length || 0,
        alternate_stops: route2.num_deliveries || route2.order_ids.length || 0
      }
    };
  }

  /**
   * Get detailed itinerary for a route with full order information
   * @param {number} routeId - Route ID
   * @returns {Promise<Array>} - Stop-by-stop itinerary with order details
   */
  async getRouteItinerary(routeId) {
    try {
      // Get route details
      const routeResult = await db.query(
        `SELECT * FROM delivery_routes WHERE id = $1`,
        [routeId]
      );

      if (routeResult.rows.length === 0) {
        throw new Error('Route not found');
      }

      const route = routeResult.rows[0];
      const orderIds = route.order_ids || [];

      // Parse route coordinates if stored as JSON string
      let routeCoords = route.route_coordinates || [];
      if (typeof routeCoords === 'string') {
        try {
          routeCoords = JSON.parse(routeCoords);
        } catch (e) {
          console.warn('Could not parse route coordinates:', e);
          routeCoords = [];
        }
      }

      console.log(`[getRouteItinerary] Route ${routeId}: orderIds=${orderIds.length}, coords=${routeCoords.length}`);

      if (orderIds.length === 0) {
        console.warn(`[getRouteItinerary] No orders for route ${routeId}`);
        return [];
      }

      // Get full order details for all orders in route
      // Uses fallback chain for coordinates: user.location_id -> student_addresses.location_id
      const ordersResult = await db.query(
        `SELECT o.id, o.tracking_number, o.total_amount, o.order_status,
                o.delivery_address,
                u.name as customer_name, u.phone as customer_phone,
                COALESCE(l.latitude, l2.latitude) as latitude,
                COALESCE(l.longitude, l2.longitude) as longitude,
                array_agg(oi.id) as item_ids,
                array_agg(p.name) as item_names,
                array_agg(oi.quantity) as item_quantities
         FROM orders o
         LEFT JOIN users u ON o.student_id = u.id
         LEFT JOIN locations l ON u.location_id = l.id
         LEFT JOIN student_addresses sa ON o.delivery_address = sa.address_label
                                        AND sa.student_id = o.student_id
         LEFT JOIN locations l2 ON sa.location_id = l2.id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.id = ANY($1::int[])
         GROUP BY o.id, u.name, u.phone, l.latitude, l.longitude, l2.latitude, l2.longitude`,
        [orderIds]
      );

      // Build itinerary with stop sequence based on route coordinates
      const itinerary = [];
      const orderMap = new Map();

      ordersResult.rows.forEach(row => {
        orderMap.set(row.id, row);
      });

      // Create stops in route order
      orderIds.forEach((orderId, index) => {
        const order = orderMap.get(orderId);
        if (order) {
          // ALWAYS use the actual building coordinates from the order's delivery location
          // The OSRM route coordinates are for the polyline visualization, not for marker placement
          const stopCoords = [order.latitude, order.longitude];

          // Validate coordinates exist for marker placement
          if (!order.latitude || !order.longitude) {
            console.warn(`[getRouteItinerary] Order ${order.id} has NULL coordinates - marker will not display properly!`);
            console.warn(`[getRouteItinerary] Customer should have location_id set or delivery address linked to location`);
          }

          itinerary.push({
            stop_number: index + 1,
            order_id: order.id,
            tracking_number: order.tracking_number,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            delivery_address: order.delivery_address,
            total_amount: order.total_amount,
            order_status: order.order_status,
            coordinates: stopCoords,
            items: order.item_names ? order.item_names.map((name, i) => ({
              name,
              quantity: order.item_quantities[i]
            })) : []
          });
        }
      });

      return itinerary;

    } catch (error) {
      console.error('Error getting route itinerary:', error);
      throw error;
    }
  }

  /**
   * Enhance route data with ETA and distance breakdown for display
   * @param {Object} route - Route object with distance and itinerary
   * @param {Array} itinerary - Array of stops with order information
   * @returns {Object} - Enriched route with ETA calculations
   */
  enrichRouteWithETA(route, itinerary) {
    // Constants for delivery
    const AVG_SPEED_KMH = 25; // Average urban delivery speed in km/h
    const TIME_PER_STOP_MINUTES = 8; // Time to stop, deliver, and restart (8 mins)
    const DISTANCE_RETURN_TRIP = route.total_distance_m; // Full distance includes round trip

    // Calculate time metrics
    const travelTimeMinutes = (DISTANCE_RETURN_TRIP / 1000) / AVG_SPEED_KMH * 60;
    const deliveryTimeMinutes = (itinerary.length || 0) * TIME_PER_STOP_MINUTES;
    const totalTimeMinutes = travelTimeMinutes + deliveryTimeMinutes;

    // Calculate ETA for each stop
    let cumulativeTime = 0;
    const enrichedItinerary = itinerary.map((stop, index) => {
      cumulativeTime += TIME_PER_STOP_MINUTES; // Time to reach and deliver at this stop

      return {
        ...stop,
        estimated_arrival_minutes: Math.round(cumulativeTime),
        estimated_delivery_minutes: Math.round(cumulativeTime)
      };
    });

    return {
      ...route,
      distance_info: {
        total_distance_m: DISTANCE_RETURN_TRIP,
        total_distance_km: (DISTANCE_RETURN_TRIP / 1000).toFixed(2),
        distance_description: `Round trip distance including return to depot`,
        avg_speed_kmh: AVG_SPEED_KMH
      },
      time_estimate: {
        travel_time_minutes: Math.round(travelTimeMinutes),
        delivery_time_minutes: deliveryTimeMinutes,
        total_estimated_time_minutes: Math.round(totalTimeMinutes),
        total_estimated_time_readable: this.formatMinutesToReadable(Math.round(totalTimeMinutes))
      },
      itinerary: enrichedItinerary
    };
  }

  /**
   * Format minutes to readable format (e.g., "1h 23m")
   */
  formatMinutesToReadable(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}

module.exports = new RouteOptimizationService();
