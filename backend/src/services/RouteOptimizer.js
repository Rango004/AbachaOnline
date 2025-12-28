/**
 * WeGo Delivery Route Optimizer (Pure JavaScript)
 *
 * Algorithms:
 * - Clarke-Wright Savings Algorithm (primary, 80-90% optimal)
 * - Nearest Neighbor Fallback (60-80% optimal, ultra-fast)
 * - 2-Opt Local Search (improves any route by 5-15%)
 *
 * Zero external dependencies. Pure JavaScript implementation.
 */

class RouteOptimizer {
  constructor(options = {}) {
    this.roadMultiplier = options.roadMultiplier || 1.3;
    this.depotLocation = options.depotLocation || [8.1129, -12.0710]; // Njala University [lat, lon]
    this.distanceCache = new Map();

    // Initialize OSRM routing service if provided
    this.osrmService = options.osrmService || null;
    this.useOSRM = options.useOSRM !== false; // Default to use OSRM if available
  }

  /**
   * Calculate Haversine distance in meters between two points
   * @param {Array} point1 - [latitude, longitude]
   * @param {Array} point2 - [latitude, longitude]
   * @returns {number} Distance in meters
   */
  haversineDistance(point1, point2) {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;

    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // meters
  }

  /**
   * Get distance with OSRM or fallback to haversine
   * @param {Array} origin - [lat, lon]
   * @param {Array} destination - [lat, lon]
   * @returns {number} Road distance in meters
   */
  async getDistance(origin, destination) {
    const key = `${origin[0]},${origin[1]}_${destination[0]},${destination[1]}`;

    // Check cache first
    if (this.distanceCache.has(key)) {
      return this.distanceCache.get(key);
    }

    let distance = null;

    // Try OSRM if available and enabled
    if (this.useOSRM && this.osrmService) {
      try {
        distance = await this.osrmService.getDistance(
          origin,
          destination,
          (from, to) => this.haversineDistance(from, to) * this.roadMultiplier
        );
      } catch (error) {
        console.warn(`[getDistance] OSRM error, falling back to haversine:`, error.message);
      }
    }

    // Fallback to haversine if OSRM not used or failed
    if (!distance) {
      const straight = this.haversineDistance(origin, destination);
      distance = Math.round(straight * this.roadMultiplier);
      console.log(`[getDistance] Using haversine: ${JSON.stringify(origin)} -> ${JSON.stringify(destination)}: ${distance}m`);
    } else {
      console.log(`[getDistance] Using OSRM: ${JSON.stringify(origin)} -> ${JSON.stringify(destination)}: ${distance}m`);
    }

    this.distanceCache.set(key, distance);
    return distance;
  }

