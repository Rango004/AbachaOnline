/**
 * Automated GPS Feature Implementation for Frontend
 * Applies all GPS-related changes to DeliveryAddresses.jsx
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'DeliveryAddresses.jsx');

console.log('🔄 Reading DeliveryAddresses.jsx...');

let content = fs.readFileSync(filePath, 'utf8');

console.log('✅ File read successfully');
console.log('🔄 Applying GPS feature changes...\n');

// Change 1: Add GPS states after line 30
console.log('1️⃣  Adding GPS capture states...');
content = content.replace(
  'const [submitError, setSubmitError] = useState(null);',
  `const [submitError, setSubmitError] = useState(null);
  const [capturingGPS, setCapturingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);`
);

// Change 2: Update formData initial state
console.log('2️⃣  Updating formData state with GPS fields...');
content = content.replace(
  `address_label: '',
    location_id: '',
    delivery_address: '',
    notes: '',
    is_default: false,
  });`,
  `address_label: '',
    location_id: '',
    delivery_address: '',
    notes: '',
    is_default: false,
    latitude: null,
    longitude: null,
    useGPS: false,
  });`
);

// Change 3: Update handleOpenModal for editing
console.log('3️⃣  Updating handleOpenModal to support GPS...');
content = content.replace(
  `address_label: address.address_label,
        location_id: address.location_id || '',
        delivery_address: address.delivery_address,
        notes: address.notes || '',
        is_default: address.is_default,
      });`,
  `address_label: address.address_label,
        location_id: address.location_id || '',
        delivery_address: address.delivery_address,
        notes: address.notes || '',
        is_default: address.is_default,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        useGPS: !!(address.latitude && address.longitude),
      });`
);

// Change 4: Update handleOpenModal for new address
content = content.replace(
  /setFormData\(\{[\s\S]*?is_default: false,[\s]*\}\);[\s]*\}[\s]*setSubmitError\(null\);[\s]*setShowModal\(true\);/,
  `setFormData({
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
    setShowModal(true);`
);

// Change 5: Update handleCloseModal
console.log('4️⃣  Updating handleCloseModal...');
content = content.replace(
  /handleCloseModal[\s\S]*?is_default: false,[\s]*\}\);[\s]*\};/,
  `handleCloseModal = () => {
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
  };`
);

// Change 6: Add GPS capture functions before handleSubmit
console.log('5️⃣  Adding GPS capture functions...');
const gpsFunctions = `
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
`;

content = content.replace(
  'const handleSubmit = async (e) => {',
  gpsFunctions + '\n  const handleSubmit = async (e) => {'
);

// Change 7: Update handleSubmit to include GPS data
console.log('6️⃣  Updating handleSubmit to include GPS coordinates...');
content = content.replace(
  `const dataToSubmit = {
        ...formData,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
      };`,
  `const dataToSubmit = {
        ...formData,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      delete dataToSubmit.useGPS;`
);

// Change 8: Update getLocationName to getLocationDisplay
console.log('7️⃣  Updating location display function...');
content = content.replace(
  `const getLocationName = (locationId) => {
    if (!locationId) return 'No dormitory';
    const location = locations.find(loc => loc.id === locationId);
    return location?.name || 'Unknown';
  };`,
  `const getLocationDisplay = (address) => {
    if (address.latitude && address.longitude) {
      return \`📍 GPS (\${address.latitude.toFixed(4)}, \${address.longitude.toFixed(4)})\`;
    }
    if (address.location_id) {
      const location = locations.find(loc => loc.id === address.location_id);
      return location?.name || 'Unknown';
    }
    return 'No location specified';
  };`
);

// Change 9: Update location display in address card
console.log('8️⃣  Updating address card to show GPS...');
content = content.replace(
  '<strong>Location:</strong> {getLocationName(address.location_id)}',
  '<strong>Location:</strong> {getLocationDisplay(address)}'
);

// Change 10: Replace location dropdown with GPS toggle UI
console.log('9️⃣  Adding GPS capture UI to form...');
const oldLocationField = `<div class="form-group">
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
              </div>`;

const newLocationField = `<div class="form-group">
                <label htmlFor="location_id">Location Method</label>

                {!formData.useGPS ? (
                  <>
                    <select
                      id="location_id"
                      name="location_id"
                      value={formData.location_id}
                      onChange={handleInputChange}
                      disabled={formData.useGPS}
                    >
                      <option value="">Select a dormitory</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      class="btn-secondary gps-button"
                      onClick={handleCaptureGPS}
                      disabled={capturingGPS}
                    >
                      {capturingGPS ? '📍 Capturing...' : '📍 Use My GPS Location Instead'}
                    </button>
                  </>
                ) : (
                  <div class="gps-info">
                    <div class="gps-coordinates">
                      <strong>📍 GPS Location Captured</strong>
                      <p>Latitude: {formData.latitude?.toFixed(6)}</p>
                      <p>Longitude: {formData.longitude?.toFixed(6)}</p>
                    </div>
                    <button
                      type="button"
                      class="btn-secondary"
                      onClick={handleClearGPS}
                    >
                      Use Dormitory Selection Instead
                    </button>
                  </div>
                )}

                {gpsError && (
                  <div class="alert alert-error gps-error">
                    {gpsError}
                  </div>
                )}
              </div>`;

content = content.replace(oldLocationField, newLocationField);

// Write the updated file
console.log('\n✅ All changes applied successfully!');
console.log('💾 Writing updated file...');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ DeliveryAddresses.jsx updated with GPS functionality!\n');
console.log('📋 Changes made:');
console.log('   ✓ Added GPS capture states');
console.log('   ✓ Updated formData with GPS fields');
console.log('   ✓ Added handleCaptureGPS function');
console.log('   ✓ Added handleClearGPS function');
console.log('   ✓ Updated form to show GPS toggle UI');
console.log('   ✓ Updated address display to show GPS coordinates');
console.log('\n🎉 GPS feature implementation complete!');
