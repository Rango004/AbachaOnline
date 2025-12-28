const db = require('../config/database');

class RiderAssignmentService {
  /**
   * Auto-assign rider to order based on zone proximity
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Assignment result
   */
  async autoAssignRider(orderId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Get order details with student's zone
      const orderResult = await client.query(
        `SELECT o.*, s.zone_id as student_zone_id, s.name as student_name
         FROM orders o
         LEFT JOIN users s ON o.student_id = s.id
         WHERE o.id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      if (order.rider_id) {
        throw new Error('Order already has a rider assigned');
      }

      const studentZoneId = order.student_zone_id;

      // Find available riders, prioritizing those in the same zone as the student
      const riderResult = await client.query(
        `SELECT u.id, u.name, u.phone, u.zone_id,
                COUNT(active_orders.id) as current_orders,
                CASE WHEN u.zone_id = $1 THEN 0 ELSE 1 END as zone_priority
         FROM users u
         LEFT JOIN orders active_orders ON u.id = active_orders.rider_id
           AND active_orders.order_status IN ('confirmed', 'preparing', 'ready', 'in_transit')
         WHERE u.role = 'rider'
           AND u.is_verified = true
         GROUP BY u.id, u.name, u.phone, u.zone_id
         HAVING COUNT(active_orders.id) < 10
         ORDER BY
           CASE WHEN u.zone_id = $1 THEN 0 ELSE 1 END,
           COUNT(active_orders.id) ASC,
           RANDOM()
         LIMIT 1`,
        [studentZoneId]
      );

      if (riderResult.rows.length === 0) {
        throw new Error('No available riders found');
      }

      const selectedRider = riderResult.rows[0];
      const isInSameZone = selectedRider.zone_priority === 0;

      // Assign rider to order
      // IMPORTANT: Explicitly set pickup_code to NULL to prevent database triggers from generating it
      // Pickup codes should ONLY be generated when rider picks up order (in_delivery status)
      const updateResult = await client.query(
        `UPDATE orders
         SET rider_id = $1, pickup_code = NULL, assigned_at = NOW(), updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [selectedRider.id, orderId]
      );

      // Record status change with zone information
      const assignmentNote = isInSameZone
        ? `Auto-assigned to rider: ${selectedRider.name} (same zone)`
        : `Auto-assigned to rider: ${selectedRider.name} (different zone - no riders available in student's zone)`;

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'system')`,
        [orderId, 'assigned', assignmentNote, selectedRider.id]
      );

      await client.query('COMMIT');

      return {
        order: updateResult.rows[0],
        assigned_rider: selectedRider,
        same_zone: isInSameZone,
        message: isInSameZone
          ? `Order automatically assigned to ${selectedRider.name} (same zone)`
          : `Order automatically assigned to ${selectedRider.name} (different zone)`
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get available riders in a zone
   * @param {number} zoneId - Zone ID
   * @returns {Promise<Array>} Available riders
   */
  async getAvailableRiders(zoneId) {
    try {
      const result = await db.query(
        `SELECT u.id, u.name, u.phone, u.zone_id,
                COUNT(active_orders.id) as current_orders
         FROM users u
         LEFT JOIN orders active_orders ON u.id = active_orders.rider_id 
           AND active_orders.order_status IN ('confirmed', 'preparing', 'ready', 'in_transit')
         WHERE u.role = 'rider' 
           AND u.is_verified = true
           AND (u.zone_id = $1 OR u.zone_id IS NULL)
         GROUP BY u.id, u.name, u.phone, u.zone_id
         HAVING COUNT(active_orders.id) < 10
         ORDER BY 
           CASE WHEN u.zone_id = $1 THEN 0 ELSE 1 END,
           COUNT(active_orders.id) ASC`,
        [zoneId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Manually assign rider to order
   * @param {number} orderId - Order ID
   * @param {number} riderId - Rider ID
   * @param {number} assignedBy - User ID who made the assignment
   * @returns {Promise<Object>} Assignment result
   */
  async assignRider(orderId, riderId, assignedBy) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Validate rider
      const riderCheck = await client.query(
        'SELECT id, name, role FROM users WHERE id = $1',
        [riderId]
      );

      if (riderCheck.rows.length === 0) {
        throw new Error('Rider not found');
      }

      if (riderCheck.rows[0].role !== 'rider') {
        throw new Error('User is not a rider');
      }

      // Check if order exists and is not already assigned
      const orderCheck = await client.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderCheck.rows.length === 0) {
        throw new Error('Order not found');
      }

      if (orderCheck.rows[0].rider_id) {
        throw new Error('Order already has a rider assigned');
      }

      // Assign rider
      const result = await client.query(
        `UPDATE orders 
         SET rider_id = $1, assigned_at = NOW(), updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [riderId, orderId]
      );

      // Record status change
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'admin')`,
        [orderId, 'assigned', `Manually assigned to rider: ${riderCheck.rows[0].name}`, assignedBy]
      );

      await client.query('COMMIT');

      return {
        order: result.rows[0],
        assigned_rider: riderCheck.rows[0],
        message: `Order assigned to ${riderCheck.rows[0].name}`
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get rider's current orders
   * @param {number} riderId - Rider ID
   * @returns {Promise<Array>} Current orders
   */
  async getRiderOrders(riderId) {
    try {
      const result = await db.query(
        `SELECT o.*, 
                u.name as customer_name,
                u.phone as customer_phone
         FROM orders o
         LEFT JOIN users u ON o.student_id = u.id
         WHERE o.rider_id = $1 
           AND o.order_status IN ('confirmed', 'preparing', 'ready', 'in_transit')
         ORDER BY o.assigned_at ASC`,
        [riderId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get rider performance stats
   * @param {number} riderId - Rider ID
   * @param {Object} filters - Date filters
   * @returns {Promise<Object>} Performance stats
   */
  async getRiderStats(riderId, filters = {}) {
    try {
      const { start_date, end_date } = filters;
      
      let query = `
        SELECT 
          COUNT(*) as total_deliveries,
          COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as completed_deliveries,
          AVG(EXTRACT(EPOCH FROM (delivered_at - assigned_at))/60) as avg_delivery_time_minutes,
          COUNT(CASE WHEN delivered_at <= (assigned_at + INTERVAL '60 minutes') THEN 1 END) as on_time_deliveries
        FROM orders 
        WHERE rider_id = $1
      `;
      const params = [riderId];
      let paramIndex = 2;

      if (start_date) {
        query += ` AND assigned_at >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND assigned_at <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      const result = await db.query(query, params);
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
}

module.exports = new RiderAssignmentService();