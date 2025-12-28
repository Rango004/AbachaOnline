const db = require('../config/database');
const SettingsService = require('./SettingsService');

class RiderDashboardService {
  /**
   * Get rider dashboard with statistics, optimized routes, and available orders
   * Enhanced with routing algorithm performance metrics
   */
  async getRiderDashboard(riderId) {
    try {
      const [stats, activeOrders, availableOrders, earnings, optimizedRoutes, todayMetrics, routingPerformance] = await Promise.all([
        this.getRiderStats(riderId),
        this.getActiveOrders(riderId),
        this.getAvailableOrders(),
        this.getRiderEarnings(riderId),
        this.getOptimizedRoutes(riderId),
        this.getTodayMetrics(riderId),
        this.getRoutingPerformance(riderId)
      ]);

      return {
        statistics: stats,
        today_metrics: todayMetrics,
        routing_performance: routingPerformance,
        active_orders: activeOrders,
        optimized_routes: optimizedRoutes,
        available_orders: availableOrders,
        earnings: earnings
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get rider performance statistics
   */
  async getRiderStats(riderId) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_deliveries,
          COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as completed_deliveries,
          COUNT(CASE WHEN order_status IN ('in_transit', 'ready') THEN 1 END) as active_deliveries,
          AVG(EXTRACT(EPOCH FROM (delivered_at - assigned_at))/60) as avg_delivery_time_minutes,
          COUNT(CASE WHEN delivered_at <= (assigned_at + INTERVAL '60 minutes') THEN 1 END) as on_time_deliveries,
          MAX(delivered_at) as last_delivery
        FROM orders 
        WHERE rider_id = $1
      `, [riderId]);

      const stats = result.rows[0];
      
      // Calculate performance metrics
      const completionRate = stats.total_deliveries > 0 
        ? (stats.completed_deliveries / stats.total_deliveries * 100).toFixed(2)
        : 0;

      const onTimeRate = stats.completed_deliveries > 0
        ? (stats.on_time_deliveries / stats.completed_deliveries * 100).toFixed(2)
        : 0;

      return {
        ...stats,
        completion_rate: parseFloat(completionRate),
        on_time_rate: parseFloat(onTimeRate),
        avg_delivery_time_minutes: stats.avg_delivery_time_minutes ? 
          parseFloat(stats.avg_delivery_time_minutes).toFixed(2) : null
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get rider's active orders
   */
  async getActiveOrders(riderId) {
    try {
      const result = await db.query(`
        SELECT 
          o.id,
          o.tracking_number,
          o.order_status,
          o.total_amount,
          o.delivery_address,
          o.assigned_at,
          o.created_at,
          u.name as customer_name,
          u.phone as customer_phone,
          m.name as merchant_name
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN users m ON o.merchant_id = m.id
        WHERE o.rider_id = $1 
          AND o.order_status IN ('confirmed', 'preparing', 'ready', 'in_delivery')
        ORDER BY o.assigned_at ASC
      `, [riderId]);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available orders for assignment
   */
  async getAvailableOrders() {
    try {
      const result = await db.query(`
        SELECT 
          o.id,
          o.tracking_number,
          o.order_status,
          o.total_amount,
          o.delivery_address,
          o.created_at,
          u.name as customer_name,
          m.name as merchant_name,
          z.name as zone_name
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN users m ON o.merchant_id = m.id
        LEFT JOIN users mz ON o.merchant_id = mz.id
        LEFT JOIN zones z ON mz.zone_id = z.id
        WHERE o.rider_id IS NULL 
          AND o.order_status IN ('pending', 'confirmed', 'ready')
        ORDER BY o.created_at ASC
        LIMIT 20
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get rider earnings (if there's a delivery fee system)
   */
  async getRiderEarnings(riderId) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as completed_deliveries,
          COUNT(CASE WHEN order_status = 'delivered' AND delivered_at >= CURRENT_DATE THEN 1 END) as today_deliveries,
          COUNT(CASE WHEN order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_deliveries,
          COUNT(CASE WHEN order_status = 'delivered' AND delivered_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_deliveries
        FROM orders 
        WHERE rider_id = $1
      `, [riderId]);

      const stats = result.rows[0];
      // Fetch delivery fee from system settings (configurable by admin)
      const deliveryFee = await SettingsService.getRiderDeliveryFee();

      return {
        total_earnings: stats.completed_deliveries * deliveryFee,
        today_earnings: stats.today_deliveries * deliveryFee,
        week_earnings: stats.week_deliveries * deliveryFee,
        month_earnings: stats.month_deliveries * deliveryFee,
        delivery_fee: deliveryFee,
        ...stats
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get optimized delivery routes for a rider
   * Enhanced to show routing algorithm metrics and efficiency
   */
  async getOptimizedRoutes(riderId) {
    try {
      const result = await db.query(`
        SELECT
          dr.id,
          dr.merchant_id,
          dr.status,
          dr.total_distance_m,
          dr.route_coordinates,
          dr.order_ids,
          dr.created_at,
          dr.updated_at,
          u.name as merchant_name,
          COUNT(o.id) as order_count,
          COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as completed_count,
          ROUND(100.0 * COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) /
            NULLIF(COUNT(o.id), 0), 2) as completion_percentage,
          ROUND(dr.total_distance_m::numeric / NULLIF(COUNT(o.id), 0), 2) as distance_per_delivery
        FROM delivery_routes dr
        LEFT JOIN users u ON dr.merchant_id = u.id
        LEFT JOIN orders o ON o.id = ANY(dr.order_ids)
        WHERE dr.rider_id = $1
          AND dr.status IN ('pending', 'active')
        GROUP BY dr.id, u.name, dr.total_distance_m
        ORDER BY dr.created_at DESC
      `, [riderId]);

      // Enhance results with routing algorithm quality indicators
      const enhancedRoutes = result.rows.map(route => ({
        ...route,
        order_count: parseInt(route.order_count) || 0,
        completed_count: parseInt(route.completed_count) || 0,
        completion_percentage: parseFloat(route.completion_percentage) || 0,
        distance_per_delivery: parseFloat(route.distance_per_delivery) || 0,
        routing_metrics: {
          total_distance_m: route.total_distance_m || 0,
          distance_per_delivery: parseFloat(route.distance_per_delivery) || 0,
          deliveries_count: parseInt(route.order_count) || 0,
          completed_deliveries: parseInt(route.completed_count) || 0,
          algorithm_quality: this.estimateAlgorithmQuality(route.order_count, route.total_distance_m)
        }
      }));

      return enhancedRoutes;
    } catch (error) {
      console.error('Error fetching optimized routes:', error);
      throw error;
    }
  }

  /**
   * Estimate algorithm quality based on route characteristics
   */
  estimateAlgorithmQuality(deliveryCount, totalDistance) {
    if (!deliveryCount || deliveryCount === 0) {
      return { algorithm: 'unknown', quality: 'N/A', efficiency_class: 'unknown' };
    }

    const distancePerDelivery = totalDistance / deliveryCount;

    // Heuristic estimation based on typical campus delivery patterns
    // Clarke-Wright: 80-90% optimal, typically 2-3km per delivery on campus
    // Nearest Neighbor: 60-80% optimal, typically 3-4km per delivery on campus

    if (distancePerDelivery < 2500) {
      return {
        algorithm: 'clarke_wright',
        quality: '80-90% optimal',
        efficiency_class: 'highly_efficient',
        notes: 'Clarke-Wright Savings Algorithm likely used'
      };
    } else if (distancePerDelivery < 3500) {
      return {
        algorithm: 'nearest_neighbor',
        quality: '60-80% optimal',
        efficiency_class: 'efficient',
        notes: 'Nearest Neighbor or fallback algorithm likely used'
      };
    } else {
      return {
        algorithm: 'fallback',
        quality: '60-75% optimal',
        efficiency_class: 'standard',
        notes: 'Simple assignment algorithm used'
      };
    }
  }

  /**
   * Get today's delivery metrics for a rider
   */
  async getTodayMetrics(riderId) {
    try {
      const result = await db.query(`
        SELECT
          COUNT(CASE WHEN o.delivered_at >= CURRENT_DATE THEN 1 END) as delivered_today,
          COUNT(CASE WHEN o.order_status IN ('in_delivery', 'ready') AND o.delivered_at < CURRENT_DATE THEN 1 END) as in_progress_today,
          COUNT(CASE WHEN o.order_status IN ('confirmed', 'preparing') AND o.delivered_at < CURRENT_DATE THEN 1 END) as pending_today,
          SUM(CASE WHEN o.delivered_at >= CURRENT_DATE THEN o.total_amount ELSE 0 END) as total_revenue_today,
          COUNT(DISTINCT CASE WHEN o.delivered_at >= CURRENT_DATE THEN o.merchant_id END) as merchants_served_today,
          COUNT(DISTINCT CASE WHEN o.delivered_at >= CURRENT_DATE THEN o.student_id END) as customers_served_today
        FROM orders o
        WHERE o.rider_id = $1
      `, [riderId]);

      const metrics = result.rows[0];
      return {
        delivered_today: parseInt(metrics.delivered_today) || 0,
        in_progress_today: parseInt(metrics.in_progress_today) || 0,
        pending_today: parseInt(metrics.pending_today) || 0,
        total_revenue_today: parseFloat(metrics.total_revenue_today) || 0,
        merchants_served_today: parseInt(metrics.merchants_served_today) || 0,
        customers_served_today: parseInt(metrics.customers_served_today) || 0
      };
    } catch (error) {
      console.error('Error fetching today metrics:', error);
      throw error;
    }
  }

  /**
   * Get routing performance metrics for a rider
   * Shows efficiency of routes generated by Clarke-Wright and other algorithms
   */
  async getRoutingPerformance(riderId) {
    try {
      const result = await db.query(`
        SELECT
          COUNT(dr.id) as total_routes,
          COUNT(CASE WHEN dr.status = 'completed' THEN 1 END) as completed_routes,
          COUNT(CASE WHEN dr.status = 'active' THEN 1 END) as active_routes,
          COUNT(CASE WHEN dr.status = 'pending' THEN 1 END) as pending_routes,
          ROUND(AVG(dr.total_distance_m)::numeric, 2) as avg_distance_per_route,
          ROUND(MIN(dr.total_distance_m)::numeric, 2) as min_distance,
          ROUND(MAX(dr.total_distance_m)::numeric, 2) as max_distance,
          SUM(ARRAY_LENGTH(dr.order_ids, 1)) as total_deliveries_assigned,
          ROUND(AVG(ARRAY_LENGTH(dr.order_ids, 1))::numeric, 2) as avg_deliveries_per_route
        FROM delivery_routes dr
        WHERE dr.rider_id = $1
          AND dr.created_at >= CURRENT_DATE - INTERVAL '30 days'
      `, [riderId]);

      const perf = result.rows[0];

      if (!perf || perf.total_routes === 0) {
        return {
          total_routes: 0,
          efficiency_score: 0,
          algorithm_summary: 'No routes available',
          metrics: {
            completed_routes: 0,
            active_routes: 0,
            pending_routes: 0,
            avg_distance_per_route: 0,
            avg_deliveries_per_route: 0
          }
        };
      }

      // Calculate efficiency score based on deliveries per kilometer
      const totalDistance = perf.total_routes > 0 ? perf.total_routes * perf.avg_distance_per_route : 0;
      const efficiencyScore = totalDistance > 0
        ? Math.round((perf.total_deliveries_assigned / totalDistance) * 1000)
        : 0;

      return {
        total_routes: parseInt(perf.total_routes) || 0,
        completed_routes: parseInt(perf.completed_routes) || 0,
        active_routes: parseInt(perf.active_routes) || 0,
        pending_routes: parseInt(perf.pending_routes) || 0,
        efficiency_score: efficiencyScore,
        efficiency_grade: this.getEfficiencyGrade(efficiencyScore),
        metrics: {
          avg_distance_per_route: parseFloat(perf.avg_distance_per_route) || 0,
          min_distance: parseFloat(perf.min_distance) || 0,
          max_distance: parseFloat(perf.max_distance) || 0,
          total_deliveries_assigned: parseInt(perf.total_deliveries_assigned) || 0,
          avg_deliveries_per_route: parseFloat(perf.avg_deliveries_per_route) || 0
        },
        algorithm_summary: 'Using Clarke-Wright Savings with Nearest Neighbor fallback',
        period: 'Last 30 days'
      };
    } catch (error) {
      console.error('Error fetching routing performance:', error);
      throw error;
    }
  }

  /**
   * Convert efficiency score to letter grade
   */
  getEfficiencyGrade(score) {
    if (score >= 40) return { grade: 'A', label: 'Excellent', color: 'green' };
    if (score >= 35) return { grade: 'B', label: 'Very Good', color: 'light_green' };
    if (score >= 30) return { grade: 'C', label: 'Good', color: 'yellow' };
    if (score >= 25) return { grade: 'D', label: 'Fair', color: 'orange' };
    return { grade: 'F', label: 'Needs Improvement', color: 'red' };
  }

  /**
   * Get detailed route information with all orders and customer details
   */
  async getRouteDetails(routeId, riderId) {
    try {
      const routeResult = await db.query(`
        SELECT
          dr.id,
          dr.merchant_id,
          dr.status,
          dr.total_distance_m,
          dr.route_coordinates,
          dr.order_ids,
          dr.created_at,
          dr.updated_at,
          u.name as merchant_name,
          u.phone as merchant_phone
        FROM delivery_routes dr
        LEFT JOIN users u ON dr.merchant_id = u.id
        WHERE dr.id = $1 AND dr.rider_id = $2
      `, [routeId, riderId]);

      if (routeResult.rows.length === 0) {
        throw new Error('Route not found or not assigned to this rider');
      }

      const route = routeResult.rows[0];

      // Get all orders in this route with customer and delivery details
      const ordersResult = await db.query(`
        SELECT
          o.id,
          o.tracking_number,
          o.order_status,
          o.total_amount,
          o.delivery_address,
          o.created_at,
          o.assigned_at,
          o.delivered_at,
          u.name as customer_name,
          u.phone as customer_phone,
          sa.latitude,
          sa.longitude,
          sa.building_name,
          sa.room_number,
          EXTRACT(EPOCH FROM (NOW() - o.assigned_at))/60 as minutes_on_route
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN student_addresses sa ON sa.address_label = o.delivery_address
                                       AND sa.student_id = o.student_id
        WHERE o.id = ANY($1::int[])
        ORDER BY ARRAY_POSITION($1::int[], o.id)
      `, [route.order_ids]);

      return {
        ...route,
        orders: ordersResult.rows
      };
    } catch (error) {
      console.error('Error fetching route details:', error);
      throw error;
    }
  }

  /**
   * Update route status (pending -> active -> completed)
   */
  async updateRouteStatus(routeId, riderId, newStatus) {
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];

    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Check if route belongs to this rider
      const routeCheck = await client.query(
        'SELECT * FROM delivery_routes WHERE id = $1 AND rider_id = $2',
        [routeId, riderId]
      );

      if (routeCheck.rows.length === 0) {
        throw new Error('Route not found or not assigned to this rider');
      }

      // Update route status
      const updateResult = await client.query(
        'UPDATE delivery_routes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newStatus, routeId]
      );

      // Update all orders in route if completed
      if (newStatus === 'completed') {
        const route = routeCheck.rows[0];
        for (const orderId of route.order_ids) {
          await client.query(
            'UPDATE orders SET order_status = $1, delivered_at = NOW() WHERE id = $2',
            ['delivered', orderId]
          );
        }
      }

      await client.query('COMMIT');

      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Claim an available order
   */
  async claimOrder(orderId, riderId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Check if order is still available
      const orderCheck = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND rider_id IS NULL',
        [orderId]
      );

      if (orderCheck.rows.length === 0) {
        throw new Error('Order not available or already assigned');
      }

      // Assign rider
      await client.query(
        'UPDATE orders SET rider_id = $1, assigned_at = NOW() WHERE id = $2',
        [riderId, orderId]
      );

      // Record in history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, 'claimed', 'Order claimed by rider', riderId, 'rider']
      );

      await client.query('COMMIT');

      return { message: 'Order claimed successfully', order_id: orderId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new RiderDashboardService();