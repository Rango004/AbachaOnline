import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';
import { useWebSocket } from '../../services/WebSocketContext';

const statusOptions = [
  { value: 'confirmed', label: '✅ Confirm Order', color: '#4CAF50' },
  { value: 'preparing', label: '👨‍🍳 Start Preparing', color: '#FF9800' },
  { value: 'ready', label: '📦 Mark as Ready', color: '#2196F3' }
];

export default function MerchantOrders() {
  const { user } = useContext(AuthContext);
  const { isConnected, joinOrderRoom, leaveOrderRoom } = useWebSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [assigningRider, setAssigningRider] = useState(null);
  const [refundRequests, setRefundRequests] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundResponse, setRefundResponse] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [showVerifyReturnModal, setShowVerifyReturnModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [joinedRooms, setJoinedRooms] = useState([]);

  useEffect(() => {
    if (user?.role !== 'merchant') {
      route('/products');
      return;
    }
    loadOrders();
    loadRefundRequests();
  }, [user]);

  // Join/leave order rooms when orders change
  useEffect(() => {
    if (!isConnected) return;

    const currentOrderIds = orders.map(o => o.id);
    const newJoinedRooms = [];

    // Join rooms for new orders
    currentOrderIds.forEach(orderId => {
      if (!joinedRooms.includes(orderId)) {
        joinOrderRoom(orderId);
        newJoinedRooms.push(orderId);
      }
    });

    // Leave rooms for orders that are no longer displayed
    joinedRooms.forEach(roomId => {
      if (!currentOrderIds.includes(roomId)) {
        leaveOrderRoom(roomId);
      }
    });

    setJoinedRooms(currentOrderIds);

    return () => {
      // Clean up on unmount
      currentOrderIds.forEach(orderId => {
        leaveOrderRoom(orderId);
      });
    };
  }, [orders, isConnected, joinOrderRoom, leaveOrderRoom, joinedRooms]);

  // Listen for real-time order updates via WebSocket
  useEffect(() => {
    const handleOrderUpdate = (event) => {
      const update = event.detail;
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.id === update.order_id) {
            return { ...order, order_status: update.new_status };
          }
          return order;
        })
      );
    };

    window.addEventListener('order:status_updated', handleOrderUpdate);
    return () => {
      window.removeEventListener('order:status_updated', handleOrderUpdate);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.request('/merchant/orders');
      const data = response.orders || response;

      // Sort by created_at descending
      const sortedOrders = data.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, statusNotes);
      alert(`Order status updated to ${newStatus}!`);
      setSelectedOrder(null);
      setStatusNotes('');
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAutoAssignRider = async (orderId) => {
    if (!confirm('Auto-assign a rider to this order?')) return;

    try {
      setAssigningRider(orderId);
      const result = await api.autoAssignRider(orderId);
      alert(result.message || 'Rider assigned successfully!');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to assign rider');
    } finally {
      setAssigningRider(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFC107',
      confirmed: '#4CAF50',
      preparing: '#FF9800',
      ready: '#2196F3',
      in_transit: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    };
    return colors[status] || '#757575';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canUpdateStatus = (currentStatus) => {
    return ['pending', 'confirmed', 'preparing'].includes(currentStatus);
  };

  const canRefund = (status) => {
    return ['confirmed', 'preparing', 'ready', 'delivered'].includes(status);
  };

  const loadRefundRequests = async () => {
    try {
      const data = await api.getMerchantRefundRequests();
      setRefundRequests(data.requests || []);
    } catch (err) {
      console.error('Error loading refund requests:', err);
    }
  };

  const handleApproveRefund = async () => {
    try {
      await api.approveRefund(selectedRefund.id, refundResponse || 'Approved');
      alert('Refund approved');
      setShowRefundModal(false);
      setSelectedRefund(null);
      setRefundResponse('');
      loadOrders();
      loadRefundRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectRefund = async () => {
    if (!refundResponse.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await api.rejectRefund(selectedRefund.id, refundResponse);
      alert('Refund rejected');
      setShowRefundModal(false);
      setSelectedRefund(null);
      setRefundResponse('');
      loadRefundRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyReturn = async () => {
    if (!verificationNotes.trim()) {
      alert('Please provide verification notes');
      return;
    }
    try {
      await api.merchantVerifyReturn(selectedRefund.id, verificationNotes);
      alert('Return verified successfully. You can now approve the refund.');
      setShowVerifyReturnModal(false);
      setVerificationNotes('');
      loadRefundRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div class="page"><div class="loading">Loading orders...</div></div>;
  }

  const pendingRefundsCount = refundRequests.filter(r => ['pending', 'urged'].includes(r.status)).length;

  return (
    <div class="page merchant-orders">
      <div class="container">
        <h2>Merchant Dashboard</h2>

        <div class="tabs">
          <button
            class={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
          <button
            class={`tab ${activeTab === 'refunds' ? 'active' : ''}`}
            onClick={() => setActiveTab('refunds')}
          >
            💰 Refund Requests
            {pendingRefundsCount > 0 && (
              <span class="notification-badge">{pendingRefundsCount}</span>
            )}
          </button>
        </div>

        {activeTab === 'orders' && (
          <>
            {pendingRefundsCount > 0 && (
              <div class="quick-alert" onClick={() => setActiveTab('refunds')}>
                ⚠️ You have {pendingRefundsCount} refund request{pendingRefundsCount > 1 ? 's' : ''} requiring attention. Click here to review.
              </div>
            )}

            {orders.length === 0 ? (
              <p class="no-orders">No orders yet.</p>
            ) : (
          <div class="orders-list">
            {orders.map(order => (
              <div key={order.id} class="order-card">
                <div class="order-header">
                  <div>
                    <h3>Order #{order.id}</h3>
                    {order.tracking_number && (
                      <p class="tracking">📍 {order.tracking_number}</p>
                    )}
                    {order.pickup_code && (
                      <p class="pickup-code" style={{ fontSize: '0.9em', color: '#856404', marginTop: '4px' }}>
                        🔑 Customer Pickup Code: <strong style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>{order.pickup_code}</strong>
                      </p>
                    )}
                  </div>
                  <span
                    class="status-badge"
                    style={{ backgroundColor: getStatusColor(order.order_status) }}
                  >
                    {order.order_status}
                  </span>
                </div>

                <div class="order-details">
                  <p><strong>Customer:</strong> {order.customer_name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {order.customer_phone || 'N/A'}</p>
                  <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
                  {order.delivery_notes && (
                    <p><strong>Notes:</strong> {order.delivery_notes}</p>
                  )}
                  <p><strong>Order Time:</strong> {formatDate(order.created_at)}</p>
                </div>

                <div class="order-items">
                  <strong>Items:</strong>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} class="order-item">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>Le {parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div class="order-footer">
                  <div class="order-total">
                    <strong>Total: Le {parseFloat(order.total_amount).toFixed(2)}</strong>
                    {order.rider_id && order.rider_name && (
                      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
                        🚚 Rider: {order.rider_name}
                      </p>
                    )}
                  </div>

                  {/* Show Auto-assign button for ready orders without rider */}
                  {order.order_status === 'ready' && !order.rider_id && (
                    <button
                      class="btn-primary"
                      style={{ backgroundColor: '#9C27B0' }}
                      onClick={() => handleAutoAssignRider(order.id)}
                      disabled={assigningRider === order.id}
                    >
                      {assigningRider === order.id ? '⏳ Assigning...' : '🚚 Auto-assign Rider'}
                    </button>
                  )}

                  {canUpdateStatus(order.order_status) && (
                    <div class="status-actions">
                      {statusOptions.map(option => {
                        // Show only relevant status options
                        if (order.order_status === 'pending' && option.value === 'confirmed') {
                          return (
                            <button
                              key={option.value}
                              class="btn-status"
                              style={{ backgroundColor: option.color }}
                              onClick={() => {
                                setSelectedOrder(order.id);
                                handleUpdateStatus(order.id, option.value);
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        }
                        if (order.order_status === 'confirmed' && option.value === 'preparing') {
                          return (
                            <button
                              key={option.value}
                              class="btn-status"
                              style={{ backgroundColor: option.color }}
                              onClick={() => {
                                setSelectedOrder(order.id);
                                handleUpdateStatus(order.id, option.value);
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        }
                        if (order.order_status === 'preparing' && option.value === 'ready') {
                          return (
                            <button
                              key={option.value}
                              class="btn-status"
                              style={{ backgroundColor: option.color }}
                              onClick={() => {
                                setSelectedOrder(order.id);
                                handleUpdateStatus(order.id, option.value);
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  <button
                    class="btn-secondary"
                    onClick={() => route(`/orders/${order.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {activeTab === 'refunds' && (
          <div class="refunds-view">
            <h3>Refund Requests Management</h3>

            {refundRequests.length === 0 ? (
              <p class="no-requests">No refund requests yet.</p>
            ) : (
              <>
                {refundRequests.filter(r => ['pending', 'urged'].includes(r.status)).length > 0 && (
                  <div class="section">
                    <h4 class="section-title urgent-section">⚠️ REQUIRES YOUR ACTION ({refundRequests.filter(r => ['pending', 'urged'].includes(r.status)).length})</h4>
                    {refundRequests.filter(r => ['pending', 'urged'].includes(r.status)).map(req => {
                      const hoursSinceCreation = (Date.now() - new Date(req.created_at)) / (1000 * 60 * 60);
                      const isUrged = req.status === 'urged';
                      const isOld = hoursSinceCreation > 24;

                      return (
                        <div key={req.id} class={`refund-request-card ${isUrged ? 'urgent' : isOld ? 'warning' : ''}`}>
                          <div class="refund-header">
                            <div>
                              <p><strong>Order #{req.order_id}</strong></p>
                              <p class="customer-info">👤 {req.customer_name} - 📱 {req.customer_phone}</p>
                            </div>
                            {isUrged && <span class="urgent-badge">🚨 URGED BY CUSTOMER</span>}
                            {!isUrged && isOld && <span class="warning-badge">⚠️ OVER 24 HOURS</span>}
                          </div>
                          <div class="refund-details">
                            <p><strong>Type:</strong> {req.refund_type === 'item_received' ? '📦 Item Received (Return Required)' : '❌ Item Not Received'}</p>
                            <p><strong>Reason:</strong> {req.reason}</p>
                            <p><strong>Amount:</strong> Le {parseFloat(req.total_amount || 0).toFixed(2)}</p>
                            <p class="time-info">📅 Requested: {new Date(req.created_at).toLocaleString()}</p>
                            {req.customer_urged_at && (
                              <p class="time-info urged">🔔 Customer Urged: {new Date(req.customer_urged_at).toLocaleString()}</p>
                            )}
                          </div>

                          {req.return_required && (
                            <div class="return-info">
                              <p><strong>Return Status:</strong>
                                <span class={`return-badge status-${req.return_status}`}>
                                  {req.return_status === 'pending_return' && 'Pending Return'}
                                  {req.return_status === 'customer_initiated_return' && 'Customer Initiated'}
                                  {req.return_status === 'merchant_received' && 'You Received'}
                                  {req.return_status === 'verified' && 'Verified'}
                                </span>
                              </p>
                              {req.return_notes && (
                                <p class="return-notes"><strong>Return Notes:</strong> {req.return_notes}</p>
                              )}

                              {req.return_status === 'customer_initiated_return' && (
                                <button
                                  class="btn-verify-return"
                                  onClick={() => {
                                    setSelectedRefund(req);
                                    setShowVerifyReturnModal(true);
                                  }}>
                                  ✅ Verify Return Receipt
                                </button>
                              )}
                            </div>
                          )}
                          {req.photo_data && (
                            <div class="photo-preview">
                              <p><strong>Product Photo:</strong></p>
                              <img src={req.photo_data} alt="Product" class="refund-photo" />
                            </div>
                          )}
                          <button class="btn-review" onClick={() => { setSelectedRefund(req); setShowRefundModal(true); }}>
                            📝 Review & Respond Now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {refundRequests.filter(r => ['approved', 'rejected'].includes(r.status)).length > 0 && (
                  <div class="section">
                    <h4 class="section-title">✅ Processed Requests</h4>
                    {refundRequests.filter(r => ['approved', 'rejected'].includes(r.status)).map(req => (
                      <div key={req.id} class="refund-request-card processed">
                        <div class="refund-header">
                          <div>
                            <p><strong>Order #{req.order_id}</strong></p>
                            <p class="customer-info">👤 {req.customer_name}</p>
                          </div>
                          <span class={`status-badge status-${req.status}`}>
                            {req.status === 'approved' ? '✅ APPROVED' : '❌ REJECTED'}
                          </span>
                        </div>
                        <p><strong>Type:</strong> {req.refund_type === 'item_received' ? '📦 Item Received (Return Required)' : '❌ Item Not Received'}</p>
                        <p><strong>Reason:</strong> {req.reason}</p>
                        <p><strong>Your Response:</strong> {req.merchant_response || 'N/A'}</p>
                        {req.return_required && req.return_status && (
                          <p><strong>Return Status:</strong>
                            <span class={`return-badge status-${req.return_status}`}>
                              {req.return_status === 'verified' && '✅ Verified'}
                              {req.return_status === 'merchant_received' && 'Received'}
                            </span>
                          </p>
                        )}
                        <p class="time-info">📅 Processed: {new Date(req.updated_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}

                {refundRequests.filter(r => r.status === 'escalated').length > 0 && (
                  <div class="section">
                    <h4 class="section-title escalated-section">🚨 Escalated to Platform Admin</h4>
                    {refundRequests.filter(r => r.status === 'escalated').map(req => (
                      <div key={req.id} class="refund-request-card escalated">
                        <div class="refund-header">
                          <div>
                            <p><strong>Order #{req.order_id}</strong></p>
                            <p class="customer-info">👤 {req.customer_name}</p>
                          </div>
                          <span class="status-badge status-escalated">⚖️ ADMIN REVIEW</span>
                        </div>
                        <p><strong>Reason:</strong> {req.reason}</p>
                        <p class="time-info">📅 Escalated: {new Date(req.escalated_at).toLocaleString()}</p>
                        <div class="info-message">
                          ℹ️ This refund request has been escalated to platform administration for final review and decision.
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {showRefundModal && selectedRefund && (
          <div class="modal-overlay" onClick={() => setShowRefundModal(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Review Refund Request</h3>
              <p><strong>Order #{selectedRefund.order_id}</strong></p>
              <p><strong>Customer:</strong> {selectedRefund.customer_name}</p>
              <p><strong>Type:</strong> {selectedRefund.refund_type === 'item_received' ? '📦 Item Received (Return Required)' : '❌ Item Not Received'}</p>
              <p><strong>Amount:</strong> Le {selectedRefund.total_amount}</p>
              <p><strong>Reason:</strong> {selectedRefund.reason}</p>
              {selectedRefund.photo_data && (
                <div>
                  <p><strong>Photo:</strong></p>
                  <img src={selectedRefund.photo_data} alt="Product" style={{ maxWidth: '300px', borderRadius: '4px' }} />
                </div>
              )}

              {selectedRefund.return_required && (
                <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '6px', margin: '12px 0', borderLeft: '3px solid #2196F3' }}>
                  <p><strong>Return Status:</strong>
                    <span class={`return-badge status-${selectedRefund.return_status}`}>
                      {selectedRefund.return_status === 'pending_return' && 'Pending Return'}
                      {selectedRefund.return_status === 'customer_initiated_return' && 'Customer Initiated'}
                      {selectedRefund.return_status === 'merchant_received' && 'You Received'}
                      {selectedRefund.return_status === 'verified' && 'Verified'}
                    </span>
                  </p>
                  {selectedRefund.return_notes && (
                    <p style={{ fontSize: '0.9em', marginTop: '8px' }}><strong>Return Notes:</strong> {selectedRefund.return_notes}</p>
                  )}

                  {selectedRefund.return_status === 'customer_initiated_return' && (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#856404' }}>⚠️ You must verify return receipt before approving</p>
                      <textarea
                        value={verificationNotes}
                        onInput={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Enter verification notes (e.g., condition of returned goods, receipt date, etc.)"
                        rows="3"
                        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                      />
                      <button class="btn-verify-return" onClick={async () => {
                        if (!verificationNotes.trim()) {
                          alert('Please provide verification notes');
                          return;
                        }
                        try {
                          await api.merchantVerifyReturn(selectedRefund.id, verificationNotes);
                          alert('Return verified! You can now approve the refund.');
                          setVerificationNotes('');
                          setShowRefundModal(false);
                          loadRefundRequests();
                        } catch (err) {
                          alert(err.message);
                        }
                      }}>
                        ✅ Verify Return Receipt
                      </button>
                    </div>
                  )}

                  {selectedRefund.return_status === 'pending_return' && (
                    <p style={{ fontSize: '0.9em', marginTop: '8px', color: '#666', fontStyle: 'italic' }}>
                      Waiting for customer to initiate return...
                    </p>
                  )}
                </div>
              )}

              <textarea
                value={refundResponse}
                onInput={(e) => setRefundResponse(e.target.value)}
                placeholder="Your response (optional for approval, required for rejection)..."
                rows="3"
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button class="btn-primary" onClick={handleApproveRefund}>Approve</button>
                <button class="btn-refund" onClick={handleRejectRefund}>Reject</button>
                <button class="btn-secondary" onClick={() => setShowRefundModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showVerifyReturnModal && selectedRefund && (
          <div class="modal-overlay" onClick={() => setShowVerifyReturnModal(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Verify Return Receipt</h3>
              <p><strong>Order #{selectedRefund.order_id}</strong></p>
              <p>Confirm that you have received the returned goods from the customer.</p>
              <textarea
                value={verificationNotes}
                onInput={(e) => setVerificationNotes(e.target.value)}
                placeholder="Verification notes (e.g., condition of returned goods, receipt date, etc.)"
                rows="4"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button class="btn-primary" onClick={handleVerifyReturn}>Confirm Receipt</button>
                <button class="btn-secondary" onClick={() => setShowVerifyReturnModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .tabs {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          border-bottom: 2px solid #e0e0e0;
        }
        .tab {
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 1em;
          font-weight: 500;
          color: #666;
          transition: all 0.3s ease;
          position: relative;
        }
        .tab:hover {
          color: #333;
          background: #f5f5f5;
        }
        .tab.active {
          color: #2196F3;
          border-bottom-color: #2196F3;
          font-weight: 600;
        }
        .notification-badge {
          position: absolute;
          top: 4px;
          right: 8px;
          background: #f44336;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 0.75em;
          font-weight: bold;
          min-width: 20px;
          text-align: center;
        }
        .quick-alert {
          background: linear-gradient(135deg, #FFF3CD 0%, #FFE0B2 100%);
          border: 2px solid #FF9800;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          text-align: center;
        }
        .quick-alert:hover {
          background: linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        }
        .refunds-view {
          margin-top: 20px;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 1.2em;
          margin-bottom: 16px;
          padding: 12px;
          background: #f5f5f5;
          border-left: 4px solid #2196F3;
          border-radius: 4px;
        }
        .section-title.urgent-section {
          background: #FFEBEE;
          border-left-color: #f44336;
          color: #c62828;
        }
        .section-title.escalated-section {
          background: #F3E5F5;
          border-left-color: #9C27B0;
          color: #6A1B9A;
        }
        .no-requests {
          text-align: center;
          padding: 40px;
          color: #999;
          font-size: 1.1em;
        }
        .refund-requests-alert {
          background: #FFF3CD;
          border: 2px solid #FFC107;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .refund-request-card {
          background: white;
          padding: 16px;
          margin: 12px 0;
          border-radius: 8px;
          border: 2px solid #ddd;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .refund-request-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .refund-request-card.urgent {
          border: 3px solid #E91E63;
          background: linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%);
          box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
        }
        .refund-request-card.warning {
          border: 2px solid #FF9800;
          background: #FFF3E0;
        }
        .refund-request-card.processed {
          background: #F5F5F5;
          border-color: #BDBDBD;
        }
        .refund-request-card.escalated {
          background: #F3E5F5;
          border-color: #9C27B0;
        }
        .refund-details {
          margin: 12px 0;
        }
        .customer-info {
          font-size: 0.9em;
          color: #666;
          margin-top: 4px;
        }
        .photo-preview {
          margin: 16px 0;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
        }
        .refund-photo {
          max-width: 200px;
          border-radius: 8px;
          margin-top: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .btn-review {
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1em;
          font-weight: 600;
          margin-top: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
        }
        .btn-review:hover {
          background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
        }
        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-badge.status-approved {
          background: #C8E6C9;
          color: #2E7D32;
        }
        .status-badge.status-rejected {
          background: #FFCDD2;
          color: #C62828;
        }
        .status-badge.status-escalated {
          background: #E1BEE7;
          color: #6A1B9A;
        }
        .info-message {
          background: #E3F2FD;
          border-left: 4px solid #2196F3;
          padding: 12px;
          margin-top: 12px;
          border-radius: 4px;
          font-size: 0.95em;
          color: #1565C0;
        }
        .refund-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .urgent-badge {
          background: #E91E63;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
          animation: pulse 2s infinite;
        }
        .warning-badge {
          background: #FF9800;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
        }
        .time-info {
          font-size: 0.85em;
          color: #666;
          margin-top: 4px;
        }
        .time-info.urged {
          color: #E91E63;
          font-weight: 600;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .btn-refund {
          background: #f44336;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 600;
        }
        .btn-refund:hover {
          background: #d32f2f;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }
        .return-info {
          background: #f0f8ff;
          padding: 10px;
          border-radius: 6px;
          margin-top: 10px;
          border-left: 3px solid #2196F3;
        }
        .return-badge {
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 0.85em;
          font-weight: 600;
          margin-left: 8px;
        }
        .return-badge.status-pending_return {
          background: #FFF3E0;
          color: #E65100;
        }
        .return-badge.status-customer_initiated_return {
          background: #E3F2FD;
          color: #1565C0;
        }
        .return-badge.status-merchant_received {
          background: #F3E5F5;
          color: #6A1B9A;
        }
        .return-badge.status-verified {
          background: #C8E6C9;
          color: #2E7D32;
        }
        .btn-verify-return {
          background: #4CAF50;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-verify-return:hover {
          background: #388E3C;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
        }
        .return-notes {
          font-size: 0.9em;
          color: #666;
          font-style: italic;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
