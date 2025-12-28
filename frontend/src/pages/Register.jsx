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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.register(phone, name, 'student');
      setOtp(data.otp || ''); // In dev, OTP is returned
      alert(`Registration successful! OTP: ${data.otp || 'Check backend logs'}`);
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
              </div>

              <button type="submit" class="btn-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <p class="info-text">OTP sent to {phone}</p>
              {otp && <p class="otp-display">Dev OTP: <strong>{otp}</strong></p>}

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
                {loading ? 'Verifying...' : 'Verify & Continue'}
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
