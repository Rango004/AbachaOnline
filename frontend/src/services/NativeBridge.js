/**
 * NativeBridge - Unified API for native capabilities
 * Uses Capacitor plugins when available, falls back to Web APIs
 * Works seamlessly in both PWA and native app modes
 */

import { Capacitor } from '@capacitor/core';

// Lazy load plugins only when needed
let Camera, Geolocation, PushNotifications, Haptics, StatusBar, SplashScreen, Network;

const isNative = Capacitor.isNativePlatform();

/**
 * Initialize native plugins (call once at app start)
 */
export async function initializeNative() {
  if (!isNative) {
    console.log('[NativeBridge] Running as PWA - using web APIs');
    return;
  }

  console.log('[NativeBridge] Running as native app - loading Capacitor plugins');

  try {
    // Dynamic imports for tree-shaking
    [Camera, Geolocation, PushNotifications, Haptics, StatusBar, SplashScreen, Network] = await Promise.all([
      import('@capacitor/camera').then(m => m.Camera),
      import('@capacitor/geolocation').then(m => m.Geolocation),
      import('@capacitor/push-notifications').then(m => m.PushNotifications),
      import('@capacitor/haptics').then(m => m.Haptics),
      import('@capacitor/status-bar').then(m => m.StatusBar),
      import('@capacitor/splash-screen').then(m => m.SplashScreen),
      import('@capacitor/network').then(m => m.Network)
    ]);

    // Hide splash screen after app loads
    await SplashScreen.hide();

    // Set status bar style
    await StatusBar.setBackgroundColor({ color: '#4CAF50' });

    console.log('[NativeBridge] Native plugins initialized successfully');
  } catch (error) {
    console.warn('[NativeBridge] Failed to initialize some plugins:', error);
  }
}

/**
 * Camera - Take photo or select from gallery
 */
export async function takePhoto(options = {}) {
  const defaultOptions = {
    quality: 90,
    allowEditing: false,
    resultType: 'dataUrl', // or 'uri', 'base64'
    source: 'prompt' // 'camera', 'photos', or 'prompt'
  };

  const config = { ...defaultOptions, ...options };

  if (isNative && Camera) {
    try {
      const image = await Camera.getPhoto({
        quality: config.quality,
        allowEditing: config.allowEditing,
        resultType: config.resultType === 'dataUrl' ? 'dataUrl' : 'uri',
        source: config.source === 'camera' ? 'camera' :
                config.source === 'photos' ? 'photos' : 'prompt'
      });
      return { success: true, data: image.dataUrl || image.webPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Web fallback - use file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (config.source === 'camera') {
      input.capture = 'environment';
    }
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => resolve({ success: true, data: reader.result });
        reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
        reader.readAsDataURL(file);
      } else {
        resolve({ success: false, error: 'No file selected' });
      }
    };
    input.click();
  });
}

/**
 * Geolocation - Get current position
 */
export async function getCurrentPosition(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  const config = { ...defaultOptions, ...options };

  if (isNative && Geolocation) {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: config.enableHighAccuracy,
        timeout: config.timeout,
        maximumAge: config.maximumAge
      });
      return {
        success: true,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Web fallback
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ success: false, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed
          }
        });
      },
      (error) => {
        resolve({ success: false, error: error.message });
      },
      config
    );
  });
}

/**
 * Watch position for continuous tracking
 */
export async function watchPosition(callback, options = {}) {
  const config = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };

  if (isNative && Geolocation) {
    const watchId = await Geolocation.watchPosition(config, (position, error) => {
      if (error) {
        callback({ success: false, error: error.message });
      } else {
        callback({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
          }
        });
      }
    });
    return () => Geolocation.clearWatch({ id: watchId });
  }

  // Web fallback
  if (!navigator.geolocation) {
    callback({ success: false, error: 'Geolocation not supported' });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        success: true,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed
        }
      });
    },
    (error) => {
      callback({ success: false, error: error.message });
    },
    config
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

/**
 * Push Notifications - Request permission and register
 */
export async function registerPushNotifications(onNotification) {
  if (isNative && PushNotifications) {
    try {
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      // Register for push
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.log('[NativeBridge] Push registration token:', token.value);
        // Send token to your backend
      });

      // Listen for notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        onNotification && onNotification({
          type: 'received',
          title: notification.title,
          body: notification.body,
          data: notification.data
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        onNotification && onNotification({
          type: 'tapped',
          title: notification.notification.title,
          body: notification.notification.body,
          data: notification.notification.data
        });
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Web fallback - use Web Push API
  if (!('Notification' in window)) {
    return { success: false, error: 'Notifications not supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Permission denied' };
    }
    return { success: true, webPush: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Haptic feedback
 */
export async function vibrate(type = 'medium') {
  if (isNative && Haptics) {
    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: 'light' });
          break;
        case 'medium':
          await Haptics.impact({ style: 'medium' });
          break;
        case 'heavy':
          await Haptics.impact({ style: 'heavy' });
          break;
        case 'success':
          await Haptics.notification({ type: 'success' });
          break;
        case 'warning':
          await Haptics.notification({ type: 'warning' });
          break;
        case 'error':
          await Haptics.notification({ type: 'error' });
          break;
        default:
          await Haptics.vibrate();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Web fallback
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 50 : type === 'heavy' ? 200 : 100;
    navigator.vibrate(duration);
    return { success: true };
  }

  return { success: false, error: 'Vibration not supported' };
}

