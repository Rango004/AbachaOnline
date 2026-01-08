import { useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';
import api from '../services/api';

export default function Login() {
  const { user, setUser } = useContext(AuthContext);
  const [loginType, setLoginType] = useState('choice'); // 'choice', 'phone', 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'choose', 'otp', 'pin', or 'email'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpMethod, setOtpMethod] = useState('');
  const [hasPIN, setHasPIN] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePinInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user exists and has PIN
      const userStatus = await api.checkUser(phone);

      if (!userStatus.exists) {
        setError('User not found. Please register first.');
        setLoading(false);
        return;
      }

      if (!userStatus.isVerified) {
        setError('Please complete registration first by verifying your OTP.');
        setLoading(false);
        return;
      }

      setHasPIN(userStatus.hasPIN);
      setStep('choose'); // Show login method options
    } catch (err) {
      setError(err.message || 'Failed to check user');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');

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

  const handleOTPLogin = async (e) => {
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

  const handlePINLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.loginWithPIN(phone, pin);

      // Get user profile to determine role-based routing
      const profile = await api.getProfile();

      // Route user to their role-specific dashboard
      let dashboardPath = '/products';

      if (profile.role === 'merchant') {
        dashboardPath = '/merchant';
      } else if (profile.role === 'rider') {
        dashboardPath = '/rider';
      } else if (profile.role === 'admin') {
        dashboardPath = '/admin';
      }

      route(dashboardPath);
      window.location.reload();
    } catch (err) {
      setError(err.message || 'PIN login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email and password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(password)) {
      setError('Password must be exactly 6 digits');
      setLoading(false);
      return;
    }

    try {
      const data = await api.loginWithEmail(email, password);

      // Check if password reset is required
      if (data.passwordResetRequired) {
        setMessage('⚠️ You must change your temporary password. Redirecting to password change...');
        setTimeout(() => {
          route('/profile'); // Will trigger password change modal
          window.location.reload();
        }, 2000);
        return;
      }

      // Get user profile to determine role-based routing
      const profile = await api.getProfile();

      // Route user to their role-specific dashboard
      let dashboardPath = '/products';

      if (profile.role === 'merchant') {
        dashboardPath = '/merchant';
      } else if (profile.role === 'rider') {
        dashboardPath = '/rider';
      } else if (profile.role === 'admin') {
        dashboardPath = '/admin';
      }

      route(dashboardPath);
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Email login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="page login-page">
      <div class="container">
        <div class="auth-card">
          <h2>Login to AbachaOnline</h2>

          {/* Login Type Choice */}
          {loginType === 'choice' && (
            <div class="login-type-choice">
              <p style="text-align: center; color: #666; margin-bottom: 24px;">
                Choose your login method
              </p>

              <button
                class="btn-primary"
                onClick={() => {
                  setLoginType('phone');
                  setStep('phone');
                }}
                style="width: 100%; margin-bottom: 16px; font-size: 16px; padding: 14px;"
              >
                📱 Login with Phone
              </button>

              <button
                class="btn-secondary"
                onClick={() => {
                  setLoginType('email');
                  setStep('email');
                }}
                style="width: 100%; background: #f5f5f5; color: #333; border: 1px solid #ddd; font-size: 16px; padding: 14px;"
              >
                ✉️ Login with Email
              </button>

              <p style="text-align: center; color: #999; font-size: 13px; margin-top: 16px;">
                Most users login with phone number
              </p>
            </div>
          )}

          {/* Email Login Form */}
          {step === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div class="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onInput={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div class="form-group">
                <label>Password (6-digit PIN)</label>
                <div style="position: relative;">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    placeholder="Enter 6-digit password"
                    value={password}
                    onInput={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPassword(value);
                    }}
                    maxLength="6"
                    required
                    style="font-size: 24px; text-align: center; letter-spacing: 8px; padding-right: 45px;"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 20px;"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-primary" disabled={loading || password.length !== 6}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div style="margin-top: 16px; text-align: center;">
                <a
                  href="/forgot-password"
                  style="color: #1976d2; text-decoration: underline; font-size: 14px;"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => {
                  setLoginType('choice');
                  setStep('phone');
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
                style="margin-top: 12px; width: 100%;"
              >
                Back to Login Options
              </button>
            </form>
          )}

          {step === 'phone' && loginType === 'phone' && (
            <form onSubmit={handlePhoneSubmit}>
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
                {loading ? 'Checking...' : 'Continue'}
              </button>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => {
                  setLoginType('choice');
                  setPhone('');
                  setError('');
                }}
                style="margin-top: 12px; width: 100%;"
              >
                Back to Login Options
              </button>
            </form>
          )}

          {step === 'choose' && (
            <div class="login-options">
              <p style="text-align: center; color: #666; margin-bottom: 20px;">
                How would you like to login?
              </p>

              <button
                class="btn-primary"
                onClick={handleSendOTP}
                disabled={loading}
                style="width: 100%; margin-bottom: 12px;"
              >
                {loading ? 'Sending...' : 'Send OTP Code'}
              </button>

              {hasPIN ? (
                <button
                  class="btn-secondary"
                  onClick={() => setStep('pin')}
                  style="width: 100%; background: #f5f5f5; color: #333; border: 1px solid #ddd;"
                >
                  Login with PIN
                </button>
              ) : (
                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 12px;">
                  No PIN set. Use OTP to login.
                </p>
              )}

              <button
                type="button"
                class="btn-link"
                onClick={() => { setStep('phone'); setError(''); }}
                style="margin-top: 16px; width: 100%; background: transparent; border: none; color: #1976d2; cursor: pointer; text-decoration: underline;"
              >
                Change Phone Number
              </button>
            </div>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePINLogin}>
              <p style="text-align: center; color: #666; margin-bottom: 16px;">
                Enter your 6-digit PIN
              </p>

              <div class="form-group">
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter PIN"
                  value={pin}
                  onInput={handlePinInput}
                  maxLength="6"
                  required
                  style="font-size: 24px; text-align: center; letter-spacing: 8px;"
                  autoFocus
                />
              </div>

              <button type="submit" class="btn-primary" disabled={loading || pin.length !== 6}>
                {loading ? 'Verifying...' : 'Login'}
              </button>

              <div style="margin-top: 16px; text-align: center;">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  style="color: #1976d2; text-decoration: underline; background: none; border: none; cursor: pointer; font-size: 14px;"
                >
                  Forgot PIN? Use OTP instead
                </button>
              </div>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => { setStep('choose'); setPin(''); setError(''); }}
                style="margin-top: 12px; width: 100%;"
              >
                Back
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOTPLogin}>
              {/* Success message */}
              <div style="background: #e3f2fd; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; color: #1565c0; font-weight: 500;">
                  {otpMethod === 'whatsapp' ? '📱 Check WhatsApp' :
                   otpMethod === 'flashcall' ? '📞 Incoming call' :
                   otpMethod === 'email' ? '📧 Check Email' :
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
                onClick={() => { setStep('choose'); setCode(''); setError(''); }}
                style="margin-top: 12px; width: 100%;"
              >
                Back
              </button>
            </form>
          )}

          {message && !error && (
            <div style="background: #e3f2fd; border-radius: 8px; padding: 16px; margin-top: 16px;">
              <p style="margin: 0; color: #1565c0; font-weight: 500;">
                {message}
              </p>
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
