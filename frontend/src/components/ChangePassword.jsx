import { useState } from 'preact/hooks';
import api from '../services/api';

export default function ChangePassword({ onClose, onSuccess }) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPins, setShowPins] = useState(false);

  const validatePin = (pin) => {
    if (!/^\d{6}$/.test(pin)) {
      return 'PIN must be exactly 6 digits';
    }
    const sequential = ['123456', '234567', '345678', '456789', '567890', '654321', '543210', '432109', '321098', '210987'];
    if (sequential.includes(pin)) {
      return 'PIN cannot be a sequential number';
    }
    if (/^(\d)\1{5}$/.test(pin)) {
      return 'PIN cannot be all the same digit';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!currentPin || !newPin || !confirmPin) {
      setError('All fields are required');
      return;
    }

    const newPinError = validatePin(newPin);
    if (newPinError) {
      setError(newPinError);
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }

    if (currentPin === newPin) {
      setError('New PIN must be different from current PIN');
      return;
    }

    try {
      setLoading(true);
      await api.changePassword(currentPin, newPin);
      setSuccess('PIN changed successfully!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (setter) => (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setter(value);
  };

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content change-password-modal" onClick={e => e.stopPropagation()}>
        <div class="modal-header">
          <h2>🔒 Change PIN</h2>
          <button class="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div class="alert alert-error">{error}</div>}
        {success && <div class="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} class="change-password-form">
          <div class="form-group">
            <label>Current PIN</label>
            <div class="pin-input-wrapper">
              <input
                type={showPins ? 'text' : 'password'}
                value={currentPin}
                onInput={handlePinInput(setCurrentPin)}
                placeholder="Enter current 6-digit PIN"
                maxLength="6"
                pattern="\d{6}"
                inputMode="numeric"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <div class="form-group">
            <label>New PIN</label>
            <div class="pin-input-wrapper">
              <input
                type={showPins ? 'text' : 'password'}
                value={newPin}
                onInput={handlePinInput(setNewPin)}
                placeholder="Enter new 6-digit PIN"
                maxLength="6"
                pattern="\d{6}"
                inputMode="numeric"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <small class="form-hint">
              PIN must be 6 digits. Avoid sequential (123456) or repeated (111111) patterns.
            </small>
          </div>

          <div class="form-group">
            <label>Confirm New PIN</label>
            <div class="pin-input-wrapper">
              <input
                type={showPins ? 'text' : 'password'}
                value={confirmPin}
                onInput={handlePinInput(setConfirmPin)}
                placeholder="Re-enter new PIN"
                maxLength="6"
                pattern="\d{6}"
                inputMode="numeric"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={showPins}
                onChange={(e) => setShowPins(e.target.checked)}
              />
              <span>Show PINs</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change PIN'}
            </button>
            <button type="button" class="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
