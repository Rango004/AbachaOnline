const express = require('express');
const rateLimit = require('express-rate-limit');
const OrderService = require('../services/OrderService');
const PaymentService = require('../services/PaymentService');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Rate limiter for public tracking endpoint (30 requests per 15 minutes)
const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: 'Too many tracking requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in RateLimit headers
  legacyHeaders: false // Disable X-RateLimit-* headers
});

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private (Students)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, delivery_address, delivery_zone_id, notes } = req.body;

    const orderData = {
      items,
      delivery_address,
      delivery_zone_id,
      notes
    };

    const order = await OrderService.createOrder(req.user.id, orderData);

    // Broadcast order creation event
    const wsService = req.app.locals.wsService;
    if (wsService) {
      wsService.broadcastOrderUpdate(order.id, {
        event_type: 'order_created',
        order_id: order.id,
        status: order.order_status,
        customer_id: order.student_id,
        merchant_id: order.merchant_id,
        tracking_number: order.tracking_number,
        total_amount: order.total_amount
      });
      // Send notification to merchant
      await wsService.sendNotificationToUser(order.merchant_id, {
        type: 'new_order',
        title: 'New Order Received',
        message: `Order #${order.tracking_number} - ${order.total_amount} XAF`,
        data: {
          order_id: order.id,
          tracking_number: order.tracking_number,
          customer_name: order.customer_name,
          total_amount: order.total_amount
        }
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    let orders;

    if (req.user.role === 'admin') {
      // Admin sees all orders
      orders = await OrderService.getAllOrders({
        status,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      });
    } else if (req.user.role === 'merchant') {
      // Merchant sees orders with their products
      orders = await OrderService.getMerchantOrders(req.user.id);
    } else {
      // Students see their own orders
      orders = await OrderService.getUserOrders(req.user.id, {
        status,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      });
    }

    res.json({
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/orders/spending/summary
 * @desc    Get customer spending summary
 * @access  Private (Customer only)
 */
router.get('/spending/summary', authenticate, async (req, res) => {
  try {
    const summary = await OrderService.getSpendingSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/orders/spending/history
 * @desc    Get detailed spending history with filters
 * @access  Private (Customer only)
 */
router.get('/spending/history', authenticate, async (req, res) => {
  try {
    const { start_date, end_date, status, limit, offset } = req.query;
    const history = await OrderService.getSpendingHistory(req.user.id, {
      start_date,
      end_date,
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/orders/refunds/history
 * @desc    Get customer refund history
 * @access  Private (Customer only)
 */
router.get('/refunds/history', authenticate, async (req, res) => {
  try {
    const refunds = await OrderService.getCustomerRefunds(req.user.id);
    res.json({ refunds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/orders/refund-requests
 * @desc    Get merchant's refund requests
 * @access  Private (Merchant only)
 */
router.get('/refund-requests', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const requests = await OrderService.getMerchantRefundRequests(req.user.id);
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/orders/refund-requests/:id/approve
 * @desc    Merchant approves refund
 * @access  Private (Merchant only)
 */
router.post('/refund-requests/:id/approve', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const { response } = req.body;

    const result = await OrderService.approveRefund(refundId, req.user.id, response || 'Approved');

    // Broadcast refund approval - need to get refund details
    const db = require('../config/database');
    const refundDetails = await db.query('SELECT order_id, customer_id FROM refund_requests WHERE id = $1', [refundId]);
    if (refundDetails.rows.length > 0) {
      const wsService = req.app.locals.wsService;
      if (wsService) {
        const { order_id, customer_id } = refundDetails.rows[0];
        wsService.broadcastOrderUpdate(order_id, {
          event_type: 'refund_approved',
          refund_id: refundId,
          order_id: order_id,
          approved_at: new Date()
        });
        // Notify customer about refund approval
        await wsService.sendNotificationToUser(customer_id, {
          type: 'refund_approved',
          title: 'Refund Approved',
          message: 'Your refund request has been approved',
          data: {
            order_id: order_id,
            refund_id: refundId,
            merchant_response: response || 'Approved'
          }
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/orders/refund-requests/:id/reject
 * @desc    Merchant rejects refund
 * @access  Private (Merchant only)
 */
router.post('/refund-requests/:id/reject', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await OrderService.rejectRefund(refundId, req.user.id, response);

    // Broadcast refund rejection - need to get refund details
    const db = require('../config/database');
    const refundDetails = await db.query('SELECT order_id, customer_id FROM refund_requests WHERE id = $1', [refundId]);
    if (refundDetails.rows.length > 0) {
      const wsService = req.app.locals.wsService;
      if (wsService) {
        const { order_id, customer_id } = refundDetails.rows[0];
        wsService.broadcastOrderUpdate(order_id, {
          event_type: 'refund_rejected',
          refund_id: refundId,
          order_id: order_id,
          rejected_at: new Date()
        });
        // Notify customer about refund rejection
        await wsService.sendNotificationToUser(customer_id, {
          type: 'refund_rejected',
          title: 'Refund Rejected',
          message: 'Your refund request has been rejected',
          data: {
            order_id: order_id,
            refund_id: refundId,
            rejection_reason: response
          }
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/orders/refund-requests/:id/urge
 * @desc    Customer urges merchant to respond to refund
 * @access  Private (Customer only)
 */
router.post('/refund-requests/:id/urge', authenticate, async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const result = await OrderService.urgeRefund(refundId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/orders/refund-requests/:id/escalate
 * @desc    Customer escalates refund to admin
 * @access  Private (Customer only)
 */
router.post('/refund-requests/:id/escalate', authenticate, async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const result = await OrderService.escalateToAdmin(refundId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Customer cancels order immediately after placing
 * @access  Private (Customer only)
 */
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { reason } = req.body;

    const result = await OrderService.cancelOrder(orderId, req.user.id, reason);

    // Broadcast order cancellation
    const wsService = req.app.locals.wsService;
    if (wsService) {
      wsService.broadcastOrderUpdate(orderId, {
        event_type: 'order_cancelled',
        order_id: orderId,
        status: 'cancelled',
        reason: reason || 'Order cancelled by customer',
        cancelled_by_id: req.user.id,
        cancelled_at: new Date()
      });
      // Notify merchant about cancellation
      const order = await OrderService.getOrderById(orderId, req.user.id);
      await wsService.sendNotificationToUser(order.merchant_id, {
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Order #${order.tracking_number} has been cancelled`,
        data: {
          order_id: orderId,
          tracking_number: order.tracking_number,
          reason: reason || 'Customer cancelled order'
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }

    const order = await OrderService.getOrderById(orderId, req.user.id);

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }

    if (error.message === 'Order not found') {
      return res.status(404).json({
        error: 'Order not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch order',
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Merchants, Riders, Admins)
 */
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }

    if (!status) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Status is required'
      });
    }

    const wsService = req.app.locals.wsService;
    const order = await OrderService.updateOrderStatus(orderId, status, req.user.id, wsService);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);

    if (error.message.includes('Unauthorized') || error.message.includes('can only')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }

    if (error.message === 'Order not found') {
      return res.status(404).json({
        error: 'Order not found',
        message: error.message
      });
    }

    res.status(400).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/payment
 * @desc    Process payment for an order
 * @access  Private (Order customer only)
 */
router.post('/:id/payment', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { payment_method } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }

    const result = await PaymentService.processPayment(
      orderId,
      req.user.id,
      payment_method || 'orange_money'
    );

    res.json(result);
  } catch (error) {
    console.error('Process payment error:', error);

    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }

    if (error.message === 'Order not found') {
      return res.status(404).json({
        error: 'Order not found',
        message: error.message
      });
    }

    res.status(400).json({
      error: 'Payment failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/orders/:id/payment
 * @desc    Get payment information for an order
 * @access  Private
 */
router.get('/:id/payment', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'Order ID must be a number'
      });
    }

    const paymentInfo = await PaymentService.getPaymentInfo(orderId);

    res.json(paymentInfo);
  } catch (error) {
    console.error('Get payment info error:', error);

    if (error.message === 'Order not found') {
      return res.status(404).json({
        error: 'Order not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch payment info',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/token-credits/add
 * @desc    Add token credits to user account
 * @access  Private
 */
router.post('/token-credits/add', authenticate, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Amount must be greater than 0'
      });
    }

    const result = await PaymentService.addTokenCredits(
      req.user.id,
      parseFloat(amount),
      description
    );

    res.json(result);
  } catch (error) {
    console.error('Add token credits error:', error);
    res.status(400).json({
      error: 'Failed to add token credits',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/orders/token-credits/balance
 * @desc    Get user's token balance and transaction history
 * @access  Private
 */
router.get('/token-credits/balance', authenticate, async (req, res) => {
  try {
    const info = await PaymentService.getTokenCreditsInfo(req.user.id);
    res.json(info);
  } catch (error) {
    console.error('Get token credits info error:', error);
    res.status(500).json({
      error: 'Failed to fetch token credits info',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/orders/:id/tracking
 * @desc    Get order tracking history
 * @access  Private
 */
router.get('/:id/tracking', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    // Get order to check authorization
    const order = await OrderService.getOrderById(orderId, req.user.id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const trackingHistory = await OrderService.getOrderTracking(orderId);

    res.json({
      tracking_number: order.tracking_number,
      current_status: order.order_status,
      history: trackingHistory
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({
      error: 'Failed to fetch tracking information',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/orders/track/:tracking_number
 * @desc    Track order by tracking number (public)
 * @access  Public (Rate Limited)
 */
router.get('/track/:tracking_number', trackingLimiter, async (req, res) => {
  try {
    const { tracking_number } = req.params;

    const order = await OrderService.getOrderByTrackingNumber(tracking_number);
    const trackingHistory = await OrderService.getOrderTracking(order.id);

    res.json({
      tracking_number: order.tracking_number,
      current_status: order.order_status,
      created_at: order.created_at,
      estimated_delivery: order.estimated_delivery_time,
      history: trackingHistory
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(404).json({
      error: 'Order not found',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (Merchant, Rider, Admin)
 */
router.post('/:id/status', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, notes, location } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required'
      });
    }

    const wsService = req.app.locals.wsService;
    const updatedOrder = await OrderService.updateOrderStatus(orderId, status, req.user.id, wsService);

    // Add notes/location if provided
    if (notes || location) {
      const db = require('../config/database');
      await db.query(
        `UPDATE order_status_history
         SET notes = COALESCE($1, notes),
             location = COALESCE($2, location)
         WHERE order_id = $3
           AND status = $4
           AND updated_by = $5
         ORDER BY created_at DESC
         LIMIT 1`,
        [notes, location, orderId, status, req.user.id]
      );
    }

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(400).json({
      error: 'Failed to update status',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/assign-rider
 * @desc    Assign rider to order (Admin/Merchant)
 * @access  Private (Admin/Merchant only)
 */
router.post('/:id/assign-rider', authenticate, authorize('admin', 'merchant'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { rider_id } = req.body;

    if (!rider_id) {
      return res.status(400).json({
        error: 'Rider ID is required'
      });
    }

    const updatedOrder = await OrderService.assignRider(orderId, rider_id, req.user.id);

    // Broadcast rider assignment
    const wsService = req.app.locals.wsService;
    if (wsService) {
      wsService.broadcastOrderUpdate(orderId, {
        event_type: 'rider_assigned',
        order_id: orderId,
        rider_id: rider_id,
        assigned_by_id: req.user.id,
        assigned_at: new Date()
      });
      // Notify rider about assignment
      await wsService.sendNotificationToUser(rider_id, {
        type: 'order_assigned',
        title: 'New Delivery Assigned',
        message: `Order #${updatedOrder.tracking_number} assigned to you`,
        data: {
          order_id: orderId,
          tracking_number: updatedOrder.tracking_number,
          customer_name: updatedOrder.customer_name,
          delivery_address: updatedOrder.delivery_address,
          total_amount: updatedOrder.total_amount
        }
      });
    }

    res.json({
      message: 'Rider assigned successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Assign rider error:', error);
    res.status(400).json({
      error: 'Failed to assign rider',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/claim
 * @desc    Rider self-assigns (claims) an order
 * @access  Private (Rider only)
 */
router.post('/:id/claim', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const updatedOrder = await OrderService.assignRider(orderId, req.user.id, req.user.id);

    res.json({
      message: 'Order claimed successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Claim order error:', error);
    res.status(400).json({
      error: 'Failed to claim order',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/auto-assign
 * @desc    Auto-assign order to best available rider (simple zone-based)
 * @access  Private (Admin/Merchant only)
 */
router.post('/:id/auto-assign', authenticate, authorize('admin', 'merchant'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const updatedOrder = await OrderService.autoAssignRider(orderId, req.user.id);

    res.json({
      message: 'Rider auto-assigned successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Auto-assign error:', error);
    res.status(400).json({
      error: 'Failed to auto-assign rider',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/pickup-verify
 * @desc    Rider verifies pickup by entering tracking number
 * @access  Private (Rider only)
 */
router.post('/:id/pickup-verify', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { tracking_number } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    if (!tracking_number) {
      return res.status(400).json({
        error: 'Tracking number is required'
      });
    }

    const db = require('../config/database');

    // Verify tracking number matches and rider is assigned
    const orderCheck = await db.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const order = orderCheck.rows[0];

    // Check if rider is assigned to this order
    if (order.rider_id !== req.user.id) {
      return res.status(403).json({
        error: 'You are not assigned to this order'
      });
    }

    // Verify tracking number
    if (order.tracking_number !== tracking_number.trim().toUpperCase()) {
      return res.status(400).json({
        error: 'Invalid tracking number'
      });
    }

    // Update order to in_transit
    const updatedOrder = await OrderService.updateOrderStatus(orderId, 'in_transit', req.user.id);

    res.json({
      message: 'Pickup verified successfully. Customer will show their pickup code at delivery.',
      order: updatedOrder,
      pickup_code: order.pickup_code
    });
  } catch (error) {
    console.error('Pickup verify error:', error);
    res.status(400).json({
      error: 'Failed to verify pickup',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/deliver-verify
 * @desc    Rider verifies delivery by entering customer's pickup code
 * @access  Private (Rider only)
 */
router.post('/:id/deliver-verify', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { pickup_code } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    if (!pickup_code) {
      return res.status(400).json({
        error: 'Pickup code is required'
      });
    }

    const db = require('../config/database');

    // Get order
    const orderCheck = await db.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    const order = orderCheck.rows[0];

    // Check if rider is assigned to this order
    if (order.rider_id !== req.user.id) {
      return res.status(403).json({
        error: 'You are not assigned to this order'
      });
    }

    // Verify pickup code matches customer's code
    if (order.pickup_code !== pickup_code.trim()) {
      return res.status(400).json({
        error: 'Invalid pickup code. Customer verification failed.'
      });
    }

    // Mark as delivered
    const updatedOrder = await OrderService.updateOrderStatus(orderId, 'delivered', req.user.id);

    res.json({
      message: 'Delivery confirmed successfully. Customer identity verified.',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Delivery verify error:', error);
    res.status(400).json({
      error: 'Failed to verify delivery',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/orders/:id/refund
 * @desc    Customer requests refund (24hr window)
 * @access  Private (Customer only)
 */
router.post('/:id/refund', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { reason, photo, refund_type } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Refund reason is required' });
    }
    if (!photo) {
      return res.status(400).json({ error: 'Photo is required for refund' });
    }
    if (!refund_type || !['item_received', 'item_not_received'].includes(refund_type)) {
      return res.status(400).json({ error: 'Valid refund_type is required (item_received or item_not_received)' });
    }

    const result = await OrderService.requestRefund(orderId, req.user.id, reason, photo, refund_type);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/orders/:id/refund-status
 * @desc    Get refund status for an order
 * @access  Private
 */
router.get('/:id/refund-status', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const refundRequest = await OrderService.getCustomerRefundRequest(orderId, req.user.id);
    res.json({ refundRequest });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/orders/refund-requests/:id/initiate-return
 * @desc    Customer initiates return of goods
 * @access  Private (Customer only)
 */
router.post('/refund-requests/:id/initiate-return', authenticate, async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const { return_notes } = req.body;

    if (!return_notes || !return_notes.trim()) {
      return res.status(400).json({ error: 'Return notes are required' });
    }

    const result = await OrderService.initiateReturn(refundId, req.user.id, return_notes);

    // Broadcast return initiation via WebSocket
    const db = require('../config/database');
    const refundDetails = await db.query('SELECT order_id, customer_id, merchant_id FROM refund_requests WHERE id = $1', [refundId]);
    if (refundDetails.rows.length > 0) {
      const wsService = req.app.locals.wsService;
      if (wsService) {
        const { order_id, customer_id, merchant_id } = refundDetails.rows[0];
        wsService.broadcastOrderUpdate(order_id, {
          event_type: 'return_initiated',
          refund_id: refundId,
          order_id: order_id,
          return_status: 'initiated',
          initiated_at: new Date()
        });
        // Notify merchant about return initiation
        await wsService.sendNotificationToUser(merchant_id, {
          type: 'return_initiated',
          title: 'Return Initiated',
          message: 'Customer has initiated a return for their order',
          data: {
            order_id: order_id,
            refund_id: refundId,
            return_notes: return_notes
          }
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/orders/refund-requests/:id/verify-return
 * @desc    Merchant verifies receipt of returned goods
 * @access  Private (Merchant only)
 */
router.post('/refund-requests/:id/verify-return', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const refundId = parseInt(req.params.id);
    const { verification_notes } = req.body;

    if (!verification_notes || !verification_notes.trim()) {
      return res.status(400).json({ error: 'Verification notes are required' });
    }

    const result = await OrderService.merchantVerifyReturn(refundId, req.user.id, verification_notes);

    // Broadcast return verification via WebSocket
    const db = require('../config/database');
    const refundDetails = await db.query('SELECT order_id, customer_id FROM refund_requests WHERE id = $1', [refundId]);
    if (refundDetails.rows.length > 0) {
      const wsService = req.app.locals.wsService;
      if (wsService) {
        const { order_id, customer_id } = refundDetails.rows[0];
        wsService.broadcastOrderUpdate(order_id, {
          event_type: 'return_verified',
          refund_id: refundId,
          order_id: order_id,
          return_status: 'verified',
          verified_at: new Date()
        });
        // Notify customer about return verification
        await wsService.sendNotificationToUser(customer_id, {
          type: 'return_verified',
          title: 'Return Verified',
          message: 'Your return has been verified by the merchant',
          data: {
            order_id: order_id,
            refund_id: refundId,
            verification_notes: verification_notes
          }
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
