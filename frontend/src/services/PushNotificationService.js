import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import apiClient from './api';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Check if push notifications are available
   */
  isAvailable() {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize push notifications
   */
  async initialize() {
    if (!this.isAvailable() || this.isInitialized) {
      console.log('[PushNotifications] Not available or already initialized');
      return;
    }

    try {
      // Create notification channel for Android (required for Android 8+)
      if (Capacitor.getPlatform() === 'android') {
        await PushNotifications.createChannel({
          id: 'abachaonline',
          name: 'AbachaOnline Notifications',
          description: 'Order updates, messages, and delivery notifications',
          importance: 5, // Maximum importance
          sound: 'default',
          vibration: true,
          visibility: 1 // Public
        });
        console.log('[PushNotifications] Notification channel created');
      }

      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('[PushNotifications] Permission not granted');
        return;
      }

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // Listen for registration
      await PushNotifications.addListener('registration', (token) => {
        console.log('[PushNotifications] Registration token:', token.value);
        this.savePushToken(token.value);
      });

      // Listen for registration errors
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('[PushNotifications] Registration error:', error);
      });

      // Listen for push notifications received
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[PushNotifications] Notification received:', notification);
        this.handleNotificationReceived(notification);
      });

      // Listen for push notification actions
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('[PushNotifications] Action performed:', notification);
        this.handleNotificationAction(notification);
      });

      this.isInitialized = true;
      console.log('[PushNotifications] Initialized successfully');
    } catch (error) {
      console.error('[PushNotifications] Initialization error:', error);
    }
  }

  /**
   * Save push token to backend
   */
  async savePushToken(token) {
    try {
      await apiClient.post('/notifications/register-device', {
        token,
        platform: Capacitor.getPlatform()
      });
      console.log('[PushNotifications] Token saved to backend');
    } catch (error) {
      console.error('[PushNotifications] Failed to save token:', error);
    }
  }

  /**
   * Handle notification received while app is in foreground
   */
  handleNotificationReceived(notification) {
    // Show a local notification or update UI
    const { title, body, data } = notification;

    // Dispatch custom event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
        detail: { title, body, data }
      }));
    }

    // Play notification sound or show badge
    console.log(`[PushNotifications] ${title}: ${body}`);
  }

  /**
   * Handle notification action (user tapped on notification)
   */
  handleNotificationAction(notification) {
    const { data } = notification.notification;

    // Navigate based on notification type
    if (data) {
      if (data.type === 'order' && data.orderId) {
        window.location.href = `/orders/${data.orderId}`;
      } else if (data.type === 'chat' && data.chatId) {
        window.location.href = `/chat/${data.chatId}`;
      } else if (data.type === 'delivery' && data.orderId) {
        window.location.href = `/rider?order=${data.orderId}`;
      }
    }
  }

  /**
   * Get delivered notifications
   */
  async getDeliveredNotifications() {
    if (!this.isAvailable()) return [];

    try {
      const result = await PushNotifications.getDeliveredNotifications();
      return result.notifications;
    } catch (error) {
      console.error('[PushNotifications] Failed to get delivered notifications:', error);
      return [];
    }
  }

  /**
   * Remove all delivered notifications
   */
  async removeAllDeliveredNotifications() {
    if (!this.isAvailable()) return;

    try {
      await PushNotifications.removeAllDeliveredNotifications();
      console.log('[PushNotifications] All delivered notifications removed');
    } catch (error) {
      console.error('[PushNotifications] Failed to remove notifications:', error);
    }
  }

  /**
   * Cleanup listeners (call when user logs out)
   */
  async cleanup() {
    if (!this.isAvailable() || !this.isInitialized) return;

    try {
      await PushNotifications.removeAllListeners();
      this.isInitialized = false;
      console.log('[PushNotifications] Cleaned up');
    } catch (error) {
      console.error('[PushNotifications] Cleanup error:', error);
    }
  }
}

export default new PushNotificationService();
