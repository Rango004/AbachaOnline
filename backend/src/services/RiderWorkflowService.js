const db = require('../config/database');

class RiderWorkflowService {
  /**
   * Get rider's available orders (not claimed yet)
   */
  async getAvailableOrders(riderId) {
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
          u.phone as customer_phone,
          m.name as merchant_name
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN users m ON o.merchant_id = m.id
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
   * Get rider's active orders (claimed but not delivered)
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
          o.pickup_code,
          o.assigned_at,
          u.name as customer_name,
          u.phone as customer_phone,
          m.name as merchant_name
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN users m ON o.merchant_id = m.id
        WHERE o.rider_id = $1 
          AND o.order_status IN ('ready', 'in_delivery')
        ORDER BY o.assigned_at ASC
      `, [riderId]);

      const ordersWithItems = await Promise.all(result.rows.map(async order => {
        const items = await this.getOrderItems(order.id);
        return {
          ...order,
          tracking_number: this.maskTrackingNumber(order.tracking_number),
          items,
          rider_action: this.getRiderAction(order.order_status)
        };
      }));

      return ordersWithItems;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mask tracking number showing only last 4 characters
   */
  maskTrackingNumber(trackingNumber) {
    if (!trackingNumber || trackingNumber.length <= 4) return trackingNumber;
    const lastFour = trackingNumber.slice(-4);
    const masked = '*'.repeat(trackingNumber.length - 4);
    return masked + lastFour;
  }

  /**
   * Determine what action rider should take based on order status
   */
  getRiderAction(orderStatus) {
    switch (orderStatus) {
      case 'ready':
        return {
          action: 'enter_tracking_number',
          label: 'Enter Tracking Number',
          description: 'Verify the package tracking number to confirm pickup'
        };
      case 'in_delivery':
        return {
          action: 'enter_pickup_code',
          label: 'Enter Customer Pickup Code',
          description: 'Ask customer for their pickup code to verify delivery'
        };
      default:
        return null;
    }
  }

  /**
   * Get order detail for rider (shows tracking number field or pickup code field)
   */
  async getRiderOrderDetail(orderId, riderId) {
    try {
      const result = await db.query(`
        SELECT 
          o.id,
          o.tracking_number,
          o.order_status,
          o.total_amount,
          o.delivery_address,
          o.pickup_code,
          o.assigned_at,
          u.name as customer_name,
          u.phone as customer_phone,
          m.name as merchant_name
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN users m ON o.merchant_id = m.id
        WHERE o.id = $1 AND o.rider_id = $2
      `, [orderId, riderId]);

      if (result.rows.length === 0) {
        throw new Error('Order not found or not assigned to this rider');
      }

      const order = result.rows[0];
      
      return {
        ...order,
        rider_action: this.getRiderAction(order.order_status),
        items: await this.getOrderItems(orderId)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order items
   */
  async getOrderItems(orderId) {
    try {
      const result = await db.query(`
        SELECT 
          oi.id,
          oi.quantity,
          oi.unit_price,
          oi.subtotal,
          p.name as product_name,
          p.category
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [orderId]);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RiderWorkflowService();