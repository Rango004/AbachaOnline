import { useState, useEffect, useContext } from 'preact/hooks';
import { AuthContext } from '../services/AuthContext';
import { AddressContext } from '../services/AddressContext';
import api from '../services/api';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const { addresses, locations, loadAddresses, createAddress, updateAddress, deleteAddress, setDefault } = useContext(AddressContext);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Address management states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    address_label: '',
    location_id: '',
    delivery_address: '',
    notes: '',
    is_default: false
  });
  const [addressError, setAddressError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      await api.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const openAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressFormData({
        address_label: addr.address_label,
        location_id: addr.location_id || '',
        delivery_address: addr.delivery_address,
        notes: addr.notes || '',
        is_default: addr.is_default || false
      });
    } else {
      setEditingAddressId(null);
      setAddressFormData({
        address_label: '',
        location_id: '',
        delivery_address: '',
        notes: '',
        is_default: false
      });
    }
    setAddressError(null);
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddressId(null);
    setAddressFormData({
      address_label: '',
      location_id: '',
      delivery_address: '',
      notes: '',
      is_default: false
    });
    setAddressError(null);
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError(null);
    setLoading(true);

    try {
      if (!addressFormData.delivery_address.trim()) {
        throw new Error('Delivery address is required');
      }

      if (editingAddressId) {
        await updateAddress(editingAddressId, addressFormData);
        setSuccess('Address updated successfully!');
      } else {
        await createAddress(addressFormData);
        setSuccess('Address added successfully!');
      }

      closeAddressModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setAddressError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        setLoading(true);
        await deleteAddress(id);
        setSuccess('Address deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete address');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setLoading(true);
      await setDefault(id);
      setSuccess('Default address updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div class="page"><div class="loading">Loading profile...</div></div>;
  }

  return (
    <div class="page profile-page">
      <div class="container">
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-circle">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          </div>
          <div class="profile-title">
            <h1>My Profile</h1>
            <p class="role-badge">{user?.role === 'student' ? 'Customer' : user?.role}</p>
          </div>
        </div>

        {error && <div class="alert alert-error">{error}</div>}
        {success && <div class="alert alert-success">{success}</div>}

        <div class="profile-content">
          <div class="profile-card">
            <div class="card-header">
              <h2>Personal Information</h2>
              {!editing && (
                <button class="btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  ✎ Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSaveProfile} class="profile-form">
                <div class="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onInput={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div class="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onInput={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onInput={handleInputChange}
                    placeholder="Enter your email address"
                  />
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        email: user?.email || ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div class="profile-info">
                <div class="info-item">
                  <span class="info-label">Full Name</span>
                  <span class="info-value">{formData.name || '—'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone Number</span>
                  <span class="info-value">{formData.phone || '—'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">{formData.email || '—'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Account Type</span>
                  <span class="info-value">{user?.role === 'student' ? 'Customer' : user?.role}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Member Since</span>
                  <span class="info-value">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Addresses Card */}
          <div class="profile-card">
            <div class="card-header">
              <h2>📍 Delivery Addresses</h2>
              <button
                class="btn-secondary btn-sm"
                onClick={() => openAddressModal()}
                disabled={loading}
              >
                + Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div class="empty-state">
                <p>No addresses saved yet</p>
                <p class="text-muted">Add a delivery address to make checkout faster</p>
              </div>
            ) : (
              <div class="addresses-list">
                {addresses.map(addr => (
                  <div key={addr.id} class={`address-item ${addr.is_default ? 'default' : ''}`}>
                    <div class="address-content">
                      <div class="address-header">
                        <h4>{addr.address_label}</h4>
                        {addr.is_default && <span class="badge-default">Default</span>}
                      </div>
                      <p class="address-text">{addr.delivery_address}</p>
                      {addr.location_name && (
                        <p class="address-location">📍 {addr.location_name}</p>
                      )}
                      {addr.notes && (
                        <p class="address-notes">Notes: {addr.notes}</p>
                      )}
                    </div>
                    <div class="address-actions">
                      {!addr.is_default && (
                        <button
                          class="btn-link btn-sm"
                          onClick={() => handleSetDefault(addr.id)}
                          disabled={loading}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        class="btn-link btn-sm"
                        onClick={() => openAddressModal(addr)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        class="btn-link btn-sm btn-danger"
                        onClick={() => handleDeleteAddress(addr.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div class="settings-grid">
            <div class="settings-card">
              <h3>📦 Orders & Deliveries</h3>
              <p>Track your orders and manage deliveries</p>
              <a href="/orders" class="btn-link">View Orders →</a>
            </div>

            <div class="settings-card">
              <h3>💝 Wishlist & Favorites</h3>
              <p>Save items for later and track favorites</p>
              <a href="#" class="btn-link">View Wishlist →</a>
            </div>

            <div class="settings-card">
              <h3>⭐ Reviews & Ratings</h3>
              <p>See your reviews and manage feedback</p>
              <a href="/orders" class="btn-link">View Reviews →</a>
            </div>

            <div class="settings-card">
              <h3>💳 Payment Methods</h3>
              <p>Manage your payment information securely</p>
              <a href="#" class="btn-link">Manage Payments →</a>
            </div>

            <div class="settings-card">
              <h3>🎟️ Token Credits</h3>
              <p>Redeem PIN codes and add credit to your account</p>
              <a href="/tokens" class="btn-link">Redeem Tokens →</a>
            </div>

            <div class="settings-card">
              <h3>🔔 Notifications</h3>
              <p>Manage notification preferences</p>
              <a href="/notifications" class="btn-link">View Notifications →</a>
            </div>

            <div class="settings-card">
              <h3>❓ Help & Support</h3>
              <p>Get help with your orders and account</p>
              <a href="#" class="btn-link">Contact Support →</a>
            </div>
          </div>

          <div class="profile-card danger-zone">
            <div class="card-header">
              <h2>Account Settings</h2>
            </div>
            <div class="settings-list">
              <div class="setting-item">
                <div>
                  <h4>Logout</h4>
                  <p>Sign out of your account</p>
                </div>
                <button class="btn-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>

              <div class="setting-item">
                <div>
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and data</p>
                </div>
                <button class="btn-danger-outline btn-sm" disabled>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div class="modal-overlay" onClick={closeAddressModal}>
            <div class="modal-content" onClick={e => e.stopPropagation()}>
              <div class="modal-header">
                <h2>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
                <button class="modal-close" onClick={closeAddressModal}>✕</button>
              </div>

              {addressError && <div class="alert alert-error">{addressError}</div>}

              <form onSubmit={handleSaveAddress} class="address-form">
                <div class="form-group">
                  <label>Address Label *</label>
                  <input
                    type="text"
                    name="address_label"
                    value={addressFormData.address_label}
                    onInput={handleAddressFormChange}
                    placeholder="e.g., Home, Hostel, Dorm"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Location (Optional)</label>
                  <select
                    name="location_id"
                    value={addressFormData.location_id}
                    onChange={handleAddressFormChange}
                  >
                    <option value="">-- No specific location --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="form-group">
                  <label>Delivery Address *</label>
                  <textarea
                    name="delivery_address"
                    value={addressFormData.delivery_address}
                    onInput={handleAddressFormChange}
                    placeholder="Room 205, Block A, Campus Hostel"
                    required
                    rows="3"
                  />
                </div>

                <div class="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={addressFormData.notes}
                    onInput={handleAddressFormChange}
                    placeholder="Special instructions (e.g., knock twice)"
                    rows="2"
                  />
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={addressFormData.is_default}
                      onChange={handleAddressFormChange}
                    />
                    <span>Set as default address</span>
                  </label>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                  <button type="button" class="btn-secondary" onClick={closeAddressModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
