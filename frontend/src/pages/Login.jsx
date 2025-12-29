import { useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';
import api from '../services/api';

export default function Login() {
  const { user, setUser } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [otpMethod, setOtpMethod] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setOtp('');

    try {
      const data = await api.login(phone);
      setMessage(data.message || 'OTP sent successfully!');

      // Store OTP if returned (fallback mode)
      if (data.otp) {
        setOtp(data.otp);
      }

      // Store delivery method
      setOtpMethod(data.method || 'sms');

      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.verifyLogin(phone, code);

      // Get user profile to determine role-based routing
      const profile = await api.getProfile();

      // Route user to their role-specific dashboard
      let dashboardPath = '/products'; // Default for students/customers

      if (profile.role === 'merchant') {
        dashboardPath = '/merchant';
      } else if (profile.role === 'rider') {
        dashboardPath = '/rider';
      } else if (profile.role === 'admin') {
        dashboardPath = '/admin';
      }

      route(dashboardPath);
      window.location.reload(); // Force reload to update AuthContext
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="page login-page">
      <div class="container">
        <div class="auth-card">
          <h2>Login to AbachaOnline</h2>

          {step === 'phone' ? (
            <form onSubmit={handleRequestOTP}>
              <div class="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+23276555001"
                  value={phone}
                  onInput={(e) => setPhone(e.target.value)}
                  required
                />
                <small style="color: #666; display: block; margin-top: 4px;">
                  Include country code (e.g., +232 for Sierra Leone)
                </small>
              </div>

              <button type="submit" class="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <p class="info-text">{message}</p>

              {/* Show OTP prominently if returned (fallback mode) */}
              {otp && (
                <div style="background: #e8f5e9; border: 2px solid #4CAF50; border-radius: 12px; padding: 20px; text-align: center; margin: 16px 0;">
                  <p style="margin: 0 0 8px 0; color: #2e7d32; font-weight: 500;">
                    Your Verification Code:
                  </p>
                  <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b5e20;">
                    {otp}
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">
                    {otpMethod === 'sms' ? 'Also sent via SMS (may take a moment)' :
                     otpMethod === 'whatsapp' ? 'Sent via WhatsApp' :
                     otpMethod === 'flashcall' ? 'Check incoming call for code' :
                     'Use this code to login'}
                  </p>
                </div>
              )}

              <div class="form-group">
                <label>Enter Verification Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onInput={(e) => setCode(e.target.value)}
                  maxLength="6"
                  required
                  style="font-size: 24px; text-align: center; letter-spacing: 8px;"
                />
              </div>

              <button type="submit" class="btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => setStep('phone')}
                style="margin-top: 12px; width: 100%;"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {error && <p class="message error">{error}</p>}

          <p class="auth-link">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}
