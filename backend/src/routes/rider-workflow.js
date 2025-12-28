const express = require('express');
const RiderWorkflowService = require('../services/RiderWorkflowService');
const OrderService = require('../services/OrderService');
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * Auto-cleanup: Delete route if all orders are delivered
 * @param {number} orderId - The order that was just marked as delivered
 */
async function autoCleanupCompletedRoute(orderId) {
  try {
    // Find the route that contains this order
    const routeResult = await db.query(
      `SELECT id, order_ids FROM delivery_routes
       WHERE $1 = ANY(order_ids)
       AND status != 'cancelled'`,
      [orderId]
    );

    if (routeResult.rows.length === 0) {
      // Order not part of any route, nothing to cleanup
      return;
    }

    const route = routeResult.rows[0];
    const routeId = route.id;
    const orderIds = route.order_ids;

    // Check if ALL orders in this route are now delivered
    const ordersStatusResult = await db.query(
      `SELECT id, order_status FROM orders WHERE id = ANY($1)`,
      [orderIds]
    );

    const allDelivered = ordersStatusResult.rows.every(
      order => order.order_status === 'delivered'
    );

    if (allDelivered) {
      // All orders delivered - delete the route
      await db.query(`DELETE FROM delivery_routes WHERE id = $1`, [routeId]);
      console.log(`[Route Auto-Cleanup] Route #${routeId} deleted - all ${orderIds.length} orders delivered`);
    } else {
      const deliveredCount = ordersStatusResult.rows.filter(
        order => order.order_status === 'delivered'
      ).length;
      console.log(`[Route Auto-Cleanup] Route #${routeId} progress: ${deliveredCount}/${orderIds.length} orders delivered`);
    }
  } catch (error) {
    console.error('[Route Auto-Cleanup] Error:', error.message);
    // Don't throw - this is cleanup, shouldn't fail the delivery
  }
}

/**
 * @route   GET /api/v1/rider-workflow/orders/available
 * @desc    Get available orders for claiming
 * @access  Private (Riders only)
 */
router.get('/orders/available', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orders = await RiderWorkflowService.getAvailableOrders(req.user.id);
    
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
 * @route   GET /api/v1/rider-workflow/orders/active
 * @desc    Get rider's active orders with workflow actions
 * @access  Private (Riders only)
 */
router.get('/orders/active', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orders = await RiderWorkflowService.getActiveOrders(req.user.id);
    
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
 * @route   GET /api/v1/rider-workflow/orders/:id
 * @desc    Get order detail with rider workflow action
 * @access  Private (Riders only)
 */
router.get('/orders/:id', authenticate, authorize('rider'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const order = await RiderWorkflowService.getRiderOrderDetail(orderId, req.user.id);
    
    res.json(order);
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(400).json({
      error: 'Failed to fetch order',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/rider-workflow/orders/:id/claim
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

    const order = await OrderService.assignRider(orderId, req.user.id, req.user.id);
    
    res.json({
      message: 'Order claimed successfully',
      order: {
        ...order,
        rider_action: RiderWorkflowService.getRiderAction(order.order_status)
      }
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
 * @route   POST /api/v1/rider-workflow/orders/:id/verify-pickup
 * @desc    Verify pickup with tracking number
 * @access  Private (Riders only)
 */
router.post('/orders/:id/verify-pickup', authenticate, authorize('rider'), async (req, res) => {
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

    const order = await OrderService.verifyPickupCode(orderId, tracking_number, req.user.id);

    // Broadcast order status update via WebSocket
    const wsService = req.app.locals.wsService;
    if (wsService) {
      wsService.broadcastOrderUpdate(orderId, {
        event_type: 'order:status_updated',
        order_id: orderId,
        new_status: 'in_delivery',
        old_status: 'ready',
        rider_id: req.user.id,
        message: 'Order picked up and in transit',
        pickup_code: order.pickup_code,
        timestamp: new Date()
      });

      // Send notification to customer
      await wsService.sendNotificationToUser(order.student_id, {
        type: 'order_status_change',
        title: 'Order On The Way',
        message: `Your order is on the way! Pickup code: ${order.pickup_code}`,
        order_id: orderId
      });
    }

    res.json({
      message: 'Pickup verified. Order is now in transit',
      order: {
        ...order,
        rider_action: RiderWorkflowService.getRiderAction(order.order_status)
      }
    });
  } catch (error) {
    console.error('Verify pickup error:', error);
    res.status(400).json({
      error: 'Pickup verification failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/rider-workflow/orders/:id/verify-delivery
 * @desc    Verify delivery with customer's 6-digit pickup code
 * @access  Private (Riders only)
 * @param   {string} pickup_code - 6-digit code provided by customer for delivery confirmation
 */
router.post('/orders/:id/verify-delivery', authenticate, authorize('rider'), async (req, res) => {
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

    // Validate pickup code is 6 digits
    const sanitizedCode = String(pickup_code).trim();
    if (!/^\d{6}$/.test(sanitizedCode)) {
      return res.status(400).json({
        error: 'Pickup code must be exactly 6 digits'
      });
    }

    const order = await OrderService.verifyPickupCodeForDelivery(orderId, sanitizedCode, req.user.id);

    // Broadcast order status update via WebSocket
    const wsService = req.app.locals.wsService;
    if (wsService) {
      wsService.broadcastOrderUpdate(orderId, {
        event_type: 'order:status_updated',
        order_id: orderId,
        new_status: 'delivered',
        old_status: 'in_delivery',
        rider_id: req.user.id,
        message: 'Order delivered successfully',
        timestamp: new Date()
      });

      // Send notification to customer
      await wsService.sendNotificationToUser(order.student_id, {
        type: 'order_status_change',
        title: 'Order Delivered',
        message: 'Your order has been delivered successfully',
        order_id: orderId
      });
    }

    // Auto-cleanup: Check if route is complete and delete if all orders delivered
    await autoCleanupCompletedRoute(orderId);

    res.json({
      message: 'Delivery verified successfully with pickup code',
      order: {
        ...order,
        rider_action: RiderWorkflowService.getRiderAction(order.order_status)
      }
    });
  } catch (error) {
    console.error('Verify delivery error:', error);
    res.status(400).json({
      error: 'Delivery verification failed',
      message: error.message
    });
  }
});

module.exports = router;