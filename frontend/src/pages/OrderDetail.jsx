import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import api from '../services/api';
import OrderTracking from '../components/OrderTracking';

export default function OrderDetail({ id }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundPhoto, setRefundPhoto] = useState(null);
  const [refundType, setRefundType] = useState('item_received');
  const [refundRequest, setRefundRequest] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadOrder();
    loadRefundStatus();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await api.getOrder(id);
      setOrder(data);
    } catch (err) {
      console.error('Error loading order:', err);
      alert(err.message);
      route('/orders');
    } finally {
      setLoading(false);
    }
  };

  const loadRefundStatus = async () => {
    try {
      const data = await api.getRefundStatus(id);
      setRefundRequest(data.refundRequest);
    } catch (err) {
      console.error('Error loading refund status:', err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefundPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for refund');
      return;
    }
    if (!refundPhoto) {
      alert('Please upload a photo of the product');
      return;
    }
    try {
      await api.requestRefund(id, refundReason, refundPhoto, refundType);
      alert('Refund request submitted successfully.');
      setShowRefundModal(false);
      setRefundReason('');
      setRefundPhoto(null);
      setRefundType('item_received');
      loadOrder();
      loadRefundStatus();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleInitiateReturn = async () => {
    if (!returnNotes.trim()) {
      alert('Please provide notes about the return');
      return;
    }
    try {
      await api.initiateReturn(refundRequest.id, returnNotes);
      alert('Return initiated successfully. Please send the goods back to the merchant.');
      setShowReturnModal(false);
      setReturnNotes('');
      loadRefundStatus();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUrgeRefund = async () => {
    if (!confirm('This will notify the merchant to respond to your refund request. Continue?')) return;
    try {
      const result = await api.urgeRefund(refundRequest.id);
      alert(result.message);
      loadRefundStatus();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEscalateRefund = async () => {
    if (!confirm('This will escalate your refund request to platform admin for review. Continue?')) return;
    try {
      const result = await api.escalateRefund(refundRequest.id);
      alert(result.message);
      loadRefundStatus();
    } catch (err) {
      alert(err.message);
    }
  };

  const canRefund = () => {
    if (!order || order.order_status !== 'delivered') return false;
    const hoursSinceDelivery = (Date.now() - new Date(order.delivered_at)) / (1000 * 60 * 60);
    return hoursSinceDelivery <= 24;
  };

  const canCancel = () => {
    return order && order.order_status === 'pending';
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    try {
      await api.cancelOrder(id, cancelReason);
      alert('Order cancelled successfully. Stock and credits have been restored.');
      setShowCancelModal(false);
      setCancelReason('');
      loadOrder();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div class="page"><div class="loading">Loading order...</div></div>;
  }

  if (!order) {
    return <div class="page"><p>Order not found</p></div>;
  }

  return (
    <div class="page order-detail-page">
      <div class="container">
        <button class="btn-back" onClick={() => route('/orders')}>
          ← Back to Orders
        </button>

        <h2>Order #{order.id}</h2>

        {order.tracking_number && (
          <div class="tracking-number-display">
            <span class="label">Tracking Number:</span>
            <span class="tracking-code">{order.tracking_number}</span>
          </div>
        )}

        {order.pickup_code && (
          <div class="pickup-code-display" style={{
            backgroundColor: '#FFF3CD',
            border: '2px solid #FFC107',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <span class="label" style={{ display: 'block', fontSize: '0.9em', marginBottom: '8px', color: '#856404' }}>
              {order.order_status === 'in_transit' ? '🔑 YOUR PICKUP CODE (Show to Rider)' : '🔑 Your Pickup Code'}
            </span>
            <span class="pickup-code" style={{
              display: 'block',
              fontSize: '2em',
              fontWeight: 'bold',
              letterSpacing: '4px',
              color: '#856404',
              fontFamily: 'monospace'
            }}>{order.pickup_code}</span>
            {order.order_status === 'in_transit' && (
              <p style={{ fontSize: '0.85em', marginTop: '8px', color: '#856404' }}>
                ⚠️ Show this code to the rider to verify your identity
              </p>
            )}
          </div>
        )}

        <div class="detail-section">
          <h3>Order Status</h3>
          <p class={`status-large status-${order.order_status}`}>
            {order.order_status.toUpperCase()}
          </p>
        </div>

        <div class="detail-section">
          <h3>Delivery Address</h3>
          <p>{order.delivery_address}</p>
          {order.delivery_notes && <p class="notes">Notes: {order.delivery_notes}</p>}
        </div>

        <div class="detail-section">
          <h3>Order Items</h3>
          {order.items && order.items.map(item => (
            <div key={item.id} class="order-item">
              <div>
                <strong>{item.product_name}</strong>
                <p>Quantity: {item.quantity}</p>
                {item.merchant_name && <p class="merchant-info">From: {item.merchant_name}</p>}
              </div>
              <div class="item-price">
                Le {parseFloat(item.subtotal).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div class="detail-section">
          <h3>Payment</h3>
          <p>Method: <strong>{order.payment_method || 'Not set'}</strong></p>
          <p>Status: <strong>{order.payment_status}</strong></p>
          <p class="total-amount">
            Total: <strong>Le {parseFloat(order.total_amount).toFixed(2)}</strong>
          </p>
        </div>

        <div class="detail-section">
          <OrderTracking orderId={id} />
        </div>

        {refundRequest && (
          <div class="detail-section refund-status-section">
            <h3>Refund Status</h3>
            <div class="refund-status-card">
              <p><strong>Status:</strong> <span class={`refund-status-badge status-${refundRequest.status}`}>{refundRequest.status.toUpperCase()}</span></p>
              <p><strong>Type:</strong> {refundRequest.refund_type === 'item_received' ? 'Item Received (Return Required)' : 'Item Not Received'}</p>
              <p><strong>Reason:</strong> {refundRequest.reason}</p>
              {refundRequest.merchant_response && (
                <p><strong>Merchant Response:</strong> {refundRequest.merchant_response}</p>
              )}
              {refundRequest.admin_notes && (
                <p><strong>Admin Notes:</strong> {refundRequest.admin_notes}</p>
              )}
              <p class="refund-date">Requested: {new Date(refundRequest.created_at).toLocaleString()}</p>

              {refundRequest.return_required && (
                <div class="return-tracking-section">
                  <h4 style={{ marginTop: '15px', marginBottom: '10px', fontSize: '1em' }}>Return Tracking</h4>
                  <p><strong>Return Status:</strong> <span class={`return-status-badge status-${refundRequest.return_status}`}>
                    {refundRequest.return_status === 'pending_return' && 'Pending Return'}
                    {refundRequest.return_status === 'customer_initiated_return' && 'Return Initiated'}
                    {refundRequest.return_status === 'merchant_received' && 'Merchant Received'}
                    {refundRequest.return_status === 'verified' && 'Verified'}
                  </span></p>
                  {refundRequest.return_notes && (
                    <p style={{ fontSize: '0.9em', marginTop: '8px' }}><strong>Notes:</strong> {refundRequest.return_notes}</p>
                  )}

                  {refundRequest.return_status === 'pending_return' && (
                    <button class="btn-initiate-return" onClick={() => setShowReturnModal(true)}>
                      📦 Initiate Return
                    </button>
                  )}
                  {refundRequest.return_status === 'customer_initiated_return' && (
                    <p class="info-text">Waiting for merchant to confirm receipt of returned goods...</p>
                  )}
                  {refundRequest.return_status === 'merchant_received' && (
                    <p class="info-text">Merchant has received your return. Waiting for refund approval...</p>
                  )}
                </div>
              )}

              {refundRequest.status === 'pending' && (() => {
                const hoursSinceCreation = (Date.now() - new Date(refundRequest.created_at)) / (1000 * 60 * 60);
                if (hoursSinceCreation >= 24) {
                  return (
                    <button class="btn-urge" onClick={handleUrgeRefund}>
                      ⚠️ Urge Merchant to Respond
                    </button>
                  );
                }
                return <p class="info-text">You can urge the merchant after 24 hours if no response.</p>;
              })()}

              {refundRequest.status === 'urged' && (() => {
                const hoursSinceUrged = (Date.now() - new Date(refundRequest.customer_urged_at)) / (1000 * 60 * 60);
                if (hoursSinceUrged >= 24) {
                  return (
                    <button class="btn-escalate" onClick={handleEscalateRefund}>
                      🚨 Request Platform Intervention
                    </button>
                  );
                }
                return <p class="info-text">You can escalate to admin after 24 hours if merchant still doesn't respond.</p>;
              })()}

              {refundRequest.status === 'escalated' && (
                <p class="info-text">Your refund request is under admin review.</p>
              )}
            </div>
          </div>
        )}

        {showReturnModal && (
          <div class="modal-overlay" onClick={() => setShowReturnModal(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Initiate Return</h3>
              <p>Please provide notes about how you will return the item to the merchant:</p>
              <textarea
                value={returnNotes}
                onInput={(e) => setReturnNotes(e.target.value)}
                placeholder="e.g., Sending via courier service, will drop off at merchant location, etc..."
                rows="4"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button class="btn-primary" onClick={handleInitiateReturn}>Initiate Return</button>
                <button class="btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showCancelModal && (
          <div class="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Cancel Order</h3>
              <p>Are you sure you want to cancel this order? Your items will be returned to inventory and any tokens paid will be refunded.</p>
              <textarea
                value={cancelReason}
                onInput={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you want to cancel this order..."
                rows="4"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button class="btn-cancel" onClick={handleCancel}>Cancel Order</button>
                <button class="btn-secondary" onClick={() => setShowCancelModal(false)}>Keep Order</button>
              </div>
            </div>
          </div>
        )}

        {canCancel() && (
          <div class="detail-section">
            <button class="btn-cancel" onClick={() => setShowCancelModal(true)}>
              Cancel Order
            </button>
          </div>
        )}

        {!refundRequest && canRefund() && (
          <div class="detail-section">
            <button class="btn-refund" onClick={() => setShowRefundModal(true)}>
              Request Refund
            </button>
          </div>
        )}

        {showRefundModal && (
          <div class="modal-overlay" onClick={() => setShowRefundModal(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Request Refund</h3>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Refund Type:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', border: `2px solid ${refundType === 'item_received' ? '#4CAF50' : '#ddd'}`, borderRadius: '8px', backgroundColor: refundType === 'item_received' ? '#f0f8f0' : 'white' }}>
                    <input
                      type="radio"
                      name="refundType"
                      value="item_received"
                      checked={refundType === 'item_received'}
                      onChange={(e) => setRefundType(e.target.value)}
                      style={{ marginRight: '10px' }}
                    />
                    <div>
                      <strong>Item Received (Needs Return)</strong>
                      <p style={{ fontSize: '0.85em', margin: '4px 0 0 0', color: '#666' }}>I received the item but want to return it (defective, wrong item, etc.)</p>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', border: `2px solid ${refundType === 'item_not_received' ? '#4CAF50' : '#ddd'}`, borderRadius: '8px', backgroundColor: refundType === 'item_not_received' ? '#f0f8f0' : 'white' }}>
                    <input
                      type="radio"
                      name="refundType"
                      value="item_not_received"
                      checked={refundType === 'item_not_received'}
                      onChange={(e) => setRefundType(e.target.value)}
                      style={{ marginRight: '10px' }}
                    />
                    <div>
                      <strong>Item Not Received</strong>
                      <p style={{ fontSize: '0.85em', margin: '4px 0 0 0', color: '#666' }}>I never received the item (wrong address, merchant didn't ship, etc.)</p>
                    </div>
                  </label>
                </div>
              </div>

              <textarea
                value={refundReason}
                onInput={(e) => setRefundReason(e.target.value)}
                placeholder="Detailed reason for refund..."
                rows="4"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ width: '100%' }}
                />
                {refundPhoto && (
                  <img src={refundPhoto} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '4px' }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button class="btn-primary" onClick={handleRefund}>Submit Refund</button>
                <button class="btn-secondary" onClick={() => setShowRefundModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .btn-cancel {
          background: #FF9800;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1em;
          font-weight: 600;
        }
        .btn-cancel:hover {
          background: #F57C00;
        }
        .btn-refund {
          background: #f44336;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1em;
          font-weight: 600;
        }
        .btn-refund:hover {
          background: #d32f2f;
        }
        .btn-urge {
          background: #FF9800;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95em;
          font-weight: 600;
          margin-top: 12px;
        }
        .btn-urge:hover {
          background: #F57C00;
        }
        .btn-escalate {
          background: #E91E63;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95em;
          font-weight: 600;
          margin-top: 12px;
        }
        .btn-escalate:hover {
          background: #C2185B;
        }
        .refund-status-card {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .refund-status-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.9em;
        }
        .refund-status-badge.status-pending {
          background: #FFF3CD;
          color: #856404;
        }
        .refund-status-badge.status-urged {
          background: #FFE0B2;
          color: #E65100;
        }
        .refund-status-badge.status-escalated {
          background: #F8BBD0;
          color: #880E4F;
        }
        .refund-status-badge.status-approved {
          background: #C8E6C9;
          color: #2E7D32;
        }
        .refund-status-badge.status-rejected {
          background: #FFCDD2;
          color: #C62828;
        }
        .refund-date {
          font-size: 0.85em;
          color: #666;
          margin-top: 8px;
        }
        .info-text {
          font-size: 0.9em;
          color: #666;
          margin-top: 12px;
          font-style: italic;
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
        .btn-initiate-return {
          background: #2196F3;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95em;
          font-weight: 600;
          margin-top: 12px;
        }
        .btn-initiate-return:hover {
          background: #1976D2;
        }
        .return-tracking-section {
          background: #f0f8ff;
          padding: 12px;
          border-radius: 6px;
          margin-top: 15px;
          border-left: 4px solid #2196F3;
        }
        .return-status-badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.85em;
        }
        .return-status-badge.status-pending_return {
          background: #FFF3E0;
          color: #E65100;
        }
        .return-status-badge.status-customer_initiated_return {
          background: #E3F2FD;
          color: #1565C0;
        }
        .return-status-badge.status-merchant_received {
          background: #F3E5F5;
          color: #6A1B9A;
        }
        .return-status-badge.status-verified {
          background: #C8E6C9;
          color: #2E7D32;
        }
      `}</style>
    </div>
  );
}
