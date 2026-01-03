import { useState, useEffect, useContext } from 'preact/hooks';
import { AddressContext } from '../services/AddressContext';
import '../styles/addresses.css';

export default function DeliveryAddresses() {
  const {
    addresses,
    defaultAddress,
    locations,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefault,
    loadAddresses,
    loadLocations,
  } = useContext(AddressContext);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    address_label: '',
    location_id: '',
    delivery_address: '',
    notes: '',
    is_default: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [capturingGPS, setCapturingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [capturingGPS, setCapturingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    loadAddresses();
    loadLocations();
  }, []);

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        address_label: '',
        location_id: '',
        delivery_address: '',
        notes: '',
        is_default: false,
        latitude: null,
        longitude: null,
        useGPS: false,
      });
    }
    setSubmitError(null);
    setGpsError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      address_label: '',
      location_id: '',
      delivery_address: '',
      notes: '',
      is_default: false,
      latitude: null,
      longitude: null,
      useGPS: false,
    });
    setGpsError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setCapturingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          useGPS: true,
          location_id: '',
        });
        setCapturingGPS(false);
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        setGpsError(errorMessage);
        setCapturingGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleClearGPS = () => {
    setFormData({
      ...formData,
      latitude: null,
      longitude: null,
      useGPS: false,
    });
    setGpsError(null);
  };

  
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setCapturingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          useGPS: true,
          location_id: '',
        });
        setCapturingGPS(false);
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        setGpsError(errorMessage);
        setCapturingGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleClearGPS = () => {
    setFormData({
      ...formData,
      latitude: null,
      longitude: null,
      useGPS: false,
    });
    setGpsError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const dataToSubmit = {
        ...formData,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
      };

      if (editingId) {
        await updateAddress(editingId, dataToSubmit);
      } else {
        await createAddress(dataToSubmit);
      }

      handleCloseModal();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
      } catch (err) {
        alert('Failed to delete address: ' + err.message);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefault(id);
    } catch (err) {
      alert('Failed to set default address: ' + err.message);
    }
  };

  const getLocationName = (locationId) => {
    if (!locationId) return 'No dormitory';
    const location = locations.find(loc => loc.id === locationId);
    return location?.name || 'Unknown';
  };

  return (
    <div class="delivery-addresses-page">
      <div class="page-header">
        <h1>Delivery Addresses</h1>
        <button class="btn-primary" onClick={() => handleOpenModal()}>
          + Add New Address
        </button>
      </div>

      {error && (
        <div class="alert alert-error">
          {error}
        </div>
      )}

      {loading && (
        <div class="loading-state">
          <p>Loading addresses...</p>
        </div>
      )}

      {!loading && addresses.length === 0 && (
        <div class="empty-state">
          <p>No saved addresses yet</p>
          <p>Add your first delivery address to get started</p>
          <button class="btn-primary" onClick={() => handleOpenModal()}>
            Add Address
          </button>
        </div>
      )}

      {!loading && addresses.length > 0 && (
        <div class="addresses-grid">
          {addresses.map((address) => (
            <div
              key={address.id}
              class={`address-card ${address.is_default ? 'default' : ''}`}
            >
              <div class="card-header">
                <h3>{address.address_label}</h3>
                {address.is_default && <span class="badge-default">Default</span>}
              </div>

              <div class="card-content">
                <div class="address-detail">
                  <strong>Location:</strong> {getLocationDisplay(address)}
                </div>
                <div class="address-detail">
                  <strong>Address:</strong> {address.delivery_address}
                </div>
                {address.notes && (
                  <div class="address-detail">
                    <strong>Notes:</strong> {address.notes}
                  </div>
                )}
              </div>

              <div class="card-actions">
                {!address.is_default && (
                  <button
                    class="btn-secondary"
                    onClick={() => handleSetDefault(address.id)}
                    title="Set as default"
                  >
                    Set Default
                  </button>
                )}
                <button
                  class="btn-secondary"
                  onClick={() => handleOpenModal(address)}
                  title="Edit address"
                >
                  Edit
                </button>
                <button
                  class="btn-danger"
                  onClick={() => handleDelete(address.id)}
                  title="Delete address"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div class="modal-overlay" onClick={handleCloseModal}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
              <button class="btn-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} class="address-form">
              {submitError && (
                <div class="alert alert-error">
                  {submitError}
                </div>
              )}

              <div class="form-group">
                <label htmlFor="address_label">Address Label *</label>
                <input
                  type="text"
                  id="address_label"
                  name="address_label"
                  value={formData.address_label}
                  onInput={handleInputChange}
                  placeholder="e.g., My Room, Friend's Dorm"
                  required
                />
              </div>

              <div class="form-group">
                <label htmlFor="location_id">Dormitory/Location</label>
                <select
                  id="location_id"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select a dormitory</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div class="form-group">
                <label htmlFor="delivery_address">Delivery Address *</label>
                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onInput={handleInputChange}
                  placeholder="Room number, block, building, etc."
                  rows="3"
                  required
                />
              </div>

              <div class="form-group">
                <label htmlFor="notes">Special Instructions</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onInput={handleInputChange}
                  placeholder="e.g., Gate 5, blue door, call upon arrival"
                  rows="2"
                />
              </div>

              <div class="form-group checkbox">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_default">Set as default address</label>
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
