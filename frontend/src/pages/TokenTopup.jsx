import { useState, useEffect } from 'preact/hooks';
import api from '../services/api';

export default function TokenTopup() {
  const [pinCode, setPinCode] = useState('');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBalance();
    loadHistory();
  }, []);

  const loadBalance = async () => {
    try {
      const data = await api.getTokenBalance();
      setBalance(data.balance || 0);
    } catch (err) {
      console.error('Error loading balance:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getTopupHistory(10);
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate PIN format
    if (!/^\d{17}$/.test(pinCode)) {
      setMessage({ type: 'error', text: 'PIN must be exactly 17 digits' });
      setLoading(false);
      return;
    }

    try {
      const result = await api.redeemTokenPIN(pinCode);

      setMessage({
        type: 'success',
        text: `Success! Le ${result.data.amount.toFixed(2)} added to your account`
      });

      // Update balance
      setBalance(result.data.newBalance);

      // Clear PIN input
      setPinCode('');

      // Reload history
      loadHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formatPIN = (value) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 17 digits
    return digits.slice(0, 17);
  };

  const handlePinChange = (e) => {
    setPinCode(formatPIN(e.target.value));
  };

  return (
    <div class="page token-topup-page">
      <div class="container">
        <h2>Token Credits Top-up</h2>

        {/* Current Balance */}
        <div class="balance-card">
          <div class="balance-label">Current Balance</div>
          <div class="balance-amount">Le {balance.toFixed(2)}</div>
        </div>

        {/* Top-up Form */}
        <div class="topup-section">
          <h3>Redeem PIN Code</h3>
          <p class="help-text">
            Enter your 17-digit PIN code to add token credits to your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div class="form-group">
              <label>PIN Code (17 digits)</label>
              <input
                type="text"
                placeholder="Enter 17-digit PIN"
                value={pinCode}
                onInput={handlePinChange}
                required
                maxLength="17"
                inputMode="numeric"
                pattern="\d{17}"
              />
              <small class="pin-hint">
                {pinCode.length}/17 digits entered
              </small>
            </div>

            {message.text && (
              <p class={`message ${message.type}`}>{message.text}</p>
            )}

            <button type="submit" class="btn-primary" disabled={loading || pinCode.length !== 17}>
              {loading ? 'Processing...' : 'Redeem PIN'}
            </button>
          </form>
        </div>

        {/* Top-up History */}
        {history.length > 0 && (
          <div class="history-section">
            <h3>Top-up History</h3>
            <div class="history-list">
              {history.map((item, index) => (
                <div key={index} class="history-item">
                  <div class="history-info">
                    <div class="history-pin">
                      PIN: ****{item.pin_code.slice(-4)}
                    </div>
                    <div class="history-date">
                      {new Date(item.used_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div class="history-amount">
                    +Le {parseFloat(item.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div class="help-section">
          <h3>How to get PIN codes?</h3>
          <ul>
            <li>Purchase token credit PINs from authorized vendors</li>
            <li>Each PIN is 17 digits long and can be used only once</li>
            <li>PINs may have expiration dates - use them promptly</li>
            <li>Contact support if you have issues redeeming a PIN</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
