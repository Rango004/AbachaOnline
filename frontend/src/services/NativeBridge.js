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

/**
 * Network Status - Get current connectivity
 * Uses Capacitor Network plugin for native apps, actual connectivity test for web
 *
 * IMPORTANT: navigator.onLine is UNRELIABLE on Android WebView - it returns true
 * even when connected to WiFi without internet. We must test actual connectivity.
 */
export async function getNetworkStatus() {
  // For native apps, try Capacitor Network plugin first
  if (isNative) {
    try {
      // If Network plugin is already loaded from initializeNative()
      if (Network) {
        const status = await Network.getStatus();
        console.log('[NativeBridge] Native network status:', status);
        return {
          success: true,
          connected: status.connected,
          connectionType: status.connectionType // 'wifi', 'cellular', 'none', 'unknown'
        };
      }

      // Try to dynamically import Network plugin if not loaded yet
      const { Network: NetworkPlugin } = await import('@capacitor/network');
      const status = await NetworkPlugin.getStatus();
      console.log('[NativeBridge] Native network status (dynamic):', status);
      return {
        success: true,
        connected: status.connected,
        connectionType: status.connectionType
      };
    } catch (error) {
      console.warn('[NativeBridge] Native network check failed, falling back to connectivity test:', error.message);
    }
  }

  // Web/PWA fallback - must test ACTUAL connectivity
  // navigator.onLine is unreliable - returns true when connected to WiFi without internet

  // Quick check: if browser says offline, it's definitely offline
  if (!navigator.onLine) {
    console.log('[NativeBridge] navigator.onLine is false - definitely offline');
    return {
      success: true,
      connected: false,
      connectionType: 'none'
    };
  }

  // Browser says online, but we MUST verify with actual connectivity test
  // Use the backend /health endpoint which is NOT cached by service worker
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Get API base URL
    const API_BASE = import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');

    // Add timestamp to prevent ANY caching (URL-based, service worker, browser)
    const timestamp = Date.now();
    const healthUrl = `${API_BASE}/health?_t=${timestamp}`;

    console.log('[NativeBridge] Testing connectivity to:', healthUrl);

    const response = await fetch(healthUrl, {
      method: 'HEAD',
      // 'no-store' is stronger than 'no-cache' - completely bypasses cache
      cache: 'no-store',
      signal: controller.signal,
      // Set mode to avoid CORS issues
      mode: 'cors',
      // Don't send credentials for simple health check
      credentials: 'omit'
    });

    clearTimeout(timeoutId);

    // Check if response is actually successful
    if (response.ok || response.status === 200) {
      console.log('[NativeBridge] Connectivity test PASSED - online');
      return {
        success: true,
        connected: true,
        connectionType: 'unknown'
      };
    } else {
      // Got a response but it's an error (server might be having issues)
      console.log('[NativeBridge] Connectivity test got error response:', response.status);
      return {
        success: true,
        connected: true, // Network is available, just server issue
        connectionType: 'unknown'
      };
    }
  } catch (error) {
    // Fetch failed - we're offline or having connectivity issues
    const errorMsg = error.name === 'AbortError' ? 'timeout' : error.message;
    console.log('[NativeBridge] Connectivity test FAILED - offline. Error:', errorMsg);
    return {
      success: true,
      connected: false,
      connectionType: 'none'
    };
  }
}

/**
 * Watch network status changes
 * @param {Function} callback - Called with { connected, connectionType } on change
 * @returns {Function} - Cleanup function to stop watching
 */
export async function watchNetworkStatus(callback) {
  // For native apps, use Capacitor Network plugin
  if (isNative) {
    try {
      // If Network plugin is already loaded
      if (Network) {
        const handle = await Network.addListener('networkStatusChange', (status) => {
          console.log('[NativeBridge] Native network change:', status);
          callback({
            connected: status.connected,
            connectionType: status.connectionType
          });
        });
        return () => handle.remove();
      }

      // Try dynamic import
      const { Network: NetworkPlugin } = await import('@capacitor/network');
      const handle = await NetworkPlugin.addListener('networkStatusChange', (status) => {
        console.log('[NativeBridge] Native network change (dynamic):', status);
        callback({
          connected: status.connected,
          connectionType: status.connectionType
        });
      });
      return () => handle.remove();
    } catch (error) {
      console.warn('[NativeBridge] Failed to watch native network:', error);
    }
  }

  // Web fallback - but verify with actual connectivity test
  const onlineHandler = async () => {
    console.log('[NativeBridge] Browser online event fired, verifying...');
    // Don't just trust the event - verify actual connectivity
    const status = await getNetworkStatus();
    callback({
      connected: status.connected,
      connectionType: status.connectionType
    });
  };

  const offlineHandler = () => {
    console.log('[NativeBridge] Browser offline event fired');
    callback({ connected: false, connectionType: 'none' });
  };

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
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
