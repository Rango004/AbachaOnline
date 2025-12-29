import { useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';
import api from '../services/api';

export default function Register() {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpMethod, setOtpMethod] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.register(phone, name, 'student');

      // Store OTP if returned (fallback mode)
      if (data.otp) {
        setOtp(data.otp);
      }

      // Store delivery method and message
      setOtpMethod(data.method || 'sms');
      setMessage(data.message || 'Verification code sent!');

      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(phone, code);
      route('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="page register-page">
      <div class="container">
        <div class="auth-card">
          <h2>Register for AbachaOnline</h2>

          {step === 'register' ? (
            <form onSubmit={handleRegister}>
              <div class="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onInput={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
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
                     'Use this code to verify'}
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
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                class="btn-secondary"
                onClick={() => setStep('register')}
                style="margin-top: 12px; width: 100%;"
              >
                Back to Registration
              </button>
            </form>
          )}

          {error && <p class="message error">{error}</p>}

          <p class="auth-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
