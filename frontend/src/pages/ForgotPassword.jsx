import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import api from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState('identifier'); // 'identifier', 'otp', 'success'
  const [identifier, setIdentifier] = useState(''); // Phone or email
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [identifierType, setIdentifierType] = useState(''); // 'phone' or 'email'
  const [showPin, setShowPin] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!identifier) {
      setError('Please enter your phone number or email address');
      setLoading(false);
      return;
    }

    try {
      const data = await api.requestPasswordReset(identifier);
      setMessage(data.message || 'Verification code sent!');
      setIdentifierType(data.identifier_type || 'phone');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate OTP
    if (!/^\d{6}$/.test(code)) {
      setError('Verification code must be 6 digits');
      setLoading(false);
      return;
    }

    // Validate new PIN
    if (!/^\d{6}$/.test(newPin)) {
      setError('Password must be exactly 6 digits');
      setLoading(false);
      return;
    }

    // Check for sequential numbers
    const sequential = ['123456', '234567', '345678', '456789', '567890', '654321', '543210', '432109', '321098', '210987'];
    if (sequential.includes(newPin)) {
      setError('Password cannot be a sequential number');
      setLoading(false);
      return;
    }

    // Check for repeated digits
    if (/^(\d)\1{5}$/.test(newPin)) {
      setError('Password cannot be all the same digit');
      setLoading(false);
      return;
    }

    // Confirm passwords match
    if (newPin !== confirmPin) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.resetPassword(identifier, code, newPin);
      setMessage('Password reset successfully!');
      setStep('success');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        route('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="page login-page">
      <div class="container">
        <div class="auth-card">
          <h2>Reset Password</h2>

          {/* Step 1: Enter Phone or Email */}
          {step === 'identifier' && (
            <form onSubmit={handleRequestReset}>
              <p style="text-align: center; color: #666; margin-bottom: 20px;">
                Enter your phone number or email address to receive a verification code
              </p>

              <div class="form-group">
                <label>Phone Number or Email</label>
                <input
                  type="text"
                  placeholder="+23276555001 or email@example.com"
                  value={identifier}
                  onInput={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                />
                <small style="color: #666; display: block; margin-top: 4px;">
                  We'll send a verification code to reset your password
                </small>
              </div>

              <button type="submit" class="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => route('/login')}
                style="margin-top: 12px; width: 100%;"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP and New Password */}
          {step === 'otp' && (
            <form onSubmit={handleResetPassword}>
              {message && (
                <div style="background: #e3f2fd; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                  <p style="margin: 0; color: #1565c0; font-weight: 500;">
                    {identifierType === 'email' ? '📧' : '📱'} {message}
                  </p>
                </div>
              )}

              <div class="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={code}
                  onInput={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  maxLength="6"
                  required
                  style="font-size: 24px; text-align: center; letter-spacing: 8px;"
                  autoFocus
                />
              </div>

              <div class="form-group">
                <label>New Password (6-digit PIN)</label>
                <div style="position: relative;">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    placeholder="Enter new PIN"
                    value={newPin}
                    onInput={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setNewPin(value);
                    }}
                    maxLength="6"
                    required
                    style="font-size: 24px; text-align: center; letter-spacing: 8px; padding-right: 45px;"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 20px;"
                    title={showPin ? 'Hide' : 'Show'}
                  >
                    {showPin ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Confirm New Password</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  placeholder="Confirm new PIN"
                  value={confirmPin}
                  onInput={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setConfirmPin(value);
                  }}
                  maxLength="6"
                  required
                  style="font-size: 24px; text-align: center; letter-spacing: 8px;"
                />
              </div>

              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 14px;">
                <strong>⚠️ Password Requirements:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                  <li>Must be exactly 6 digits</li>
                  <li>Cannot be sequential (e.g., 123456)</li>
                  <li>Cannot be repeated (e.g., 111111)</li>
                </ul>
              </div>

              <button type="submit" class="btn-primary" disabled={loading || code.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => {
                  setStep('identifier');
                  setCode('');
                  setNewPin('');
                  setConfirmPin('');
                  setError('');
                }}
                style="margin-top: 12px; width: 100%;"
              >
                Back
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div style="text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
              <h3 style="color: #4CAF50; margin-bottom: 16px;">Password Reset Successfully!</h3>
              <p style="color: #666; margin-bottom: 24px;">
                You can now login with your new password
              </p>
              <button
                class="btn-primary"
                onClick={() => route('/login')}
                style="width: 100%;"
              >
                Go to Login
              </button>
            </div>
          )}

          {error && <p class="message error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
