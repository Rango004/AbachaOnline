const db = require('../config/database');
const crypto = require('crypto');
const RiderAssignmentService = require('./RiderAssignmentService');
const RouteOptimizationService = require('./RouteOptimizationService');
const MerchantPaymentService = require('./MerchantPaymentService');
const FirebaseService = require('./FirebaseService');
const NotificationService = require('./NotificationService');

class OrderService {
  constructor() {
    this.wsService = null;
  }

  setWebSocketService(wsService) {
    this.wsService = wsService;
  }
  async createOrder(userId, orderData) {
    const client = await db.getClient();

    try {
      // Use SERIALIZABLE isolation to prevent stock overselling race conditions
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      const { items, delivery_address, notes } = orderData;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Order must contain at least one item');
      }

      if (!delivery_address) {
        throw new Error('Delivery address is required');
      }

      let totalAmount = 0;
      const validatedItems = [];
      let merchantId = null;

      for (const item of items) {
        const productResult = await client.query(
          'SELECT * FROM products WHERE id = $1 AND is_active = true',
          [item.product_id]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found or inactive`);
        }

        const product = productResult.rows[0];
        
        if (merchantId === null) {
          merchantId = product.merchant_id;
        } else if (merchantId !== product.merchant_id) {
          throw new Error('All items in an order must be from the same merchant');
        }

        // Validate quantity is a positive integer
        if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
          throw new Error('Quantity must be a positive integer');
        }
        const quantity = Number(item.quantity);

        if (product.stock_quantity !== null && product.stock_quantity < quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`);
        }

        const subtotal = product.price * quantity;
        totalAmount += subtotal;

        validatedItems.push({
          product_id: product.id,
          quantity,
          price: product.price,
          subtotal
        });
      }

      // Generate cryptographically secure tracking number
      const trackingNumber = 'WG' + crypto.randomBytes(8).toString('hex').toUpperCase();

      // Note: Pickup code will be generated when rider picks up the order (in_delivery status)
      // This prevents customer confusion about delivery status

