const express = require('express');
const RiderDashboardService = require('../services/RiderDashboardService');
const RiderLocationService = require('../services/RiderLocationService');
const RouteOptimizationService = require('../services/RouteOptimizationService');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/v1/rider/routes/optimize
 * @desc    Rider-triggered route optimization with both primary and alternate routes
 *          Generates Clarke-Wright (primary) and Nearest Neighbor (alternate) routes
 *          Rider can choose preferred route, shows comparison metrics
 * @access  Private (Riders only)
 * @body    {string} method - Optional: 'clarke_wright' (default) or 'nearest_neighbor'
 */
router.post('/routes/optimize', authenticate, authorize('rider'), async (req, res) => {
  const riderId = req.user.id;
  const { method } = req.body;

  try {
    console.log(`[Route Optimization] Rider ${riderId} requesting optimization`);

    // Use new method that generates both Clarke-Wright and Nearest Neighbor routes
    const result = await RouteOptimizationService.generateRoutesWithAlternative({
      riderId,
      source: 'rider_triggered'
    });

    console.log(`[Route Optimization] Result:`, JSON.stringify(result, null, 2));

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message,
        message: result.message,
        routes: [],
        statistics: {
          orders_assigned: 0,
          riders_assigned: 0,
          total_routes: 0
        }
      });
    }

    // Fetch itineraries for both routes if they exist
    let primaryItinerary = [];
    let alternateItinerary = [];
    let enrichedPrimaryRoute = result.primary_route;
    let enrichedAlternateRoute = result.alternate_route;

    if (result.primary_route?.id) {
      try {
        primaryItinerary = await RouteOptimizationService.getRouteItinerary(result.primary_route.id);
        // Enrich primary route with ETA and distance info
        enrichedPrimaryRoute = RouteOptimizationService.enrichRouteWithETA(result.primary_route, primaryItinerary);
      } catch (err) {
        console.error('Error fetching primary route itinerary:', err);
        enrichedPrimaryRoute = {
          ...result.primary_route,
          itinerary: primaryItinerary
        };
      }
    }

    if (result.alternate_route?.id) {
      try {
        alternateItinerary = await RouteOptimizationService.getRouteItinerary(result.alternate_route.id);
        // Enrich alternate route with ETA and distance info
        enrichedAlternateRoute = RouteOptimizationService.enrichRouteWithETA(result.alternate_route, alternateItinerary);
      } catch (err) {
        console.error('Error fetching alternate route itinerary:', err);
        enrichedAlternateRoute = {
          ...result.alternate_route,
          itinerary: alternateItinerary
        };
      }
    }

    // Emit WebSocket event to notify rider in real-time
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${riderId}`).emit('route:optimized', {
        primary_route_id: result.primary_route?.id,
        alternate_route_id: result.alternate_route?.id,
        recommendation: result.recommendation,
        primary_algorithm: 'clarke_wright',
        alternate_algorithm: 'nearest_neighbor',
        primary_distance_m: result.primary_route?.total_distance_m,
        alternate_distance_m: result.alternate_route?.total_distance_m,
        primary_eta_minutes: enrichedPrimaryRoute?.time_estimate?.total_estimated_time_minutes,
        alternate_eta_minutes: enrichedAlternateRoute?.time_estimate?.total_estimated_time_minutes,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Route optimization complete. Choose your preferred route.',
      primary_route: enrichedPrimaryRoute,
      alternate_route: enrichedAlternateRoute || null,
      recommendation: result.recommendation,
      comparison: result.comparison
    });
  } catch (error) {
    console.error('Rider route optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize routes',
      message: error.message,
      routes: [],
      statistics: {
        orders_assigned: 0,
        riders_assigned: 0,
        total_routes: 0
      }
    });
  }
});

/**
 * @route   GET /api/v1/rider/dashboard
 * @desc    Get rider dashboard with statistics and orders
 * @access  Private (Riders only)
 */
router.get('/dashboard', authenticate, authorize('rider'), async (req, res) => {
  try {
    const dashboard = await RiderDashboardService.getRiderDashboard(req.user.id);

    res.json({
      message: 'Rider dashboard retrieved successfully',
      data: dashboard
    });
  } catch (error) {
    console.error('Get rider dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch rider dashboard',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/orders/active
 * @desc    Get rider's active orders
 * @access  Private (Riders only)
 */
router.get('/orders/active', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orders = await RiderDashboardService.getActiveOrders(req.user.id);
    
    res.json({
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get active orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch active orders',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/orders/available
 * @desc    Get available orders for claiming
 * @access  Private (Riders only)
 */
router.get('/orders/available', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orders = await RiderDashboardService.getAvailableOrders();
    
    res.json({
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch available orders',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/rider/orders/:id/claim
 * @desc    Claim an available order
 * @access  Private (Riders only)
 */
router.post('/orders/:id/claim', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const result = await RiderDashboardService.claimOrder(orderId, req.user.id);

    res.json(result);
  } catch (error) {
    console.error('Claim order error:', {
      orderId,
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });

    // Return appropriate status code based on error
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message
      });
    }

    if (error.message.includes('already claimed') || error.message.includes('conflict')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to claim order',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/statistics
 * @desc    Get rider performance statistics
 * @access  Private (Riders only)
 */
router.get('/statistics', authenticate, authorize('rider'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const filters = {
      start_date,
      end_date
    };

    const stats = await RiderDashboardService.getRiderStats(req.user.id, filters);

    res.json({
      message: 'Statistics retrieved successfully',
      statistics: stats
    });
  } catch (error) {
    console.error('Get rider statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/routing-performance
 * @desc    Get rider's routing efficiency metrics
 *          Shows performance of Clarke-Wright and other routing algorithms
 * @access  Private (Riders only)
 */
router.get('/routing-performance', authenticate, authorize('rider'), async (req, res) => {
  try {
    const performance = await RiderDashboardService.getRoutingPerformance(req.user.id);

    res.json({
      message: 'Routing performance metrics retrieved successfully',
      performance
    });
  } catch (error) {
    console.error('Get routing performance error:', error);
    res.status(500).json({
      error: 'Failed to fetch routing performance metrics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/earnings
 * @desc    Get rider earnings information
 * @access  Private (Riders only)
 */
router.get('/earnings', authenticate, authorize('rider'), async (req, res) => {
  try {
    const earnings = await RiderDashboardService.getRiderEarnings(req.user.id);
    
    res.json({
      message: 'Earnings retrieved successfully',
      earnings
    });
  } catch (error) {
    console.error('Get rider earnings error:', error);
    res.status(500).json({
      error: 'Failed to fetch earnings',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/rider/location
 * @desc    Update rider's GPS location (called every 30 seconds)
 * @access  Private (Riders only)
 */
router.post('/location', authenticate, authorize('rider'), async (req, res) => {
  try {
    const { latitude, longitude, accuracy, altitude, speed, heading, order_id } = req.body;

    // Validate and convert required fields to numbers
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    // Validate latitude range (-90 to 90)
    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Latitude must be between -90 and 90'
      });
    }

    // Validate longitude range (-180 to 180)
    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Longitude must be between -180 and 180'
      });
    }

    // Validate optional numeric fields
    const validAccuracy = accuracy !== undefined && accuracy !== null ? Number(accuracy) : null;
    const validAltitude = altitude !== undefined && altitude !== null ? Number(altitude) : null;
    const validSpeed = speed !== undefined && speed !== null ? Number(speed) : null;
    const validHeading = heading !== undefined && heading !== null ? Number(heading) : null;

    if (validAccuracy !== null && isNaN(validAccuracy)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Accuracy must be a valid number'
      });
    }

    if (validAltitude !== null && isNaN(validAltitude)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Altitude must be a valid number'
      });
    }

    if (validSpeed !== null && isNaN(validSpeed)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Speed must be a valid number'
      });
    }

    if (validHeading !== null && isNaN(validHeading)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Heading must be a valid number'
      });
    }

    const locationService = new RiderLocationService();
    const result = await locationService.updateRiderLocation(
      req.user.id,
      order_id || null,
      lat,
      lng,
      validAccuracy,
      validAltitude,
      validSpeed,
      validHeading
    );

    res.json({
      message: 'Location updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update rider location error:', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Failed to update location',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/location
 * @desc    Get rider's current location
 * @access  Private (Riders only)
 */
router.get('/location', authenticate, authorize('rider'), async (req, res) => {
  try {
    const locationService = new RiderLocationService();
    const location = await locationService.getRiderCurrentLocation(req.user.id);

    if (!location) {
      return res.status(404).json({
        error: 'No location data available for this rider'
      });
    }

    res.json({
      message: 'Current location retrieved successfully',
      data: location
    });
  } catch (error) {
    console.error('Get rider location error:', error);
    res.status(500).json({
      error: 'Failed to fetch location',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/location/history/:orderId
 * @desc    Get rider's location history for a specific order
 * @access  Private (Riders only)
 */
router.get('/location/history/:orderId', authenticate, authorize('rider'), async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const locationService = new RiderLocationService();
    const history = await locationService.getRiderLocationHistory(
      req.user.id,
      orderId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      message: 'Location history retrieved successfully',
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({
      error: 'Failed to fetch location history',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/delivery/:orderId/progress
 * @desc    Get delivery progress for an order with rider location
 * @access  Private (Riders, Customers, Merchants)
 */
router.get('/delivery/:orderId/progress', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const locationService = new RiderLocationService();
    const progress = await locationService.getDeliveryProgress(orderId);

    res.json({
      message: 'Delivery progress retrieved successfully',
      data: progress
    });
  } catch (error) {
    console.error('Get delivery progress error:', {
      orderId,
      error: error.message,
      stack: error.stack
    });

    // Return appropriate status code based on error
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch delivery progress',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/routes/:routeId
 * @desc    Get detailed information for a specific optimized route
 * @access  Private (Riders)
 */
router.get('/routes/:routeId', authenticate, authorize('rider'), async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId);

    if (isNaN(routeId)) {
      return res.status(400).json({
        error: 'Invalid route ID'
      });
    }

    const route = await RiderDashboardService.getRouteDetails(routeId, req.user.id);

    res.json({
      message: 'Route details retrieved successfully',
      data: route
    });
  } catch (error) {
    console.error('Get route details error:', {
      routeId: req.params.routeId,
      userId: req.user.id,
      error: error.message
    });

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch route details',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/v1/rider/routes/:routeId/status
 * @desc    Update the status of a delivery route
 * @access  Private (Riders)
 */
router.patch('/routes/:routeId/status', authenticate, authorize('rider'), async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const { status } = req.body;

    if (isNaN(routeId)) {
      return res.status(400).json({
        error: 'Invalid route ID'
      });
    }

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
        message: 'Please provide a new status (pending, active, completed, or cancelled)'
      });
    }

    const updatedRoute = await RiderDashboardService.updateRouteStatus(
      routeId,
      req.user.id,
      status
    );

    res.json({
      message: `Route status updated to ${status}`,
      data: updatedRoute
    });
  } catch (error) {
    console.error('Update route status error:', {
      routeId: req.params.routeId,
      userId: req.user.id,
      error: error.message
    });

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message
      });
    }

    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        error: 'Bad request',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update route status',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/riders/active
 * @desc    Get all active riders with their current locations (Admin/Merchant)
 * @access  Private (Admin, Merchant)
 */
router.get('/active', authenticate, authorize('admin', 'merchant'), async (req, res) => {
  try {
    const locationService = new RiderLocationService();
    const riders = await locationService.getActiveRidersLocations();

    res.json({
      message: 'Active riders retrieved successfully',
      count: riders.length,
      data: riders
    });
  } catch (error) {
    console.error('Get active riders error:', error);
    res.status(500).json({
      error: 'Failed to fetch active riders',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/routes/geojson
 * @desc    Get rider's assigned routes as GeoJSON FeatureCollection with LineStrings
 * @access  Private (Riders only)
 * @returns {GeoJSON.FeatureCollection} Routes as LineStrings with delivery stops
 */
router.get('/routes/geojson', authenticate, authorize('rider'), async (req, res) => {
  try {
    const riderId = req.user.id;

    // Fetch rider's active routes from database
    const routesResult = await require('../config/database').query(
      `SELECT
        r.id,
        r.rider_id,
        r.route_coords,
        r.order_ids,
        r.distance_m,
        r.status,
        r.created_at,
        COUNT(DISTINCT o.id) as order_count,
        SUM(CASE WHEN o.order_status = 'delivered' THEN 1 ELSE 0 END) as completed_count
       FROM routes r
       LEFT JOIN orders o ON o.id = ANY(r.order_ids)
       WHERE r.rider_id = $1 AND r.status != 'cancelled'
       GROUP BY r.id, r.rider_id, r.route_coords, r.order_ids, r.distance_m, r.status, r.created_at
       ORDER BY r.created_at DESC`,
      [riderId]
    );

    // Convert routes to GeoJSON features
    const features = routesResult.rows.map((route, index) => {
      // Parse route_coords if it's a JSON string
      let coordinates = route.route_coords;
      if (typeof coordinates === 'string') {
        coordinates = JSON.parse(coordinates);
      }

      // Convert [lat, lon] to [lon, lat] for GeoJSON
      const geoJsonCoordinates = coordinates.map(coord => {
        if (Array.isArray(coord)) {
          return [coord[1], coord[0]]; // [lon, lat]
        }
        return coord;
      });

      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: geoJsonCoordinates
        },
        properties: {
          id: route.id,
          rider_id: route.rider_id,
          route_sequence: index + 1,
          distance_m: route.distance_m,
          status: route.status,
          order_count: parseInt(route.order_count) || 0,
          completed_count: parseInt(route.completed_count) || 0,
          completion_percentage: route.order_count > 0
            ? Math.round((parseInt(route.completed_count) || 0) / parseInt(route.order_count) * 100)
            : 0,
          stops: geoJsonCoordinates.length,
          created_at: route.created_at
        }
      };
    });

    // Return as GeoJSON FeatureCollection
    const geojson = {
      type: 'FeatureCollection',
      features: features,
      properties: {
        rider_id: riderId,
        total_routes: features.length,
        generated_at: new Date().toISOString()
      }
    };

    // Set caching headers
    res.set({
      'Cache-Control': 'public, max-age=60, s-maxage=300', // Short cache for real-time routes
      'Content-Type': 'application/geo+json'
    });

    res.json(geojson);
  } catch (error) {
    console.error('[Rider Routes GeoJSON] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch routes',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/rider/routes/:id/itinerary
 * @desc    Get detailed stop-by-stop itinerary for a route
 *          Shows order details, addresses, items, and coordinates for each stop
 * @access  Private (Riders only)
 * @params  id - Route ID
 * @returns {Array} - Itinerary with stop-by-stop details
 */
router.get('/routes/:id/itinerary', authenticate, authorize('rider'), async (req, res) => {
  try {
    const { id } = req.params;
    const routeId = parseInt(id, 10);

    if (!routeId || isNaN(routeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid route ID'
      });
    }

    const itinerary = await RouteOptimizationService.getRouteItinerary(routeId);

    // Fetch route details to enrich with ETA
    const routeResult = await db.query('SELECT * FROM delivery_routes WHERE id = $1', [routeId]);
    if (routeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    const route = routeResult.rows[0];

    // Enrich itinerary with ETA calculations
    const enrichedRoute = RouteOptimizationService.enrichRouteWithETA(route, itinerary);

    res.json({
      success: true,
      route_id: routeId,
      itinerary: enrichedRoute.itinerary,
      total_stops: enrichedRoute.itinerary.length,
      distance_info: enrichedRoute.distance_info,
      time_estimate: enrichedRoute.time_estimate
    });
  } catch (error) {
    console.error('[Rider Routes Itinerary] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route itinerary',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/rider/routes/:id/select
 * @desc    Select a route from primary/alternate options
 * @access  Private (Riders only)
 * @params  id - Route ID to select
 */
router.post('/routes/:id/select', authenticate, authorize('rider'), async (req, res) => {
  const riderId = req.user.id;
  const { id } = req.params;
  const routeId = parseInt(id, 10);

  if (!routeId || isNaN(routeId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid route ID'
    });
  }

  try {
    // Update route as selected
    const result = await db.query(
      'UPDATE delivery_routes SET is_selected = true WHERE id = $1 AND rider_id = $2 RETURNING *',
      [routeId, riderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route selected successfully',
      route: result.rows[0]
    });
  } catch (error) {
    console.error('Error selecting route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to select route',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/rider/routes/:id/start
 * @desc    Start delivering a route
 * @access  Private (Riders only)
 * @params  id - Route ID to start
 */
router.post('/routes/:id/start', authenticate, authorize('rider'), async (req, res) => {
  const riderId = req.user.id;
  const { id } = req.params;
  const routeId = parseInt(id, 10);

  if (!routeId || isNaN(routeId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid route ID'
    });
  }

  try {
    // Update route status to 'active' (updated_at is automatically set by trigger)
    const result = await db.query(
      'UPDATE delivery_routes SET status = $1 WHERE id = $2 AND rider_id = $3 RETURNING *',
      ['active', routeId, riderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route started successfully',
      route: result.rows[0]
    });
  } catch (error) {
    console.error('Error starting route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start route',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/rider/routes/:id/orders/:orderId/mark-delivered
 * @desc    Mark an order as delivered
 * @access  Private (Riders only)
 * @params  id - Route ID
 * @params  orderId - Order ID
 */
router.post('/routes/:id/orders/:orderId/mark-delivered', authenticate, authorize('rider'), async (req, res) => {
  const riderId = req.user.id;
  const { id, orderId } = req.params;
  const routeId = parseInt(id, 10);
  const orderIdInt = parseInt(orderId, 10);

  if (!routeId || isNaN(routeId) || !orderIdInt || isNaN(orderIdInt)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid route or order ID'
    });
  }

  try {
    // Update order status to 'delivered'
    const result = await db.query(
      `UPDATE orders SET order_status = $1, delivered_at = NOW()
       WHERE id = $2 AND id IN (
         SELECT UNNEST(order_ids) FROM delivery_routes WHERE id = $3 AND rider_id = $4
       ) RETURNING *`,
      ['delivered', orderIdInt, routeId, riderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found in this route'
      });
    }

    // Emit WebSocket event for real-time update
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${riderId}`).emit('order:delivered', {
        order_id: orderIdInt,
        route_id: routeId,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Order marked as delivered',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark delivery',
      message: error.message
    });
  }
});

module.exports = router;