// Cache for network status to avoid excessive checks
let lastNetworkCheck = { timestamp: 0, result: null };
const NETWORK_CHECK_CACHE_MS = 3000; // Cache result for 3 seconds

/**
 * Network Status - Get current connectivity
 * Uses a real connectivity test for web apps since navigator.onLine is unreliable
 */
export async function getNetworkStatus() {
  // Use Capacitor Network plugin if available (native app)
  if (isNative && Network) {
    try {
      const status = await Network.getStatus();
      return {
        success: true,
        connected: status.connected,
        connectionType: status.connectionType // 'wifi', 'cellular', 'none', 'unknown'
      };
    } catch (error) {
      console.warn('[NativeBridge] Network status error, falling back to web check:', error.message);
    }
  }

  // Check cache first
  const now = Date.now();
  if (lastNetworkCheck.result && (now - lastNetworkCheck.timestamp) < NETWORK_CHECK_CACHE_MS) {
    return lastNetworkCheck.result;
  }

  // Web fallback - use navigator.onLine first, then verify with actual fetch
  if (!navigator.onLine) {
    // Browser is definitely offline
    const result = {
      success: true,
      connected: false,
      connectionType: 'none'
    };
    lastNetworkCheck = { timestamp: now, result };
    return result;
  }

  // Browser says online, but verify with actual network request
  try {
    // Try to fetch a small resource to verify connectivity
    // Use the app's own API endpoint or a reliable CDN
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const testUrls = [
      '/api/health', // App's own health endpoint
      'https://www.google.com/generate_204', // Google's connectivity check
    ];

    let connected = false;
    for (const url of testUrls) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors', // Allows checking external URLs
          cache: 'no-store',
          signal: controller.signal
        });
        // If we get here without error, we're connected
        connected = true;
        break;
      } catch (fetchErr) {
        // Try next URL
        continue;
      }
    }

    clearTimeout(timeoutId);

    const result = {
      success: true,
      connected,
      connectionType: connected ? 'unknown' : 'none'
    };
    lastNetworkCheck = { timestamp: now, result };
    return result;
  } catch (error) {
    // Network request failed - we're likely offline
    const result = {
      success: true,
      connected: false,
      connectionType: 'none'
    };
    lastNetworkCheck = { timestamp: now, result };
    return result;
  }
}

/**
 * Watch network status changes
 * @param {Function} callback - Called with { connected, connectionType } on change
 * @returns {Function} - Cleanup function to stop watching
 */
export async function watchNetworkStatus(callback) {
  if (isNative && Network) {
    try {
      const handle = await Network.addListener('networkStatusChange', (status) => {
        // Clear cache when status changes
        lastNetworkCheck = { timestamp: 0, result: null };
        callback({
          connected: status.connected,
          connectionType: status.connectionType
        });
      });
      return () => handle.remove();
    } catch (error) {
      console.warn('[NativeBridge] Failed to watch network:', error);
    }
  }

  // Web fallback - combine events with periodic polling for reliability
  let lastKnownStatus = navigator.onLine;
  let pollIntervalId = null;

  const checkAndNotify = async () => {
    const status = await getNetworkStatus();
    if (status.connected !== lastKnownStatus) {
      lastKnownStatus = status.connected;
      callback({
        connected: status.connected,
        connectionType: status.connectionType
      });
    }
  };

  // Listen to browser events
  const onlineHandler = () => {
    lastNetworkCheck = { timestamp: 0, result: null }; // Clear cache
    checkAndNotify();
  };
  const offlineHandler = () => {
    lastNetworkCheck = { timestamp: 0, result: null }; // Clear cache
    callback({ connected: false, connectionType: 'none' });
    lastKnownStatus = false;
  };

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  // Also poll periodically (every 10 seconds) as browser events are unreliable
  pollIntervalId = setInterval(checkAndNotify, 10000);

  // Initial check
  checkAndNotify();

  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
    }
  };
}

/**
 * Check if running as native app
 */
export function isNativeApp() {
  return isNative;
}

/**
 * Get platform info
 */
export function getPlatform() {
  return {
    isNative: isNative,
    platform: Capacitor.getPlatform(), // 'web', 'ios', 'android'
    isAndroid: Capacitor.getPlatform() === 'android',
    isIOS: Capacitor.getPlatform() === 'ios',
    isWeb: Capacitor.getPlatform() === 'web'
  };
}

export default {
  initializeNative,
  takePhoto,
  getCurrentPosition,
  watchPosition,
  registerPushNotifications,
  vibrate,
  getNetworkStatus,
  watchNetworkStatus,
  isNativeApp,
  getPlatform
};
