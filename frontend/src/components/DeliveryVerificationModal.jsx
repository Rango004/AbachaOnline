import { useState, useEffect } from 'preact/hooks';
import GPSTrackingService from '../services/GPSTrackingService';

/**
 * DeliveryVerificationModal - Modal for GPS-verified delivery confirmation
 * Features:
 * - GPS location verification
 * - Distance calculation
 * - ETA estimation
 * - Delivery code entry
 */
export default function DeliveryVerificationModal({
  order,
  onVerified,
  onCancel,
  gpsService
}) {
  const [deliveryCode, setDeliveryCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Subscribe to GPS location updates
  useEffect(() => {
    if (!gpsService) return;

    const unsubscribe = gpsService.subscribe((location) => {
      setCurrentLocation(location);

      // Auto-verify when within range
      if (location) {
        const verification = gpsService.verifyDeliveryLocation(
          [order.latitude, order.longitude],
          50 // 50 meter radius
        );
        setVerification(verification);
      }
    });

    // Get current location immediately
    const current = gpsService.getCurrentLocation();
    if (current) {
      setCurrentLocation(current);
      const ver = gpsService.verifyDeliveryLocation(
        [order.latitude, order.longitude],
        50
      );
      setVerification(ver);
    }

    return unsubscribe;
  }, [gpsService, order]);

  const handleVerifyDelivery = async () => {
    if (!deliveryCode.trim()) {
      setError('Please enter the delivery code');
      return;
    }

    if (!currentLocation) {
      setError('GPS location not available');
      return;
    }

    if (!verification || !verification.verified) {
      setError('You must be within 50m of delivery location');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      // Call parent verification handler
      await onVerified({
        orderId: order.id,
        deliveryCode: deliveryCode.trim(),
        location: currentLocation,
        verificationData: verification,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
      setVerifying(false);
    }
  };

  const eta = currentLocation
    ? gpsService.estimateETA([order.latitude, order.longitude])
    : null;

  const distance = verification ? verification.distance : null;

  return (
    <div class="verification-modal-overlay" onClick={onCancel}>
      <div class="verification-modal" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h3>📦 Verify Delivery</h3>
          <button class="close-btn" onClick={onCancel}>×</button>
        </div>

        <div class="modal-body">
          {/* Order Info */}
          <div class="verification-section">
            <h4>Order #{order.id}</h4>
            <p><strong>Customer:</strong> {order.customer_name}</p>
            <p><strong>Items:</strong> {order.items}</p>
            <p><strong>Location:</strong> {order.delivery_address}</p>
          </div>

          {/* Location Verification */}
          <div class={`verification-section verification-status ${verification?.verified ? 'verified' : 'unverified'}`}>
            <h4>📍 Location Verification</h4>

            {currentLocation && (
              <div class="location-info">
                <div class="info-row">
                  <span>Your Location:</span>
                  <code>
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
                  </code>
                </div>
                <div class="info-row">
                  <span>Delivery Location:</span>
                  <code>
                    {order.latitude.toFixed(4)}, {order.longitude.toFixed(4)}
                  </code>
                </div>
              </div>
            )}

            {distance !== null && (
              <div class={`distance-display ${verification?.verified ? 'verified' : 'unverified'}`}>
                <div class="distance-value">{Math.round(distance)}m</div>
                <div class="distance-label">
                  {verification?.verified ? '✅ Within delivery zone' : '❌ Outside delivery zone (50m required)'}
                </div>
              </div>
            )}

            {currentLocation && (
              <div class="accuracy-info">
                <span>GPS Accuracy: ±{Math.round(currentLocation.accuracy)}m</span>
                <span class="accuracy-confidence">
                  {currentLocation.accuracy <= 20 ? '✓ High' : '△ Medium'}
                </span>
              </div>
            )}
          </div>

          {/* ETA */}
          {eta && (
            <div class="verification-section eta-section">
              <h4>⏱️ ETA</h4>
              <div class="eta-info">
                <div class="eta-value">{eta.minutes} min</div>
                <div class="eta-details">
                  <span>{Math.round(eta.distanceM / 1000 * 10) / 10} km away</span>
                  {currentLocation?.speed && (
                    <span>
                      Current speed: {(currentLocation.speed * 3.6).toFixed(1)} km/h
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Code Input */}
          <div class="verification-section">
            <label for="delivery-code" class="form-label">
              <strong>Enter Delivery Code</strong>
              <span class="required">*</span>
            </label>
            <input
              id="delivery-code"
              type="text"
              placeholder="6-digit code from customer"
              maxLength="6"
              value={deliveryCode}
              onInput={(e) => {
                setDeliveryCode(e.target.value.toUpperCase());
                setError(null);
              }}
              class="delivery-code-input"
              disabled={verifying || !verification?.verified}
            />
            <small>Customer provided 6-digit pickup code</small>
          </div>

          {/* Error Message */}
          {error && (
            <div class="error-message">
              <strong>⚠️ {error}</strong>
            </div>
          )}

          {/* Action Buttons */}
          <div class="modal-footer">
            <button
              class="btn-cancel"
              onClick={onCancel}
              disabled={verifying}
            >
              Cancel
            </button>
            <button
              class="btn-verify"
              onClick={handleVerifyDelivery}
              disabled={verifying || !verification?.verified || !deliveryCode.trim()}
            >
              {verifying ? '⏳ Verifying...' : '✅ Confirm Delivery'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .verification-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 2000;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .verification-modal {
          background: white;
          border-radius: 12px 12px 0 0;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eee;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .verification-section {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
        }

        .verification-section h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .verification-section p {
          margin: 6px 0;
          font-size: 13px;
          color: #666;
        }

        .verification-section p strong {
          color: #333;
        }

        .verification-status {
          border-left: 4px solid #f9a825;
        }

        .verification-status.verified {
          border-left-color: #4caf50;
          background: #f1f8f4;
        }

        .verification-status.unverified {
          border-left-color: #f44336;
          background: #fef5f5;
        }

        .location-info {
          margin: 8px 0;
          font-size: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .info-row code {
          font-family: monospace;
          font-size: 11px;
          background: white;
          padding: 4px 8px;
          border-radius: 3px;
          color: #333;
        }

        .distance-display {
          text-align: center;
          padding: 12px;
          background: white;
          border-radius: 6px;
          margin: 8px 0;
        }

        .distance-value {
          font-size: 24px;
          font-weight: bold;
          color: #2196f3;
        }

        .distance-label {
          font-size: 13px;
          color: #666;
          margin-top: 4px;
        }

        .distance-display.verified {
          background: #e8f5e9;
        }

        .distance-display.verified .distance-value {
          color: #4caf50;
        }

        .distance-display.unverified {
          background: #ffebee;
        }

        .distance-display.unverified .distance-value {
          color: #f44336;
        }

        .accuracy-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #999;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e0e0e0;
        }

        .accuracy-confidence {
          font-weight: 600;
          color: #333;
        }

        .eta-section {
          background: #e3f2fd;
          border-left-color: #2196f3;
        }

        .eta-info {
          text-align: center;
        }

        .eta-value {
          font-size: 28px;
          font-weight: bold;
          color: #2196f3;
        }

        .eta-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          color: #333;
          margin-bottom: 8px;
        }

        .required {
          color: #f44336;
        }

        .delivery-code-input {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 6px;
          text-align: center;
          letter-spacing: 2px;
          font-weight: bold;
          font-family: monospace;
        }

        .delivery-code-input:focus {
          outline: none;
          border-color: #667eea;
          background: #f9f9f9;
        }

        .delivery-code-input:disabled {
          background: #f5f5f5;
          color: #999;
        }

        .verification-section small {
          display: block;
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }

        .error-message {
          background: #ffebee;
          border-left: 4px solid #f44336;
          padding: 12px;
          border-radius: 4px;
          font-size: 13px;
          color: #d32f2f;
        }

        .error-message strong {
          display: block;
        }

        .modal-footer {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #eee;
          background: #fafafa;
        }

        .btn-cancel,
        .btn-verify {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: white;
          color: #666;
          border: 1px solid #ddd;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .btn-verify {
          background: #4caf50;
          color: white;
        }

        .btn-verify:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-1px);
        }

        .btn-cancel:disabled,
        .btn-verify:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (min-width: 600px) {
          .verification-modal {
            border-radius: 12px;
            margin: 20px;
          }

          .verification-modal-overlay {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
