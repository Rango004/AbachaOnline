import { useState, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from '../../services/AuthContext';
import api from '../../services/api';

export default function MerchantSettings() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Info
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  // Bank Details
  const [bankInfo, setBankInfo] = useState({
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    branch_code: '',
  });

  // Location
  const [location, setLocation] = useState({
    address: '',
    city: '',
    region: '',
  });

  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    monday_open: '08:00',
    monday_close: '18:00',
    tuesday_open: '08:00',
    tuesday_close: '18:00',
    wednesday_open: '08:00',
    wednesday_close: '18:00',
    thursday_open: '08:00',
    thursday_close: '18:00',
    friday_open: '08:00',
    friday_close: '18:00',
    saturday_open: '08:00',
    saturday_close: '18:00',
    sunday_open: 'closed',
    sunday_close: 'closed',
  });

  useEffect(() => {
    if (user?.role !== 'merchant') {
      return;
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load merchant profile data
      const profile = await api.getProfile();
      if (profile) {
        setBasicInfo({
          name: profile.name || user?.name || '',
          phone: profile.phone || user?.phone || '',
          email: profile.email || user?.email || '',
        });

        if (profile.bank_account) {
          setBankInfo(profile.bank_account);
        }

        if (profile.location) {
          setLocation(profile.location);
        }

        if (profile.business_hours) {
          setBusinessHours(profile.business_hours);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo({ ...basicInfo, [field]: value });
  };

  const handleBankInfoChange = (field, value) => {
    setBankInfo({ ...bankInfo, [field]: value });
  };

  const handleLocationChange = (field, value) => {
    setLocation({ ...location, [field]: value });
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setBusinessHours({
      ...businessHours,
      [`${day}_${field}`]: value,
    });
  };

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      await api.updateMerchantBasicInfo({
        name: basicInfo.name,
        email: basicInfo.email
      });
      setSuccessMessage('Basic information saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save basic information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBankInfo = async () => {
    if (!bankInfo.account_holder_name || !bankInfo.account_number || !bankInfo.bank_name) {
      setErrorMessage('Please fill in all required bank details');
      return;
    }
    try {
      setSaving(true);
      setErrorMessage('');
      await api.updateMerchantBankDetails(bankInfo);
      setSuccessMessage('Bank details saved successfully! Your payout method has been updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!location.address || !location.city) {
      setErrorMessage('Please fill in address and city');
      return;
    }
    try {
      setSaving(true);
      setErrorMessage('');
      await api.updateMerchantLocation(location);
      setSuccessMessage('Location saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusinessHours = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      await api.updateMerchantBusinessHours(businessHours);
      setSuccessMessage('Business hours saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save business hours');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div class="page"><div class="loading">Loading settings...</div></div>;
  }

  return (
    <div class="page merchant-settings">
      <div class="container">
        <h2>⚙️ Merchant Settings</h2>
        <p class="welcome-text">Manage your merchant profile and preferences</p>

        {successMessage && <div class="alert alert-success">{successMessage}</div>}
        {errorMessage && <div class="alert alert-error">{errorMessage}</div>}

        {/* Tabs */}
        <div class="settings-tabs">
          <button
            class={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            👤 Basic Info
          </button>
          <button
            class={`tab-button ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            🏦 Bank Details
          </button>
          <button
            class={`tab-button ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            📍 Location
          </button>
          <button
            class={`tab-button ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            🕐 Business Hours
          </button>
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div class="settings-section">
            <h3>Basic Information</h3>
            <form class="settings-form">
              <div class="form-group">
                <label>Merchant Name *</label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  placeholder="Your merchant/business name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={basicInfo.phone}
                  disabled
                  class="form-input disabled"
                  placeholder="Your phone number"
                />
                <small>Phone number cannot be changed. Contact support if you need to update it.</small>
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  class="form-input"
                />
              </div>

              <div class="verification-status">
                <h4>Account Verification</h4>
                <div class="status-item">
                  <span class="status-label">Email Verification:</span>
                  <span class="status-badge verified">✓ Verified</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Phone Verification:</span>
                  <span class="status-badge verified">✓ Verified</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Bank Account Verification:</span>
                  <span class="status-badge pending">⏳ Pending</span>
                </div>
              </div>

              <button
                type="button"
                class="btn-save"
                onClick={handleSaveBasicInfo}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Bank Info Tab */}
        {activeTab === 'bank' && (
          <div class="settings-section">
            <h3>Bank Account Details</h3>
            <p class="section-note">
              Your payouts will be sent to this bank account. Make sure the details are correct.
            </p>
            <form class="settings-form">
              <div class="form-group">
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  value={bankInfo.account_holder_name}
                  onChange={(e) => handleBankInfoChange('account_holder_name', e.target.value)}
                  placeholder="Full name of account holder"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Bank Name *</label>
                <select
                  value={bankInfo.bank_name}
                  onChange={(e) => handleBankInfoChange('bank_name', e.target.value)}
                  class="form-input"
                >
                  <option value="">Select a bank</option>
                  <option value="Sierra Leone Commercial Bank">Sierra Leone Commercial Bank</option>
                  <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Rokel Commercial Bank">Rokel Commercial Bank</option>
                  <option value="International Bank">International Bank</option>
                </select>
              </div>

              <div class="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={bankInfo.account_number}
                  onChange={(e) => handleBankInfoChange('account_number', e.target.value)}
                  placeholder="Your bank account number"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Branch Code</label>
                <input
                  type="text"
                  value={bankInfo.branch_code}
                  onChange={(e) => handleBankInfoChange('branch_code', e.target.value)}
                  placeholder="Bank branch code (if applicable)"
                  class="form-input"
                />
              </div>

              <div class="info-box warning">
                <h4>⚠️ Important</h4>
                <ul>
                  <li>Ensure all bank details are correct before saving</li>
                  <li>Account must be in the name of the merchant</li>
                  <li>Any errors will cause payout delays</li>
                </ul>
              </div>

              <button
                type="button"
                class="btn-save"
                onClick={handleSaveBankInfo}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </form>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div class="settings-section">
            <h3>Business Location</h3>
            <p class="section-note">
              This information helps customers find you and determine delivery fees.
            </p>
            <form class="settings-form">
              <div class="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  placeholder="E.g., 123 Main Street"
                  class="form-input"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>City/Town *</label>
                  <input
                    type="text"
                    value={location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    placeholder="E.g., Freetown"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Region/District</label>
                  <select
                    value={location.region}
                    onChange={(e) => handleLocationChange('region', e.target.value)}
                    class="form-input"
                  >
                    <option value="">Select region</option>
                    <option value="Western Area">Western Area</option>
                    <option value="Northern Region">Northern Region</option>
                    <option value="Eastern Region">Eastern Region</option>
                    <option value="Southern Region">Southern Region</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                class="btn-save"
                onClick={handleSaveLocation}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Location'}
              </button>
            </form>
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === 'hours' && (
          <div class="settings-section">
            <h3>Business Hours</h3>
            <p class="section-note">
              Set when your shop is open. This helps customers know when they can place orders.
            </p>
            <form class="settings-form">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                (day) => (
                  <div key={day} class="hours-group">
                    <div class="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                    {day === 'sunday' ? (
                      <div class="hours-toggle">
                        <select
                          value={businessHours[`${day}_open`]}
                          onChange={(e) =>
                            handleBusinessHoursChange(day, 'open', e.target.value)
                          }
                          class="form-input"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    ) : (
                      <div class="hours-inputs">
                        <input
                          type="time"
                          value={businessHours[`${day}_open`]}
                          onChange={(e) =>
                            handleBusinessHoursChange(day, 'open', e.target.value)
                          }
                          class="form-input time-input"
                        />
                        <span class="time-separator">to</span>
                        <input
                          type="time"
                          value={businessHours[`${day}_close`]}
                          onChange={(e) =>
                            handleBusinessHoursChange(day, 'close', e.target.value)
                          }
                          class="form-input time-input"
                        />
                      </div>
                    )}
                  </div>
                )
              )}

              <button
                type="button"
                class="btn-save"
                onClick={handleSaveBusinessHours}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Business Hours'}
              </button>
            </form>
          </div>
        )}

        {/* Help Section */}
        <div class="help-section">
          <h3>Need Help?</h3>
          <p>
            If you have questions about your account settings or need to make changes that aren't available here,
            please contact our support team.
          </p>
          <button class="btn-secondary">Contact Support</button>
        </div>
      </div>

      <style>{`
        .merchant-settings {
          padding: 20px 0;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .merchant-settings h2 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 2em;
        }

        .welcome-text {
          color: #6b7280;
          margin-bottom: 30px;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .alert-success {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .alert-error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .settings-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .tab-button {
          padding: 12px 20px;
          border: none;
          background: none;
          cursor: pointer;
          color: #6b7280;
          font-weight: 600;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-size: 0.95em;
        }

        .tab-button.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab-button:hover {
          color: #1f2937;
        }

        .settings-section {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .settings-section h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 1.3em;
        }

        .section-note {
          color: #6b7280;
          margin-bottom: 20px;
          font-size: 0.95em;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.95em;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95em;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .form-group small {
          color: #6b7280;
          font-size: 0.85em;
        }

        .verification-status {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }

        .verification-status h4 {
          margin: 0 0 12px 0;
          color: #1f2937;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .status-item:last-child {
          border-bottom: none;
        }

        .status-label {
          color: #6b7280;
          font-weight: 500;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .status-badge.verified {
          background-color: #d1fae5;
          color: #059669;
        }

        .status-badge.pending {
          background-color: #fef3c7;
          color: #92400e;
        }

        .hours-group {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 15px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .day-label {
          font-weight: 600;
          color: #1f2937;
        }

        .hours-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-input {
          flex: 1;
          max-width: 120px;
        }

        .time-separator {
          color: #9ca3af;
          font-weight: 500;
        }

        .hours-toggle {
          display: flex;
        }

        .hours-toggle .form-input {
          flex: 1;
        }

        .info-box {
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }

        .info-box h4 {
          margin: 0 0 10px 0;
          font-size: 0.95em;
        }

        .info-box.warning {
          background-color: #fef3c7;
          border: 1px solid #fcd34d;
          color: #78350f;
        }

        .info-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-box li {
          padding: 6px 0;
          font-size: 0.9em;
        }

        .btn-save {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.95em;
          align-self: flex-start;
          margin-top: 10px;
        }

        .btn-save:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-save:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .help-section {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .help-section h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .help-section p {
          color: #6b7280;
          margin-bottom: 20px;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        @media (max-width: 768px) {
          .settings-section {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .hours-group {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .hours-inputs {
            flex-direction: column;
          }

          .time-input {
            max-width: 100%;
          }

          .settings-tabs {
            flex-direction: column;
            border-bottom: none;
          }

          .tab-button {
            border-bottom: none;
            border-left: 3px solid transparent;
            padding-left: 16px;
            text-align: left;
          }

          .tab-button.active {
            border-bottom: none;
            border-left-color: #3b82f6;
          }
        }
      `}</style>
    </div>
  );
}
