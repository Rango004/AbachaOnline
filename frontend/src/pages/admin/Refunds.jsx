import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';

export default function AdminRefunds() {
  const { user } = useContext(AuthContext);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      route('/products');
      return;
    }
    loadRefunds();
  }, [user, filter]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const data = await api.getRefundAudit();
      if (data && data.refunds) {
        const filteredRefunds = filter === 'all'
          ? data.refunds
          : data.refunds.filter(r => r.status === filter);
        setRefunds(filteredRefunds);
      }
    } catch (err) {
      console.error('Error loading refunds:', err);
      alert('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (refundId) => {
    if (!confirm('Approve this refund?')) return;
    try {
      setActionLoading(true);
      await api.updateRefundStatus(refundId, 'approved');
      alert('Refund approved');
      loadRefunds();
      setSelectedRefund(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (refundId) => {
    if (!confirm('Reject this refund?')) return;
    try {
      setActionLoading(true);
      await api.updateRefundStatus(refundId, 'rejected');
      alert('Refund rejected');
      loadRefunds();
      setSelectedRefund(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'escalated': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading && refunds.length === 0) {
    return <div class="page"><p>Loading refunds...</p></div>;
  }

  return (
    <div class="page">
      <div class="container">
        <div class="refunds-header">
          <h2>💰 Refund Management</h2>
          <div class="refund-filters">
            {['all', 'pending', 'escalated', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                class={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {refunds.length === 0 ? (
          <div class="empty-state">
            <p>No {filter === 'all' ? 'refunds' : filter + ' refunds'} found</p>
          </div>
        ) : (
          <div class="refunds-grid">
            {refunds.map(refund => (
              <div
                key={refund.id}
                class="refund-card"
                onClick={() => setSelectedRefund(refund)}
              >
                <div class="refund-header">
                  <div class="refund-id">Refund #{refund.id}</div>
                  <div class="refund-status" style={{color: getStatusColor(refund.status)}}>
                    {refund.status.toUpperCase()}
                  </div>
                </div>
                <div class="refund-details">
                  <div class="detail-row">
                    <span class="label">Order ID:</span>
                    <span class="value">#{refund.order_id}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Customer:</span>
                    <span class="value">{refund.customer_name || `Customer #${refund.customer_id}`}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Merchant:</span>
                    <span class="value">{refund.merchant_name || `Merchant #${refund.merchant_id}`}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Amount:</span>
                    <span class="value">Le {parseFloat(refund.amount || 0).toFixed(2)}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Reason:</span>
                    <span class="value">{refund.reason}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Requested:</span>
                    <span class="value">{new Date(refund.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRefund && (
          <div class="modal-overlay" onClick={() => setSelectedRefund(null)}>
            <div class="modal" onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3>Refund Details #{selectedRefund.id}</h3>
                <button class="close-btn" onClick={() => setSelectedRefund(null)}>×</button>
              </div>
              <div class="modal-body">
                <div class="detail-section">
                  <h4>Order Information</h4>
                  <p><strong>Order ID:</strong> {selectedRefund.order_id}</p>
                  <p><strong>Amount:</strong> Le {parseFloat(selectedRefund.amount || 0).toFixed(2)}</p>
                </div>
                <div class="detail-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedRefund.customer_name || `Customer #${selectedRefund.customer_id}`}</p>
                  <p><strong>Phone:</strong> {selectedRefund.customer_phone || 'N/A'}</p>
                </div>
                <div class="detail-section">
                  <h4>Merchant Information</h4>
                  <p><strong>Name:</strong> {selectedRefund.merchant_name || `Merchant #${selectedRefund.merchant_id}`}</p>
                  <p><strong>Phone:</strong> {selectedRefund.merchant_phone || 'N/A'}</p>
                </div>
                <div class="detail-section">
                  <h4>Refund Reason</h4>
                  <p>{selectedRefund.reason}</p>
                </div>
                {selectedRefund.merchant_response && (
                  <div class="detail-section">
                    <h4>Merchant Response</h4>
                    <p>{selectedRefund.merchant_response}</p>
                  </div>
                )}
                {selectedRefund.status === 'pending' && (
                  <div class="action-buttons">
                    <button
                      class="btn-approve"
                      onClick={() => handleApprove(selectedRefund.id)}
                      disabled={actionLoading}
                    >
                      ✓ Approve Refund
                    </button>
                    <button
                      class="btn-reject"
                      onClick={() => handleReject(selectedRefund.id)}
                      disabled={actionLoading}
                    >
                      ✗ Reject Refund
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .refunds-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
          }

          .refunds-header h2 {
            margin: 0;
            color: #1f2937;
          }

          .refund-filters {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .filter-btn {
            padding: 8px 16px;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .filter-btn:hover {
            background: #f3f4f6;
          }

          .filter-btn.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }

          .refunds-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
          }

          .refund-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .refund-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .refund-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
          }

          .refund-id {
            font-weight: 600;
            color: #1f2937;
          }

          .refund-status {
            font-weight: 600;
            font-size: 0.85em;
          }

          .refund-details {
            font-size: 0.9em;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }

          .detail-row .label {
            color: #6b7280;
            font-weight: 500;
          }

          .detail-row .value {
            color: #1f2937;
            text-align: right;
          }

          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #9ca3af;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
          }

          .modal-header h3 {
            margin: 0;
            color: #1f2937;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #6b7280;
          }

          .modal-body {
            padding: 24px;
          }

          .detail-section {
            margin-bottom: 24px;
          }

          .detail-section h4 {
            margin: 0 0 12px 0;
            color: #1f2937;
            font-size: 1em;
          }

          .detail-section p {
            margin: 8px 0;
            color: #374151;
          }

          .action-buttons {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }

          .btn-approve,
          .btn-reject {
            flex: 1;
            padding: 12px 16px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-approve {
            background: #10b981;
            color: white;
          }

          .btn-approve:hover {
            background: #059669;
          }

          .btn-reject {
            background: #ef4444;
            color: white;
          }

          .btn-reject:hover {
            background: #dc2626;
          }

          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .refunds-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .refunds-grid {
              grid-template-columns: 1fr;
            }

            .modal {
              width: 95%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
