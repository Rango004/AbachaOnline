import { useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../services/AuthContext';
import api from '../services/api';

export default function Register() {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpMethod, setOtpMethod] = useState('');

  const handlePinInput = (e, setter) => {
    // Only allow digits, max 6
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setter(value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate PIN
    if (pin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    // Check for weak PINs
    const sequential = ['123456', '234567', '345678', '456789', '567890', '654321', '543210'];
    if (sequential.includes(pin)) {
      setError('PIN cannot be a sequential number');
      return;
    }

    if (/^(\d)\1{5}$/.test(pin)) {
      setError('PIN cannot be all the same digit');
      return;
    }

    setLoading(true);

    try {
      const data = await api.register(phone, name, pin, 'student');

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

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      // Try to resend by re-registering (will send new OTP)
      const data = await api.register(phone, name, pin, 'student');
      setMessage('New verification code sent! Please check your phone.');
      setOtpMethod(data.method || 'sms');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
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

  const isPinValid = pin.length === 6 && pin === confirmPin;

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

              <div class="form-group">
                <label>Create 6-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter PIN"
                  value={pin}
                  onInput={(e) => handlePinInput(e, setPin)}
                  maxLength="6"
                  required
                  style="font-size: 24px; text-align: center; letter-spacing: 8px;"
                />
                <small style="color: #666; display: block; margin-top: 4px;">
                  {pin.length}/6 digits - Use this PIN for quick login
                </small>
              </div>

              <div class="form-group">
                <label>Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onInput={(e) => handlePinInput(e, setConfirmPin)}
                  maxLength="6"
                  required
                  style="font-size: 24px; text-align: center; letter-spacing: 8px;"
                />
                {confirmPin && pin !== confirmPin && (
                  <small style="color: #d32f2f; display: block; margin-top: 4px;">
                    PINs do not match
                  </small>
                )}
                {confirmPin && pin === confirmPin && pin.length === 6 && (
                  <small style="color: #2e7d32; display: block; margin-top: 4px;">
                    PINs match
                  </small>
                )}
              </div>

              <button type="submit" class="btn-primary" disabled={loading || !isPinValid}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
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
                {loading ? 'Verifying...' : 'Verify & Continue'}
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
                onClick={() => setStep('register')}
                style="margin-top: 12px; width: 100%;"
              >
                Change Phone Number
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