  /**
   * Create distance matrix for all locations (async)
   */
  async createDistanceMatrix(locations) {
    const n = locations.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = await this.getDistance(locations[i], locations[j]);
        matrix[i][j] = dist;
        matrix[j][i] = dist; // Symmetric
      }
    }

    return matrix;
  }

  /**
   * Clarke-Wright Savings Algorithm (async)
   * Merges routes with highest savings
   */
  async clarkeWrightAlgorithm(orders, riders) {
    const startTime = Date.now();
    const depot = this.depotLocation;

    if (orders.length === 0) {
      return { success: false, error: 'No orders', routes: [], solve_time_ms: 0 };
    }

    // DEBUG: Log coordinates being used
    console.log(`[Clarke-Wright] Depot: ${JSON.stringify(depot)}, Orders: ${orders.length}`);
    orders.forEach((o, idx) => {
      console.log(`  Order ${idx}: id=${o.id}, location=${JSON.stringify(o.location)}`);
    });

    // Create distance matrix
    const locations = [depot, ...orders.map(o => o.location)];
    const distMatrix = await this.createDistanceMatrix(locations);

    // Initialize: each order as separate route
    const routes = orders.map((order, idx) => ({
      orders: [order.id],
      locations: [depot, order.location, depot],
      distance: distMatrix[0][idx + 1] * 2 // There and back
    }));

    // Calculate savings for all pairs
    const savings = [];
    for (let i = 0; i < orders.length; i++) {
      for (let j = i + 1; j < orders.length; j++) {
        const save = distMatrix[0][i + 1] + distMatrix[0][j + 1] - distMatrix[i + 1][j + 1];
        savings.push({ i, j, save });
      }
    }

    // Sort by savings descending
    savings.sort((a, b) => b.save - a.save);

    // Merge routes with highest savings
    for (const { i, j } of savings) {
      const route1 = routes.find(r => r.orders.includes(orders[i].id));
      const route2 = routes.find(r => r.orders.includes(orders[j].id));

      if (route1 && route2 && route1 !== route2) {
        // Check capacity constraints
        const totalOrders = route1.orders.length + route2.orders.length;
        const availableRider = riders.find(r => r.capacity >= totalOrders);

        if (availableRider) {
          // Merge routes
          const merged = await this.mergeRoutes(route1, route2, orders, distMatrix);
          if (merged) {
            const idx1 = routes.indexOf(route1);
            const idx2 = routes.indexOf(route2);
            routes.splice(Math.max(idx1, idx2), 1);
            routes.splice(Math.min(idx1, idx2), 1, merged);
          }
        }
      }
    }

    // Assign routes to riders
    const assignedRoutes = this.assignRoutesToRiders(routes, riders, orders);

    const solveTime = Date.now() - startTime;
    return {
      success: true,
      routes: assignedRoutes,
      total_distance_m: assignedRoutes.reduce((sum, r) => sum + r.distance_m, 0),
      solve_time_ms: solveTime,
      method: 'clarke_wright'
    };
  }

  /**
   * Merge two routes (async)
   */
  async mergeRoutes(route1, route2, orders, distMatrix) {
    // Simple merge: append route2 to route1
    const mergedOrders = [...route1.orders, ...route2.orders];
    const mergedLocations = [
      this.depotLocation,
      ...mergedOrders.map(orderId => orders.find(o => o.id === orderId).location),
      this.depotLocation
    ];

    // Calculate new distance
    let distance = 0;
    for (let i = 0; i < mergedLocations.length - 1; i++) {
      distance += await this.getDistance(mergedLocations[i], mergedLocations[i + 1]);
    }

    return {
      orders: mergedOrders,
      locations: mergedLocations,
      distance
    };
  }

  /**
   * Nearest Neighbor Algorithm (fast fallback, async)
   */
  async nearestNeighborAlgorithm(orders, riders) {
    const startTime = Date.now();
    const depot = this.depotLocation;

    if (orders.length === 0) {
      return { success: false, error: 'No orders', routes: [], solve_time_ms: 0 };
    }

    const routes = [];
    const unvisited = new Set(orders.map(o => o.id));
    let riderIdx = 0;

    while (unvisited.size > 0) {
      const rider = riders[riderIdx % riders.length];
      const route = {
        locations: [depot],
        orders: [],
        distance: 0
      };

      let current = depot;
      let capacity = rider.capacity;

      // Greedy: always go to nearest unvisited
      while (capacity > 0 && unvisited.size > 0) {
        let nearest = null;
        let minDist = Infinity;

        for (const orderId of unvisited) {
          const order = orders.find(o => o.id === orderId);
          const dist = await this.getDistance(current, order.location);
          if (dist < minDist) {
            minDist = dist;
            nearest = order;
          }
        }

        if (nearest) {
          route.orders.push(nearest.id);
          route.locations.push(nearest.location);
          route.distance += minDist;
          current = nearest.location;
          unvisited.delete(nearest.id);
          capacity--;
        }
      }

      // Return to depot
      if (route.orders.length > 0) {
        route.distance += await this.getDistance(current, depot);
        route.locations.push(depot);
        routes.push(route);
      }

      riderIdx++;
      if (riderIdx > riders.length && unvisited.size > 0) break; // Prevent infinite loop
    }

    const assignedRoutes = this.assignRoutesToRiders(routes, riders, orders);
    const solveTime = Date.now() - startTime;

    return {
      success: true,
      routes: assignedRoutes,
      total_distance_m: assignedRoutes.reduce((sum, r) => sum + r.distance_m, 0),
      solve_time_ms: solveTime,
      method: 'nearest_neighbor'
    };
  }

  /**
   * 2-Opt Local Search Optimization (async)
   * Improves existing route by swapping edges
   */
  async twoOptOptimization(route, orders, maxIterations = 100) {
    let improved = true;
    let iterations = 0;
    const locations = route.locations;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 1; i < locations.length - 2; i++) {
        for (let k = i + 1; k < locations.length - 1; k++) {
          const delta = await this.twoOptSwap(locations, i, k);

          if (delta < -1) { // Improvement found
            // Reverse the route between i+1 and k
            const newLocations = [
              ...locations.slice(0, i + 1),
              ...locations.slice(i + 1, k + 1).reverse(),
              ...locations.slice(k + 1)
            ];

            route.locations = newLocations;
            route.distance += delta;
            improved = true;
          }
        }
      }
    }

    return route;
  }

  /**
   * Calculate change in distance for 2-Opt swap (async)
   */
  async twoOptSwap(locations, i, k) {
    const a = locations[i];
    const b = locations[i + 1];
    const c = locations[k];
    const d = locations[k + 1];

    const currentDist = await this.getDistance(a, b) + await this.getDistance(c, d);
    const newDist = await this.getDistance(a, c) + await this.getDistance(b, d);

    return newDist - currentDist;
  }

  /**
   * Assign routes to riders
   */
  assignRoutesToRiders(routes, riders, orders) {
    const assignedRoutes = [];
    const riderIndices = {};

    // Initialize rider indices
    riders.forEach((r, i) => {
      riderIndices[i] = r.id;
    });

    // Assign routes to riders with capacity
    let riderIdx = 0;
    for (const route of routes) {
      while (riderIdx < riders.length) {
        const rider = riders[riderIdx];
        if (route.orders.length <= rider.capacity) {
          assignedRoutes.push({
            rider_id: rider.id,
            route_coords: route.locations,
            locations: route.locations, // Include for 2-Opt optimization
            order_ids: route.orders,
            distance_m: route.distance,
            distance: route.distance, // Also include as 'distance' for compatibility
            num_deliveries: route.orders.length,
            orders: route.orders // Include for 2-Opt compatibility
          });
          break;
        }
        riderIdx++;
      }
    }

    return assignedRoutes;
  }

  /**
   * Main optimization entry point (async)
   */
  async optimize(orders, riders, method = 'clarke_wright') {
    try {
      if (!orders || orders.length === 0) {
        return {
          success: false,
          error: 'No orders to optimize',
          routes: [],
          method
        };
      }

      if (!riders || riders.length === 0) {
        return {
          success: false,
          error: 'No available riders',
          routes: [],
          method
        };
      }

      let result;

      if (method === 'clarke_wright') {
        result = await this.clarkeWrightAlgorithm(orders, riders);

        // If Clarke-Wright fails or empty, fallback to Nearest Neighbor
        if (!result.success || !result.routes || result.routes.length === 0) {
          console.warn('Clarke-Wright failed, falling back to Nearest Neighbor');
          result = await this.nearestNeighborAlgorithm(orders, riders);
        } else {
          // Apply 2-Opt improvement
          result.routes = await Promise.all(result.routes.map(async route => {
            const optimized = await this.twoOptOptimization(route, orders);
            return optimized || route; // Fallback to original if undefined
          })).then(routes => routes.filter(route => route != null)); // Remove any undefined routes
        }
      } else if (method === 'nearest_neighbor') {
        result = await this.nearestNeighborAlgorithm(orders, riders);
      } else {
        result = await this.nearestNeighborAlgorithm(orders, riders);
      }

      // Ensure result has required properties
      if (!result || !result.routes) {
        return {
          success: false,
          error: 'Optimization failed - no routes generated',
          routes: [],
          method
        };
      }

      return result;

    } catch (error) {
      console.error('Route optimization error:', error);
      return {
        success: false,
        error: error.message,
        routes: [],
        method
      };
    }
  }
}

module.exports = RouteOptimizer;
