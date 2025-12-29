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
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpMethod, setOtpMethod] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await api.login(phone);
      setMessage(data.message || 'Verification code sent!');
      setOtpMethod(data.method || 'sms');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const data = await api.login(phone);
      setMessage('New verification code sent! Please check your phone.');
      setOtpMethod(data.method || 'sms');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
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
              {/* Success message */}
              <div style="background: #e3f2fd; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; color: #1565c0; font-weight: 500;">
                  {otpMethod === 'whatsapp' ? '📱 Check WhatsApp' :
                   otpMethod === 'flashcall' ? '📞 Incoming call' :
                   '💬 Check SMS'}
                </p>
                <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                  {message}
                </p>
              </div>

              <div class="form-group">
                <label>Enter 6-Digit Code</label>
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

              {/* Didn't receive code section */}
              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px; margin-bottom: 12px;">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  style="background: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 10px 16px; border-radius: 8px; cursor: pointer; width: 100%;"
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
                <p style="color: #999; font-size: 12px; margin-top: 8px;">
                  SMS may take 1-2 minutes. Check if your number is correct.
                </p>
              </div>

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
