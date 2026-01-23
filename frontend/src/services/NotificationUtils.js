/**
 * Notification Utilities
 * Handles sound and vibration feedback for notifications
 */

// Audio context for notification sounds
let audioContext = null;

// Cached notification sounds
const soundCache = {
  notification: null,
  chat: null,
  order: null
};

// Sound enabled state (persisted in localStorage)
const SOUND_ENABLED_KEY = 'notification_sound_enabled';
const VIBRATION_ENABLED_KEY = 'notification_vibration_enabled';

/**
 * Initialize the audio context (must be called after user interaction)
 */
export function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }
  return audioContext;
}

/**
 * Check if sound is enabled
 */
export function isSoundEnabled() {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === 'true';
}

/**
 * Set sound enabled state
 */
export function setSoundEnabled(enabled) {
  localStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
}

/**
 * Check if vibration is enabled
 */
export function isVibrationEnabled() {
  const stored = localStorage.getItem(VIBRATION_ENABLED_KEY);
  return stored === null ? true : stored === 'true';
}

/**
 * Set vibration enabled state
 */
export function setVibrationEnabled(enabled) {
  localStorage.setItem(VIBRATION_ENABLED_KEY, enabled.toString());
}

/**
 * Generate a notification sound using Web Audio API
 * @param {string} type - Type of sound: 'notification', 'chat', 'order', 'success', 'error'
 */
export function playNotificationSound(type = 'notification') {
  if (!isSoundEnabled()) return;

  // Initialize audio context if needed
  if (!audioContext) {
    initAudioContext();
  }

  if (!audioContext) return;

  // Resume audio context if suspended (required after user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for different notification types
    switch (type) {
      case 'chat':
        // Quick double beep for chat messages
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;

      case 'order':
        // Pleasant chime for order updates
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;

      case 'success':
        // Happy ascending tone
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // C#5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'error':
        // Low warning tone
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.15); // G3
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'notification':
      default:
        // Standard notification sound - soft bell
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.15); // G5
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  } catch (e) {
    console.warn('Error playing notification sound:', e);
  }
}

/**
 * Vibrate the device
 * @param {string} type - Type of vibration: 'notification', 'chat', 'order', 'success', 'error'
 */
export function vibrate(type = 'notification') {
  if (!isVibrationEnabled()) return;

  // Check if vibration API is supported
  if (!navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'chat':
        // Quick double vibration for chat
        navigator.vibrate([50, 50, 50]);
        break;

      case 'order':
        // Longer vibration for order updates
        navigator.vibrate([100, 50, 100]);
        break;

      case 'success':
        // Single short vibration
        navigator.vibrate(100);
        break;

      case 'error':
        // Two longer vibrations
        navigator.vibrate([150, 100, 150]);
        break;

      case 'notification':
      default:
        // Standard notification vibration
        navigator.vibrate([75, 50, 75]);
        break;
    }
  } catch (e) {
    console.warn('Error triggering vibration:', e);
  }
}

/**
 * Play notification feedback (sound + vibration)
 * @param {string} type - Type of notification
 */
export function notifyUser(type = 'notification') {
  playNotificationSound(type);
  vibrate(type);
}

/**
 * Determine notification type from notification data
 * @param {Object} notification - Notification object
 * @returns {string} - Type for sound/vibration
 */
export function getNotificationType(notification) {
  if (!notification || !notification.type) return 'notification';

  const type = notification.type.toLowerCase();

  if (type.includes('chat') || type.includes('message')) {
    return 'chat';
  }

  if (type.includes('order') || type.includes('delivery') || type.includes('assigned')) {
    return 'order';
  }

  if (type.includes('success') || type.includes('approved') || type.includes('completed')) {
    return 'success';
  }

  if (type.includes('error') || type.includes('rejected') || type.includes('failed') || type.includes('cancelled')) {
    return 'error';
  }

  return 'notification';
}

/**
 * Request notification permission and initialize audio
 * Call this on first user interaction
 */
export async function initNotifications() {
  // Initialize audio context
  initAudioContext();

  // Request notification permission if not already granted
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.warn('Could not request notification permission:', e);
    }
  }
}

/**
 * Show a browser notification (for background notifications)
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export function showBrowserNotification(title, options = {}) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: isVibrationEnabled() ? [100, 50, 100] : undefined,
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (e) {
      console.warn('Error showing browser notification:', e);
    }
  }
}

export default {
  initAudioContext,
  initNotifications,
  isSoundEnabled,
  setSoundEnabled,
  isVibrationEnabled,
  setVibrationEnabled,
  playNotificationSound,
  vibrate,
  notifyUser,
  getNotificationType,
  showBrowserNotification
};
