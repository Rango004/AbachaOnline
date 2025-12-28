import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';

export default function MerchantPayouts() {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.role !== 'merchant') {
      route('/products');
      return;
    }
    loadPayoutData();
  }, [user]);

  const loadPayoutData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Load each piece of data separately with better error handling
      let balance = 0;
      let transactions = [];
      let payouts = [];
      let pendingAmount = 0;

      try {
        const balanceData = await api.getMerchantBalance();
        balance = balanceData?.balance || 0;
      } catch (err) {
        console.error('Error loading balance:', err);
      }

      try {
        const transactionsData = await api.getMerchantTransactions(50);
        transactions = transactionsData?.transactions || [];
      } catch (err) {
        console.error('Error loading transactions:', err);
      }

      try {
        const payoutsData = await api.getMerchantPayouts();
        payouts = payoutsData?.payouts || [];
      } catch (err) {
        console.error('Error loading payouts:', err);
      }

      try {
        const pendingData = await api.getPendingPayoutAmount();
        pendingAmount = pendingData?.pending_amount || pendingData?.amount || 0;
      } catch (err) {
        console.error('Error loading pending amount:', err);
      }

      setBalance(balance);
      setTransactions(transactions);
      setPayouts(payouts);
      setPendingAmount(pendingAmount);
    } catch (err) {
      console.error('Error loading payout data:', err);
      setErrorMessage('Failed to load payout information');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (balance <= 0) {
      setErrorMessage('You have no available balance to request a payout');
      return;
    }

    try {
      setRequesting(true);
      setErrorMessage('');
      await api.requestMerchantPayout();
      setSuccessMessage('Payout request submitted successfully! It will be processed within 2-3 business days.');
      setTimeout(() => setSuccessMessage(''), 5000);
      await loadPayoutData();
    } catch (err) {
      console.error('Error requesting payout:', err);
      setErrorMessage(err.message || 'Failed to request payout. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'processing':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { text: '✓ Completed', color: '#d1fae5', textColor: '#059669' },
      processing: { text: '⏳ Processing', color: '#dbeafe', textColor: '#1e40af' },
      pending: { text: '⏸ Pending', color: '#fef3c7', textColor: '#92400e' },
      failed: { text: '✗ Failed', color: '#fee2e2', textColor: '#991b1b' },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return <div class="page"><div class="loading">Loading payout information...</div></div>;
  }

  return (
    <div class="page merchant-payouts">
      <div class="container">
        <h2>💳 Payouts & Earnings</h2>
        <p class="welcome-text">Manage your earnings and payout requests</p>

        {successMessage && <div class="alert alert-success">{successMessage}</div>}
        {errorMessage && <div class="alert alert-error">{errorMessage}</div>}

        {/* Overview Section */}
        <div class="payout-overview">
          <div class="balance-card primary">
            <div class="balance-icon">💰</div>
            <div class="balance-content">
              <div class="balance-label">Available Balance</div>
              <div class="balance-value">Le {balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <button
                class="btn-request-payout"
                onClick={handleRequestPayout}
                disabled={requesting || balance <= 0}
              >
                {requesting ? 'Requesting...' : 'Request Payout'}
              </button>
            </div>
          </div>

          <div class="balance-card secondary">
            <div class="balance-icon">⏳</div>
            <div class="balance-content">
              <div class="balance-label">Pending Payout</div>
              <div class="balance-value">Le {pendingAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div class="balance-note">Processing within 2-3 business days</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div class="payout-tabs">
          <button
            class={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Payout History
          </button>
          <button
            class={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            💵 Transactions
          </button>
        </div>

        {/* Payout History Tab */}
        {activeTab === 'overview' && (
          <div class="payout-section">
            <h3>Recent Payouts</h3>
            <div class="payout-table">
              {payouts && payouts.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Date Requested</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Processing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map(payout => {
                      const statusBadge = getStatusBadge(payout.status || 'pending');
                      return (
                        <tr key={payout.id}>
                          <td>{new Date(payout.created_at).toLocaleDateString()}</td>
                          <td class="amount">
                            Le {parseFloat(payout.total_amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </td>
                          <td>
                            <span
                              class="status-badge"
                              style={{
                                backgroundColor: statusBadge.color,
                                color: statusBadge.textColor,
                              }}
                            >
                              {statusBadge.text}
                            </span>
                          </td>
                          <td>{payout.payout_date ? new Date(payout.payout_date).toLocaleDateString() : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div class="empty-state">
                  <p>No payouts yet. Start earning and request your first payout!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div class="payout-section">
            <h3>Transaction History</h3>
            <div class="transactions-list">
              {transactions && transactions.length > 0 ? (
                transactions.map(transaction => (
                  <div key={transaction.id} class="transaction-item">
                    <div class="transaction-info">
                      <div class="transaction-type">{transaction.type === 'credit' ? 'Order Payment' : 'Refund'}</div>
                      <div class="transaction-date">{new Date(transaction.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class={`transaction-amount ${transaction.type === 'credit' ? 'positive' : 'negative'}`}>
                      {transaction.type === 'credit' ? '+' : '−'} Le{' '}
                      {parseFloat(transaction.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              ) : (
                <div class="empty-state">
                  <p>No transactions yet. Your order payments will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div class="payout-info">
          <div class="info-card">
            <h3>📝 Payout Information</h3>
            <ul>
              <li>You earn 95% of each order value as a merchant</li>
              <li>Payouts are processed every 2-3 business days</li>
              <li>Minimum payout amount: Le 10,000</li>
              <li>Payouts are transferred to your registered bank account</li>
              <li>View your transaction history for detailed earning breakdown</li>
            </ul>
          </div>

          <div class="info-card">
            <h3>❓ Need Help?</h3>
            <p>
              If you have questions about your payouts or need to update your bank details, please contact our support team.
            </p>
            <button class="btn-secondary" onClick={() => route('/notifications')}>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .merchant-payouts {
          padding: 20px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .merchant-payouts h2 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 2em;
        }

        .welcome-text {
          color: #6b7280;
          margin-bottom: 30px;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .alert-success {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .alert-error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .payout-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .balance-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .balance-card.primary {
          border-left: 6px solid #10b981;
        }

        .balance-card.secondary {
          border-left: 6px solid #3b82f6;
        }

        .balance-icon {
          font-size: 2.5em;
          min-width: 60px;
        }

        .balance-content {
          flex: 1;
        }

        .balance-label {
          font-size: 0.9em;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .balance-value {
          font-size: 1.8em;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
          word-break: break-word;
        }

        .balance-note {
          font-size: 0.85em;
          color: #6b7280;
        }

        .btn-request-payout {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.9em;
          width: 100%;
          margin-top: 12px;
        }

        .btn-request-payout:hover:not(:disabled) {
          background: #059669;
        }

        .btn-request-payout:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .payout-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab-button {
          padding: 12px 20px;
          border: none;
          background: none;
          cursor: pointer;
          color: #6b7280;
          font-weight: 600;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-size: 0.95em;
        }

        .tab-button.active {
          color: #10b981;
          border-bottom-color: #10b981;
        }

        .tab-button:hover {
          color: #1f2937;
        }

        .payout-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .payout-section h3 {
          margin: 0 0 20px 0;
          color: #1f2937;
          font-size: 1.2em;
        }

        .payout-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
          color: #6b7280;
          font-size: 0.85em;
          text-transform: uppercase;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .amount {
          font-weight: 600;
          color: #1f2937;
        }

        .status-badge {
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: 600;
          display: inline-block;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f9fafb;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
        }

        .transaction-info {
          flex: 1;
        }

        .transaction-type {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .transaction-date {
          font-size: 0.85em;
          color: #6b7280;
        }

        .transaction-amount {
          font-size: 1.1em;
          font-weight: 700;
          margin-left: 20px;
        }

        .transaction-amount.positive {
          color: #10b981;
        }

        .transaction-amount.negative {
          color: #ef4444;
        }

        .payout-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .info-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .info-card h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 1.1em;
        }

        .info-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-card li {
          padding: 8px 0;
          color: #4b5563;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-card li:last-child {
          border-bottom: none;
        }

        .info-card p {
          color: #6b7280;
          margin: 0 0 15px 0;
        }

        .btn-secondary {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
          width: 100%;
        }

        .btn-secondary:hover {
          background: #2563eb;
        }

        @media (max-width: 768px) {
          .payout-overview {
            grid-template-columns: 1fr;
          }

          .balance-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .payout-info {
            grid-template-columns: 1fr;
          }

          table {
            font-size: 0.9em;
          }

          th, td {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}
