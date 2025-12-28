import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import api from '../services/api';

/**
 * Custom hook to track rider's GPS location
 * Handles geolocation permission, continuous updates, and batching
 */
export function useLocationTracker(isActive = false, orderId = null, updateInterval = 30000) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const watchIdRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const pendingLocationRef = useRef(null);
  const lastUploadedRef = useRef(null);

  /**
   * Send location to backend
   */
  const uploadLocation = useCallback(async (loc) => {
    try {
      const now = new Date();
      const timeSinceLastUpdate = lastUploadedRef.current
        ? now - lastUploadedRef.current
        : updateInterval;

      // Only upload if enough time has passed (avoid flooding backend)
      if (timeSinceLastUpdate < updateInterval * 0.8) {
        return;
      }

      const payload = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        altitude: loc.coords.altitude,
        speed: loc.coords.speed,
        heading: loc.coords.heading,
        order_id: orderId
      };

      await api.updateRiderLocation(payload);
      lastUploadedRef.current = now;
      setLastUpdate(now);
    } catch (err) {
      console.error('Failed to upload location:', err);
      setError('Location upload failed: ' + err.message);
    }
  }, [orderId, updateInterval]);

  /**
   * Handle successful location update
   */
  const handleLocationSuccess = useCallback((loc) => {
    // Update state immediately
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    });
    setAccuracy(Math.round(loc.coords.accuracy));
    setSpeed(loc.coords.speed ? Math.round(loc.coords.speed * 3.6) : 0); // Convert m/s to km/h
    setError(null);

    // Store pending location for batched upload
    pendingLocationRef.current = loc;
  }, []);

  /**
   * Handle location errors
   */
  const handleLocationError = useCallback((err) => {
    let errorMessage = 'Unknown error';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location services.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timeout.';
        break;
    }
    console.error('Geolocation error:', errorMessage);
    setError(errorMessage);
  }, []);

  /**
   * Start location tracking
   */
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    // Set up batched upload timer
    updateTimeoutRef.current = setInterval(() => {
      if (pendingLocationRef.current) {
        uploadLocation(pendingLocationRef.current);
      }
    }, updateInterval);
  }, [handleLocationSuccess, handleLocationError, uploadLocation, updateInterval]);

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (updateTimeoutRef.current !== null) {
      clearInterval(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    pendingLocationRef.current = null;
  }, []);

  /**
   * Manually upload current location (for immediate updates)
   */
  const uploadNow = useCallback(() => {
    if (pendingLocationRef.current) {
      uploadLocation(pendingLocationRef.current);
    }
  }, [uploadLocation]);

  /**
   * Effect: Start/stop tracking based on isActive
   */
  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isActive, startTracking, stopTracking]);

  return {
    location,
    accuracy,
    speed,
    isTracking,
    error,
    lastUpdate,
    uploadNow,
    startTracking,
    stopTracking
  };
}