      const orderResult = await client.query(
        `INSERT INTO orders (student_id, merchant_id, total_amount, delivery_address, delivery_notes, tracking_number, order_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [userId, merchantId, totalAmount, delivery_address, notes, trackingNumber]
      );

      const order = orderResult.rows[0];

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, 'pending', 'Order created', userId, 'student']
      );

      for (const item of validatedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.quantity, item.price, item.subtotal]
        );

        // Deduct stock with safety check: ensure stock never goes negative
        const stockUpdateResult = await client.query(
          `UPDATE products
           SET stock_quantity = stock_quantity - $1
           WHERE id = $2 AND stock_quantity IS NOT NULL AND stock_quantity >= $1
           RETURNING stock_quantity`,
          [item.quantity, item.product_id]
        );

        // Verify the update actually occurred (stock was sufficient)
        if (stockUpdateResult.rows.length === 0) {
          throw new Error(`Stock update failed for product ${item.product_id}. Insufficient inventory at time of order.`);
        }
      }

      await client.query('COMMIT');

      // Send push notification to merchant about new order
      try {
        await NotificationService.createNotification(
          merchantId,
          'new_order',
          '🛒 New Order Received',
          `Order #${trackingNumber} - ${validatedItems.length} item(s) - SLL ${totalAmount.toLocaleString()}`,
          {
            orderId: order.id,
            trackingNumber: trackingNumber,
            totalAmount: totalAmount,
            itemCount: validatedItems.length
          }
        );
      } catch (notifError) {
        console.error('[OrderService] Merchant notification failed:', notifError.message);
      }

      try {
        console.log('Attempting auto-assignment for order:', order.id);
        const assignment = await RiderAssignmentService.autoAssignRider(order.id);
        console.log('Auto-assignment successful:', assignment.message);

        // Send push notification to rider
        if (assignment.assigned_rider) {
          try {
            const orderDetails = await this.getOrderById(order.id, userId);

            // Use NotificationService for push notifications
            await NotificationService.createNotification(
              assignment.assigned_rider.id,
              'order_assigned',
              '🚚 New Delivery Assigned',
              `Order #${orderDetails.tracking_number} - Pickup: ${orderDetails.merchant_name}`,
              {
                orderId: order.id,
                trackingNumber: orderDetails.tracking_number,
                customerName: orderDetails.customer_name,
                customerPhone: orderDetails.customer_phone,
                deliveryAddress: orderDetails.delivery_address,
                totalAmount: orderDetails.total_amount,
                merchantName: orderDetails.merchant_name
              }
            );

            await RouteOptimizationService.sendRouteInstructions(order.id, assignment.assigned_rider);
          } catch (error) {
            console.error('Notification failed:', error.message);
          }
        }
      } catch (assignmentError) {
        console.error('Auto-assignment failed:', assignmentError.message);
      }

      return await this.getOrderById(order.id, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrderById(orderId, userId) {
    try {
      const orderResult = await db.query(
        `SELECT o.id, o.student_id, o.merchant_id, o.total_amount, o.payment_method, o.payment_status,
                o.order_status, o.delivery_address, o.delivery_notes, o.tracking_number, o.pickup_code,
                o.rider_id, o.assigned_at, o.picked_up_at, o.delivered_at,
                o.created_at, o.updated_at,
                u.name as customer_name,
                u.phone as customer_phone,
                m.name as merchant_name,
                m.phone as merchant_phone,
                r.name as rider_name,
                r.phone as rider_phone
         FROM orders o
         LEFT JOIN users u ON o.student_id = u.id
         LEFT JOIN users m ON o.merchant_id = m.id
         LEFT JOIN users r ON o.rider_id = r.id
         WHERE o.id = $1`,
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      if (userId) {
        const userResult = await db.query(
          'SELECT role FROM users WHERE id = $1',
          [userId]
        );

        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }

        const userRole = userResult.rows[0].role;

        if (userRole !== 'admin' && order.student_id !== userId && order.merchant_id !== userId && order.rider_id !== userId) {
          throw new Error('Unauthorized to view this order');
        }
      }

      const itemsResult = await db.query(
        `SELECT oi.*,
                p.name as product_name,
                p.category as product_category,
                u.name as merchant_name,
                u.phone as merchant_phone
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN users u ON p.merchant_id = u.id
         WHERE oi.order_id = $1
         ORDER BY oi.id`,
        [orderId]
      );

      order.items = itemsResult.rows;

      // CRITICAL: Remove pickup code if order hasn't been picked up yet
      // Pickup codes should ONLY appear when status is 'in_delivery' or 'delivered'
      // This filters out any codes generated by database triggers or other processes
      if (!['in_delivery', 'delivered'].includes(order.order_status)) {
        order.pickup_code = null;
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrders(userId, filters = {}) {
    try {
      const { status, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT o.id, o.student_id, o.total_amount, o.payment_method, o.payment_status,
               o.order_status, o.delivery_address, o.delivery_notes, o.tracking_number,
               o.created_at, o.updated_at
        FROM orders o
        WHERE o.student_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (status) {
        query += ` AND o.order_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getMerchantOrders(merchantId, filters = {}) {
    try {
      const { status, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT o.id, o.student_id, o.total_amount, o.payment_method, o.payment_status,
               o.order_status, o.delivery_address, o.tracking_number,
               o.created_at, o.updated_at,
               u.name as customer_name,
               u.phone as customer_phone
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        WHERE o.merchant_id = $1
      `;
      const params = [merchantId];
      let paramIndex = 2;

      if (status) {
        query += ` AND o.order_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getAllOrders(filters = {}) {
    try {
      const { status, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT o.id, o.student_id, o.merchant_id, o.total_amount, o.payment_method, o.payment_status,
               o.order_status, o.delivery_address, o.tracking_number,
               o.created_at, o.updated_at,
               u.name as customer_name,
               m.name as merchant_name
        FROM orders o
        LEFT JOIN users u ON o.student_id = u.id
        LEFT JOIN users m ON o.merchant_id = m.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND o.order_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async verifyPickupCode(orderId, trackingNumber, riderId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const orderCheck = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND rider_id = $2',
        [orderId, riderId]
      );

      if (orderCheck.rows.length === 0) {
        throw new Error('Order not found or not assigned to this rider');
      }

      const order = orderCheck.rows[0];

      // Verify tracking number for merchant identification
      const normalizedInput = trackingNumber.trim().toUpperCase().replace(/[-\s]/g, '');
      const normalizedStored = (order.tracking_number || '').toUpperCase().replace(/[-\s]/g, '');

      if (normalizedStored !== normalizedInput) {
        throw new Error('Invalid tracking number');
      }

      if (order.order_status !== 'ready') {
        throw new Error(`Order is not ready for pickup. Current status: ${order.order_status}`);
      }

      // Generate pickup code when rider picks up order
      const crypto = require('crypto');
      const pickupCode = crypto.randomInt(100000, 999999).toString().padStart(6, '0');

      const result = await client.query(
        `UPDATE orders
         SET order_status = 'in_delivery', pickup_code = $1, picked_up_at = NOW(), updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [pickupCode, orderId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, 'in_delivery', 'Rider verified tracking number and picked up order', riderId, 'rider']
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify pickup code for delivery completion
   * Uses 6-digit pickup code provided by customer to confirm delivery
   */
  async verifyPickupCodeForDelivery(orderId, pickupCode, riderId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const orderCheck = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND rider_id = $2',
        [orderId, riderId]
      );

      if (orderCheck.rows.length === 0) {
        throw new Error('Order not found or not assigned to this rider');
      }

      const order = orderCheck.rows[0];

      // Verify pickup code matches (customer-provided 6-digit code)
      if (!order.pickup_code) {
        throw new Error('No pickup code available for this order');
      }

      const providedCode = String(pickupCode).trim();
      const storedCode = String(order.pickup_code).trim();

      if (storedCode !== providedCode) {
        throw new Error('Invalid pickup code');
      }

      if (order.order_status !== 'in_delivery') {
        throw new Error(`Order is not in delivery. Current status: ${order.order_status}`);
      }

      const result = await client.query(
        `UPDATE orders
         SET order_status = 'delivered', delivered_at = NOW(), updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [orderId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, 'delivered', 'Rider verified pickup code and completed delivery', riderId, 'rider']
      );

      // Check if this order is part of a delivery route and auto-complete route if all orders are delivered
      await this.checkAndCompleteRoute(client, orderId, riderId);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async verifyDelivery(orderId, pickupCode, riderId) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const orderCheck = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND rider_id = $2',
        [orderId, riderId]
      );

      if (orderCheck.rows.length === 0) {
        throw new Error('Order not found or not assigned to this rider');
      }

      const order = orderCheck.rows[0];

      if (order.pickup_code !== pickupCode) {
        throw new Error('Invalid pickup code');
      }

      if (order.order_status !== 'in_delivery') {
        throw new Error('Order is not in delivery');
      }

      const result = await client.query(
        `UPDATE orders
         SET order_status = 'delivered', delivered_at = NOW(), updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [orderId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, 'delivered', 'Customer verified with pickup code', riderId, 'rider']
      );

      // Check if this order is part of a delivery route and auto-complete route if all orders are delivered
      await this.checkAndCompleteRoute(client, orderId, riderId);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(orderId, newStatus, userId, wsService = null) {
    // Use provided wsService or fall back to instance wsService
    const webSocketService = wsService || this.wsService;
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const orderCheck = await client.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderCheck.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderCheck.rows[0];
      const oldStatus = order.order_status;

      const userResult = await client.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userRole = userResult.rows[0].role;

      if (userRole !== 'admin') {
        if (userRole === 'student') {
          if (order.student_id !== userId) {
            throw new Error('You can only manage your own orders');
          }
          if (newStatus !== 'cancelled' || order.order_status !== 'pending') {
            throw new Error('You can only cancel pending orders');
          }
        }
        else if (userRole === 'merchant') {
          const allowedStatuses = ['confirmed', 'preparing', 'ready'];
          if (!allowedStatuses.includes(newStatus)) {
            throw new Error('Merchants can only update status to: confirmed, preparing, ready');
          }
        }
        else if (userRole === 'rider') {
          const allowedStatuses = ['in_delivery', 'delivered'];
          if (!allowedStatuses.includes(newStatus)) {
            throw new Error('Riders can only update status to: in_delivery, delivered');
          }
        } else {
          throw new Error('Unauthorized to update order status');
        }
      }

      // Generate pickup code when rider picks up the order (transitions to in_delivery)
      let updateQuery = `UPDATE orders SET order_status = $1, updated_at = NOW()`;
      let updateParams = [newStatus];
      let paramIndex = 2;

      if (newStatus === 'in_delivery') {
        // Generate secure 6-digit pickup code when rider picks up order
        const pickupCode = crypto.randomInt(100000, 999999).toString().padStart(6, '0');
        updateQuery += `, pickup_code = $${paramIndex}`;
        updateParams.push(pickupCode);
        paramIndex++;
      }

      updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
      updateParams.push(orderId);

      const result = await client.query(updateQuery, updateParams);
      const updatedOrder = result.rows[0];

      await client.query(
        `INSERT INTO order_status_history (order_id, status, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4)`,
        [orderId, newStatus, userId, userRole]
      );

      if (newStatus === 'delivered') {
        // Process merchant payment immediately
        try {
          await MerchantPaymentService.processMerchantPayment(orderId);
          console.log(`Merchant payment processed for order ${orderId}`);
        } catch (paymentError) {
          console.error('Merchant payment failed:', paymentError.message);
          // Don't fail the status update if payment fails
        }

        // Check if this order is part of a delivery route and auto-complete route if all orders are delivered
        await this.checkAndCompleteRoute(client, orderId, order.rider_id);
      }

      if (newStatus === 'cancelled') {
        await client.query(
          `UPDATE escrow
           SET status = 'refunded', released_at = NOW()
           WHERE order_id = $1 AND status = 'held'`,
          [orderId]
        );

        await client.query(
          `UPDATE products p
           SET stock_quantity = stock_quantity + oi.quantity
           FROM order_items oi
           WHERE p.id = oi.product_id AND oi.order_id = $1 AND p.stock_quantity IS NOT NULL`,
          [orderId]
        );
      }

      await client.query('COMMIT');

      // Send WebSocket notifications after successful database update
      if (webSocketService) {
        try {
          // Broadcast order status update to all relevant parties
          webSocketService.broadcastOrderUpdate(orderId, {
            event_type: 'order_status_updated',
            order_id: orderId,
            previous_status: oldStatus,
            new_status: newStatus,
            updated_by_id: userId,
            updated_by_role: userRole,
            timestamp: new Date()
          });

          // Send notification to customer about status change
          const statusMessages = {
            pending: 'Your order has been received',
            confirmed: 'Your order has been confirmed by the merchant',
            preparing: 'Your order is being prepared',
            ready: 'Your order is ready for pickup',
            in_delivery: 'Your order is on the way to you',
            delivered: 'Your order has been delivered successfully',
            cancelled: 'Your order has been cancelled'
          };

          await webSocketService.sendNotificationToUser(updatedOrder.student_id, {
            type: 'order_status_update',
            title: 'Order Status Updated',
            message: statusMessages[newStatus] || `Order status: ${newStatus}`,
            data: {
              order_id: orderId,
              tracking_number: updatedOrder.tracking_number,
              status: newStatus,
              previous_status: oldStatus
            }
          });

          // Send specific notifications based on status
          if (newStatus === 'ready' && updatedOrder.rider_id) {
            // Notify rider that order is ready for pickup
            await webSocketService.sendNotificationToUser(updatedOrder.rider_id, {
              type: 'order_ready_pickup',
              title: 'Order Ready for Pickup',
              message: `Order #${updatedOrder.tracking_number} is ready for pickup`,
              data: {
                order_id: orderId,
                tracking_number: updatedOrder.tracking_number,
                merchant_id: updatedOrder.merchant_id
              }
            });
          }

          if (newStatus === 'in_delivery') {
            // Notify customer that delivery is starting
            await webSocketService.sendNotificationToUser(updatedOrder.student_id, {
              type: 'delivery_started',
              title: 'Delivery Started',
              message: `Your order #${updatedOrder.tracking_number} is now being delivered. Pickup code: ${updatedOrder.pickup_code}`,
              data: {
                order_id: orderId,
                tracking_number: updatedOrder.tracking_number,
                pickup_code: updatedOrder.pickup_code,
                rider_id: updatedOrder.rider_id
              }
            });
          }

        } catch (wsError) {
          console.error('WebSocket notification failed:', wsError.message);
          // Don't fail the status update if WebSocket fails
        }
      }

      // Send push notifications
      try {
        const statusMessages = {
          pending: { title: '📦 Order Placed', body: 'Your order has been placed successfully' },
          confirmed: { title: '✅ Order Confirmed', body: 'Your order has been confirmed by the merchant' },
          preparing: { title: '👨‍🍳 Order Preparing', body: 'Your order is being prepared' },
          ready: { title: '🎉 Order Ready', body: 'Your order is ready for pickup' },
          in_delivery: { title: '🚚 Out for Delivery', body: 'Your order is on its way' },
          delivered: { title: '✅ Order Delivered', body: 'Your order has been delivered' },
          cancelled: { title: '❌ Order Cancelled', body: 'Your order has been cancelled' }
        };

        const message = statusMessages[newStatus];
        if (message) {
          await NotificationService.createNotification(
            updatedOrder.student_id,
            'order_status',
            message.title,
            message.body,
            { orderId: orderId, status: newStatus, trackingNumber: updatedOrder.tracking_number }
          );
        }
      } catch (pushError) {
        console.error('[OrderService] Push notification failed:', pushError.message);
        // Don't fail the status update if push notification fails
      }

      return updatedOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async autoAssignRider(orderId, assignedBy) {
    const assignment = await RiderAssignmentService.autoAssignRider(orderId);

    // Send notification to rider
    if (assignment.assigned_rider) {
      try {
        const order = await this.getOrderById(orderId);
        // Use NotificationService for proper WebSocket and push notification delivery
        await NotificationService.createNotification(
          assignment.assigned_rider.id,
          'order_assigned',
          '🚚 New Delivery Assigned',
          `Order #${order.tracking_number} - Pickup: ${order.merchant_name}, Deliver to: ${order.delivery_address}`,
          {
            orderId: orderId,
            trackingNumber: order.tracking_number,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            deliveryAddress: order.delivery_address,
            totalAmount: order.total_amount
          }
        );
        await RouteOptimizationService.sendRouteInstructions(orderId, assignment.assigned_rider);
      } catch (error) {
        console.error('Notification failed:', error.message);
      }
    }

    return assignment;
  }

  async assignRider(orderId, riderId, assignedBy) {
    const assignment = await RiderAssignmentService.assignRider(orderId, riderId, assignedBy);

    // Send notification to rider
    if (assignment.assigned_rider) {
      try {
        const order = await this.getOrderById(orderId);
        // Use NotificationService for proper WebSocket and push notification delivery
        await NotificationService.createNotification(
          assignment.assigned_rider.id,
          'order_assigned',
          '🚚 New Delivery Assigned',
          `Order #${order.tracking_number} - Pickup: ${order.merchant_name}, Deliver to: ${order.delivery_address}`,
          {
            orderId: orderId,
            trackingNumber: order.tracking_number,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            deliveryAddress: order.delivery_address,
            totalAmount: order.total_amount
          }
        );
        await RouteOptimizationService.sendRouteInstructions(orderId, assignment.assigned_rider);
      } catch (error) {
        console.error('Notification failed:', error.message);
      }
    }

    return assignment;
  }

  async getOrderTracking(orderId) {
    try {
      const result = await db.query(
        `SELECT osh.*, u.name as updated_by_name
         FROM order_status_history osh
         LEFT JOIN users u ON osh.updated_by = u.id
         WHERE osh.order_id = $1
         ORDER BY osh.created_at ASC`,
        [orderId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async getOrderByTrackingNumber(trackingNumber) {
    try {
      const result = await db.query(
        `SELECT o.id, o.order_status, o.tracking_number, o.created_at,
                o.delivered_at
         FROM orders o
         WHERE o.tracking_number = $1`,
        [trackingNumber]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async requestRefund(orderId, userId, reason, photoData, refundType = 'item_received') {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const order = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND student_id = $2',
        [orderId, userId]
      );

      if (order.rows.length === 0) {
        throw new Error('Order not found or unauthorized');
      }

      if (order.rows[0].order_status !== 'delivered') {
        throw new Error('Only delivered orders can be refunded');
      }

      const hoursSinceDelivery = (Date.now() - new Date(order.rows[0].delivered_at)) / (1000 * 60 * 60);
      if (hoursSinceDelivery > 24) {
        throw new Error('Refund window expired (24 hours)');
      }

      const existing = await client.query(
        'SELECT * FROM refund_requests WHERE order_id = $1',
        [orderId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Refund request already exists for this order');
      }

      // Determine return requirements based on refund type
      const returnRequired = refundType === 'item_received';
      const returnStatus = returnRequired ? 'pending_return' : 'not_required';

      await client.query(
        `INSERT INTO refund_requests (order_id, customer_id, merchant_id, reason, photo_data, status, refund_type, return_required, return_status)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8)`,
        [orderId, userId, order.rows[0].merchant_id, reason, photoData, refundType, returnRequired, returnStatus]
      );

      const refundTypeMsg = refundType === 'item_received' ? 'Item received - return required' : 'Item not received - no return needed';
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'student')`,
        [orderId, order.rows[0].order_status, `Refund request submitted: ${reason} (${refundTypeMsg})`, userId]
      );

      await client.query('COMMIT');
      return {
        message: returnRequired
          ? 'Refund request submitted. Please initiate return of goods to merchant.'
          : 'Refund request submitted. Waiting for merchant approval.'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async approveRefund(refundId, merchantId, response) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const refund = await client.query(
        'SELECT * FROM refund_requests WHERE id = $1 AND merchant_id = $2',
        [refundId, merchantId]
      );

      if (refund.rows.length === 0) {
        throw new Error('Refund request not found or unauthorized');
      }

      if (!['pending', 'urged'].includes(refund.rows[0].status)) {
        throw new Error('Refund request already processed');
      }

      // Check if return is required and has been received
      if (refund.rows[0].return_required) {
        if (refund.rows[0].return_status !== 'merchant_received') {
          throw new Error('Cannot approve refund. You must first verify receipt of returned goods.');
        }
      }

      await client.query(
        `UPDATE refund_requests SET status = 'approved', merchant_response = $1, return_status = 'verified', updated_at = NOW() WHERE id = $2`,
        [response, refundId]
      );

      const orderId = refund.rows[0].order_id;

      // Get order details for notification
      const orderResult = await client.query(
        'SELECT total_amount, tracking_number, payment_method FROM orders WHERE id = $1',
        [orderId]
      );
      const order = orderResult.rows[0];

      await client.query(
        `UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await client.query(
        `UPDATE escrow SET status = 'refunded', released_at = NOW() WHERE order_id = $1`,
        [orderId]
      );

      await client.query(
        `UPDATE products p SET stock_quantity = stock_quantity + oi.quantity
         FROM order_items oi
         WHERE p.id = oi.product_id AND oi.order_id = $1 AND p.stock_quantity IS NOT NULL`,
        [orderId]
      );

      // Refund to customer if paid with token credits
      if (order.payment_method === 'token_credits') {
        const refundAmount = parseFloat(order.total_amount);

        // Validate refund amount is positive
        if (refundAmount <= 0) {
          throw new Error('Invalid refund amount');
        }

        await client.query(
          'UPDATE token_credits SET balance = balance + $1 WHERE user_id = $2',
          [refundAmount, refund.rows[0].customer_id]
        );

        const newBalanceResult = await client.query(
          'SELECT balance FROM token_credits WHERE user_id = $1',
          [refund.rows[0].customer_id]
        );

        await client.query(
          `INSERT INTO token_transactions (user_id, amount, type, reference_id, balance_after)
           VALUES ($1, $2, 'credit', $3, $4)`,
          [refund.rows[0].customer_id, refundAmount, orderId, parseFloat(newBalanceResult.rows[0].balance)]
        );
      }

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, 'cancelled', $2, $3, 'merchant')`,
        [orderId, `Refund approved: ${response}`, merchantId]
      );

      // Create notification for customer
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data, is_read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          refund.rows[0].customer_id,
          'refund_approved',
          'Refund Approved',
          `Your refund request for order #${order.tracking_number} has been approved. Amount: XAF ${parseFloat(order.total_amount).toFixed(2)}`,
          JSON.stringify({
            order_id: orderId,
            refund_id: refundId,
            refund_amount: parseFloat(order.total_amount),
            tracking_number: order.tracking_number,
            merchant_response: response
          })
        ]
      );

      await client.query('COMMIT');
      return { message: 'Refund approved successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rejectRefund(refundId, merchantId, response) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const refund = await client.query(
        'SELECT * FROM refund_requests WHERE id = $1 AND merchant_id = $2',
        [refundId, merchantId]
      );

      if (refund.rows.length === 0) {
        throw new Error('Refund request not found or unauthorized');
      }

      if (!['pending', 'urged'].includes(refund.rows[0].status)) {
        throw new Error('Refund request already processed');
      }

      await client.query(
        `UPDATE refund_requests SET status = 'rejected', merchant_response = $1, updated_at = NOW() WHERE id = $2`,
        [response, refundId]
      );

      const orderId = refund.rows[0].order_id;

      // Get order details for notification
      const orderResult = await client.query(
        'SELECT total_amount, tracking_number FROM orders WHERE id = $1',
        [orderId]
      );
      const order = orderResult.rows[0];

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'merchant')`,
        [orderId, 'delivered', `Refund rejected: ${response}`, merchantId]
      );

      // Create notification for customer
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data, is_read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          refund.rows[0].customer_id,
          'refund_rejected',
          'Refund Rejected',
          `Your refund request for order #${order.tracking_number} has been rejected. Reason: ${response}`,
          JSON.stringify({
            order_id: orderId,
            refund_id: refundId,
            refund_amount: parseFloat(order.total_amount),
            tracking_number: order.tracking_number,
            merchant_response: response
          })
        ]
      );

      await client.query('COMMIT');
      return { message: 'Refund rejected' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMerchantRefundRequests(merchantId) {
    try {
      const result = await db.query(
        `SELECT r.*, o.tracking_number, o.total_amount, u.name as customer_name, u.phone as customer_phone
         FROM refund_requests r
         JOIN orders o ON r.order_id = o.id
         JOIN users u ON r.customer_id = u.id
         WHERE r.merchant_id = $1
         ORDER BY r.created_at DESC`,
        [merchantId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async urgeRefund(refundId, customerId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const refund = await client.query(
        'SELECT * FROM refund_requests WHERE id = $1 AND customer_id = $2',
        [refundId, customerId]
      );

      if (refund.rows.length === 0) {
        throw new Error('Refund request not found or unauthorized');
      }

      if (refund.rows[0].status !== 'pending') {
        throw new Error('Can only urge pending refund requests');
      }

      const hoursSinceCreation = (Date.now() - new Date(refund.rows[0].created_at)) / (1000 * 60 * 60);
      if (hoursSinceCreation < 24) {
        throw new Error('You can only urge the merchant after 24 hours');
      }

      await client.query(
        `UPDATE refund_requests SET status = 'urged', customer_urged_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [refundId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'student')`,
        [refund.rows[0].order_id, 'delivered', 'Customer urged merchant to respond to refund request', customerId]
      );

      await client.query('COMMIT');
      return { message: 'Merchant has been urged to respond to your refund request' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async escalateToAdmin(refundId, customerId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const refund = await client.query(
        'SELECT * FROM refund_requests WHERE id = $1 AND customer_id = $2',
        [refundId, customerId]
      );

      if (refund.rows.length === 0) {
        throw new Error('Refund request not found or unauthorized');
      }

      if (!['pending', 'urged'].includes(refund.rows[0].status)) {
        throw new Error('Can only escalate pending or urged refund requests');
      }

      if (refund.rows[0].status === 'urged') {
        const hoursSinceUrged = (Date.now() - new Date(refund.rows[0].customer_urged_at)) / (1000 * 60 * 60);
        if (hoursSinceUrged < 24) {
          throw new Error('You can only escalate to admin after 24 hours of urging the merchant');
        }
      }

      await client.query(
        `UPDATE refund_requests
         SET status = 'escalated', escalated_to_admin = TRUE, escalated_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [refundId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'student')`,
        [refund.rows[0].order_id, 'delivered', 'Refund request escalated to platform admin for review', customerId]
      );

      await client.query('COMMIT');
      return { message: 'Your refund request has been escalated to platform admin for review' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async adminReviewRefund(refundId, adminId, decision, adminNotes) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const refund = await client.query(
        'SELECT r.*, o.merchant_id FROM refund_requests r JOIN orders o ON r.order_id = o.id WHERE r.id = $1',
        [refundId]
      );

      if (refund.rows.length === 0) {
        throw new Error('Refund request not found');
      }

      // Verify the refund is escalated and the merchant exists
      if (!refund.rows[0].escalated_to_admin) {
        throw new Error('Only escalated refund requests can be reviewed by admin');
      }

      // Verify merchant exists for this refund
      const merchant = await client.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [refund.rows[0].merchant_id, 'merchant']
      );

      if (merchant.rows.length === 0) {
        throw new Error('Merchant associated with this refund not found');
      }

      if (!['approved', 'rejected'].includes(decision)) {
        throw new Error('Decision must be either approved or rejected');
      }

      await client.query(
        `UPDATE refund_requests
         SET status = $1, admin_notes = $2, updated_at = NOW()
         WHERE id = $3`,
        [decision, adminNotes, refundId]
      );

      const orderId = refund.rows[0].order_id;

      if (decision === 'approved') {
        await client.query(
          `UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
          [orderId]
        );

        await client.query(
          `UPDATE escrow SET status = 'refunded', released_at = NOW() WHERE order_id = $1`,
          [orderId]
        );

        await client.query(
          `UPDATE products p SET stock_quantity = stock_quantity + oi.quantity
           FROM order_items oi
           WHERE p.id = oi.product_id AND oi.order_id = $1 AND p.stock_quantity IS NOT NULL`,
          [orderId]
        );

        await client.query(
          `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
           VALUES ($1, 'cancelled', $2, $3, 'admin')`,
          [orderId, `Admin approved refund: ${adminNotes}`, adminId]
        );
      } else {
        await client.query(
          `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
           VALUES ($1, 'delivered', $2, $3, 'admin')`,
          [orderId, `Admin rejected refund: ${adminNotes}`, adminId]
        );
      }

      await client.query('COMMIT');
      return { message: `Refund request ${decision} by admin` };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCustomerRefundRequest(orderId, customerId) {
    try {
      const result = await db.query(
        `SELECT * FROM refund_requests WHERE order_id = $1 AND customer_id = $2`,
        [orderId, customerId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getEscalatedRefundRequests() {
    try {
      const result = await db.query(
        `SELECT r.*, o.tracking_number, o.total_amount,
                u.name as customer_name, u.phone as customer_phone,
                m.name as merchant_name, m.phone as merchant_phone
         FROM refund_requests r
         JOIN orders o ON r.order_id = o.id
         JOIN users u ON r.customer_id = u.id
         JOIN users m ON r.merchant_id = m.id
         WHERE r.escalated_to_admin = TRUE
         ORDER BY r.escalated_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(orderId, userId, reason) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const order = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND student_id = $2',
        [orderId, userId]
      );

      if (order.rows.length === 0) {
        throw new Error('Order not found or unauthorized');
      }

      if (order.rows[0].order_status !== 'pending') {
        throw new Error('Only pending orders can be cancelled immediately');
      }

      await client.query(
        `UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await client.query(
        `UPDATE products p SET stock_quantity = stock_quantity + oi.quantity
         FROM order_items oi
         WHERE p.id = oi.product_id AND oi.order_id = $1 AND p.stock_quantity IS NOT NULL`,
        [orderId]
      );

      // Refund to customer if paid with token credits
      if (order.rows[0].payment_method === 'token_credits') {
        const refundAmount = parseFloat(order.rows[0].total_amount);
        
        // Ensure token_credits account exists
        const tcCheck = await client.query(
          'SELECT id FROM token_credits WHERE user_id = $1',
          [userId]
        );
        
        if (tcCheck.rows.length === 0) {
          await client.query(
            'INSERT INTO token_credits (user_id, balance) VALUES ($1, $2)',
            [userId, refundAmount]
          );
        } else {
          await client.query(
            'UPDATE token_credits SET balance = balance + $1 WHERE user_id = $2',
            [refundAmount, userId]
          );
        }

        const newBalanceResult = await client.query(
          'SELECT balance FROM token_credits WHERE user_id = $1',
          [userId]
        );

        await client.query(
          `INSERT INTO token_transactions (user_id, amount, type, reference_id, balance_after)
           VALUES ($1, $2, 'credit', $3, $4)`,
          [userId, refundAmount, orderId, parseFloat(newBalanceResult.rows[0].balance)]
        );
      }

      // Delete escrow if exists
      await client.query(
        'DELETE FROM escrow WHERE order_id = $1',
        [orderId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, 'cancelled', $2, $3, 'student')`,
        [orderId, reason || 'Customer cancelled order', userId]
      );

      await client.query('COMMIT');
      return { message: 'Order cancelled successfully', order_id: orderId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getSpendingSummary(userId) {
    try {
      const result = await db.query(
        `SELECT
           COUNT(*) FILTER (WHERE order_status = 'delivered') as total_orders,
           COALESCE(SUM(total_amount) FILTER (WHERE order_status = 'delivered' AND payment_status = 'completed'), 0) as total_spent,
           COALESCE(SUM(total_amount) FILTER (WHERE order_status = 'cancelled' AND payment_method = 'token_credits'), 0) as total_refunded,
           COALESCE(SUM(total_amount) FILTER (WHERE order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'in_delivery')), 0) as pending_amount,
           COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled_orders,
           COALESCE(AVG(total_amount) FILTER (WHERE order_status = 'delivered'), 0) as avg_order_value
         FROM orders
         WHERE student_id = $1`,
        [userId]
      );

      const refundResult = await db.query(
        `SELECT COUNT(*) as refund_count,
                COUNT(*) FILTER (WHERE status = 'approved') as approved_refunds,
                COUNT(*) FILTER (WHERE status = 'pending') as pending_refunds
         FROM refund_requests
         WHERE customer_id = $1`,
        [userId]
      );

      return {
        total_orders: parseInt(result.rows[0].total_orders),
        total_spent: parseFloat(result.rows[0].total_spent),
        total_refunded: parseFloat(result.rows[0].total_refunded),
        pending_amount: parseFloat(result.rows[0].pending_amount),
        cancelled_orders: parseInt(result.rows[0].cancelled_orders),
        avg_order_value: parseFloat(result.rows[0].avg_order_value),
        refund_requests: parseInt(refundResult.rows[0].refund_count),
        approved_refunds: parseInt(refundResult.rows[0].approved_refunds),
        pending_refunds: parseInt(refundResult.rows[0].pending_refunds)
      };
    } catch (error) {
      throw error;
    }
  }

  async getSpendingHistory(userId, filters = {}) {
    try {
      const { start_date, end_date, status, limit = 50, offset = 0 } = filters;

      let query = `
        SELECT o.id, o.tracking_number, o.total_amount, o.payment_method, o.payment_status,
               o.order_status, o.created_at, o.delivered_at,
               COALESCE(json_agg(
                 json_build_object(
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price,
                   'subtotal', oi.subtotal
                 )
               ) FILTER (WHERE p.id IS NOT NULL), '[]') as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.student_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (start_date) {
        query += ` AND o.created_at >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND o.created_at <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      if (status) {
        query += ` AND o.order_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return {
        count: result.rows.length,
        orders: result.rows
      };
    } catch (error) {
      throw error;
    }
  }

  async getCustomerRefunds(userId) {
    try {
      const result = await db.query(
        `SELECT r.*, o.tracking_number, o.total_amount, o.created_at as order_date
         FROM refund_requests r
         JOIN orders o ON r.order_id = o.id
         WHERE r.customer_id = $1
         ORDER BY r.created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async merchantRefund(orderId, merchantId, reason, photoData) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const order = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND merchant_id = $2',
        [orderId, merchantId]
      );

      if (order.rows.length === 0) {
        throw new Error('Order not found or unauthorized');
      }

      if (!['confirmed', 'preparing', 'ready', 'delivered'].includes(order.rows[0].order_status)) {
        throw new Error('Order cannot be refunded at this stage');
      }

      await client.query(
        `UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await client.query(
        `UPDATE escrow SET status = 'refunded', released_at = NOW() WHERE order_id = $1`,
        [orderId]
      );

      await client.query(
        `UPDATE products p SET stock_quantity = stock_quantity + oi.quantity
         FROM order_items oi
         WHERE p.id = oi.product_id AND oi.order_id = $1 AND p.stock_quantity IS NOT NULL`,
        [orderId]
      );

      const notes = photoData 
        ? `Merchant refund: ${reason} [Photo: ${photoData.substring(0, 50)}...]`
        : `Merchant refund: ${reason}`;
      
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, 'cancelled', $2, $3, 'merchant')`,
        [orderId, notes, merchantId]
      );

      await client.query('COMMIT');
      return { message: 'Refund processed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async initiateReturn(refundId, customerId, returnNotes) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const refund = await client.query(
        'SELECT * FROM refund_requests WHERE id = $1 AND customer_id = $2',
        [refundId, customerId]
      );

      if (refund.rows.length === 0) {
        throw new Error('Refund request not found or unauthorized');
      }

      if (!refund.rows[0].return_required) {
        throw new Error('Return is not required for this refund request');
      }

      if (refund.rows[0].return_status !== 'pending_return') {
        throw new Error('Return already initiated or completed');
      }

      await client.query(
        `UPDATE refund_requests
         SET return_status = 'customer_initiated_return', return_notes = $1, updated_at = NOW()
         WHERE id = $2`,
        [returnNotes, refundId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'student')`,
        [refund.rows[0].order_id, 'delivered', `Customer initiated return: ${returnNotes}`, customerId]
      );

      await client.query('COMMIT');
      return { message: 'Return initiated. Please send goods back to merchant.' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async merchantVerifyReturn(refundId, merchantId, verificationNotes) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const refund = await client.query(
        'SELECT * FROM refund_requests WHERE id = $1 AND merchant_id = $2',
        [refundId, merchantId]
      );

      if (refund.rows.length === 0) {
        throw new Error('Refund request not found or unauthorized');
      }

      if (!refund.rows[0].return_required) {
        throw new Error('Return verification not applicable for this refund type');
      }

      if (refund.rows[0].return_status !== 'customer_initiated_return') {
        throw new Error('Cannot verify return. Customer has not initiated return yet.');
      }

      await client.query(
        `UPDATE refund_requests
         SET return_status = 'merchant_received',
             merchant_verified_return_at = NOW(),
             return_notes = COALESCE(return_notes, '') || ' | Merchant verification: ' || $1,
             updated_at = NOW()
         WHERE id = $2`,
        [verificationNotes, refundId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by, updated_by_role)
         VALUES ($1, $2, $3, $4, 'merchant')`,
        [refund.rows[0].order_id, 'delivered', `Merchant received returned goods: ${verificationNotes}`, merchantId]
      );

      await client.query('COMMIT');
      return { message: 'Return verified. You can now approve or reject the refund.' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if an order is part of a delivery route and auto-complete the route if all orders are delivered
   * This fixes the bug where routes remain in 'active' or 'pending' status even when all orders are delivered
   * @param {Object} client - Database client (within transaction)
   * @param {number} orderId - Order ID that was just delivered
   * @param {number} riderId - Rider ID who delivered the order
   */
  async checkAndCompleteRoute(client, orderId, riderId) {
    try {
      if (!riderId) {
        console.log(`[checkAndCompleteRoute] No rider assigned to order ${orderId}, skipping route check`);
        return;
      }

      // Find delivery routes that contain this order
      const routeResult = await client.query(
        `SELECT id, order_ids, status, rider_id
         FROM delivery_routes
         WHERE $1 = ANY(order_ids)
           AND rider_id = $2
           AND status IN ('pending', 'active')
         ORDER BY created_at DESC
         LIMIT 1`,
        [orderId, riderId]
      );

      if (routeResult.rows.length === 0) {
        console.log(`[checkAndCompleteRoute] Order ${orderId} is not part of any active delivery route`);
        return;
      }

      const route = routeResult.rows[0];
      const routeId = route.id;
      const orderIds = route.order_ids;

      console.log(`[checkAndCompleteRoute] Order ${orderId} is part of route ${routeId} with ${orderIds.length} orders`);

      // Check if ALL orders in this route are now 'delivered'
      const orderStatusResult = await client.query(
        `SELECT id, order_status
         FROM orders
         WHERE id = ANY($1::int[])`,
        [orderIds]
      );

      const allDelivered = orderStatusResult.rows.every(order => order.order_status === 'delivered');
      const deliveredCount = orderStatusResult.rows.filter(order => order.order_status === 'delivered').length;

      console.log(`[checkAndCompleteRoute] Route ${routeId}: ${deliveredCount}/${orderIds.length} orders delivered`);

      if (allDelivered) {
        // Update route status to 'completed'
        await client.query(
          `UPDATE delivery_routes
           SET status = 'completed', updated_at = NOW()
           WHERE id = $1`,
          [routeId]
        );

        console.log(`[checkAndCompleteRoute] Route ${routeId} marked as COMPLETED - all ${orderIds.length} orders delivered`);
      } else {
        console.log(`[checkAndCompleteRoute] Route ${routeId} still active - ${orderIds.length - deliveredCount} orders remaining`);
      }
    } catch (error) {
      // Log error but don't fail the transaction - route completion is not critical
      console.error(`[checkAndCompleteRoute] Error checking route completion:`, error.message);
    }
  }
}

module.exports = new OrderService();
