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
  const [devOTP, setDevOTP] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setDevOTP('');

    try {
      const data = await api.login(phone);
      setMessage(data.message || 'OTP sent successfully!');

      // Show OTP in development mode
      if (data.otp) {
        setDevOTP(data.otp);
      }

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
              </div>

              <button type="submit" class="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div class="form-group">
                <label>Enter OTP Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onInput={(e) => setCode(e.target.value)}
                  maxLength="6"
                  required
                />
              </div>

              <button type="submit" class="btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => setStep('phone')}
              >
                Change Phone
              </button>
            </form>
          )}

          {message && <p class="message success">{message}</p>}
          {devOTP && (
            <div class="dev-otp-display">
              <strong>Development OTP:</strong> {devOTP}
            </div>
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
