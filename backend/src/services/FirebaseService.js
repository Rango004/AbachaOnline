const admin = require('firebase-admin');

class FirebaseService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initialize() {
    if (this.initialized) return;

    try {
      // For local development, use service account file
      if (process.env.NODE_ENV !== 'production' && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('[Firebase] Initialized with service account file');
      }
      // For production (Railway), use environment variables
      else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          })
        });
        console.log('[Firebase] Initialized with environment variables');
      } else {
        console.warn('[Firebase] Not initialized - missing credentials');
        return;
      }

      this.initialized = true;
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
    }
  }

  /**
   * Send push notification to a single device
   * @param {string} token - Device FCM token
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   */
  async sendToDevice(token, notification, data = {}) {
    if (!this.initialized) {
      console.warn('[Firebase] Not initialized, skipping notification');
      return null;
    }

    try {
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            priority: 'high',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('[Firebase] Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('[Firebase] Send notification error:', error);

      // Handle invalid token errors
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        console.log('[Firebase] Invalid token, should be removed from database');
        return { error: 'INVALID_TOKEN', shouldRemove: true };
      }

      throw error;
    }
  }

  /**
   * Send push notification to multiple devices
   * @param {Array<string>} tokens - Array of device FCM tokens
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   */
  async sendToMultipleDevices(tokens, notification, data = {}) {
    if (!this.initialized) {
      console.warn('[Firebase] Not initialized, skipping notification');
      return null;
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl })
        },
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
            priority: 'high'
          }
        },
        tokens // Send to multiple tokens
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[Firebase] ${response.successCount} notifications sent successfully`);

      if (response.failureCount > 0) {
        console.warn(`[Firebase] ${response.failureCount} notifications failed`);

        // Collect failed tokens
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`[Firebase] Failed token ${idx}:`, resp.error);
          }
        });

        return { ...response, failedTokens };
      }

      return response;
    } catch (error) {
      console.error('[Firebase] Send multicast notification error:', error);
      throw error;
    }
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(userTokens, order) {
    const notification = {
      title: `Order #${order.id} - ${order.status}`,
      body: `Your order has been ${order.status.toLowerCase()}`
    };

    const data = {
      type: 'order',
      orderId: order.id.toString(),
      status: order.status,
      click_action: 'ORDER_DETAIL'
    };

    if (Array.isArray(userTokens)) {
      return await this.sendToMultipleDevices(userTokens, notification, data);
    } else {
      return await this.sendToDevice(userTokens, notification, data);
    }
  }

  /**
   * Send chat message notification
   */
  async sendChatNotification(userToken, message) {
    const notification = {
      title: message.senderName || 'New Message',
      body: message.text.substring(0, 100) // Truncate long messages
    };

    const data = {
      type: 'chat',
      chatId: message.orderId.toString(),
      senderId: message.senderId.toString(),
      click_action: 'CHAT_DETAIL'
    };

    return await this.sendToDevice(userToken, notification, data);
  }

  /**
   * Send delivery update notification
   */
  async sendDeliveryNotification(userToken, delivery) {
    const notification = {
      title: 'Delivery Update',
      body: `Your order is ${delivery.status}. ETA: ${delivery.eta}`
    };

    const data = {
      type: 'delivery',
      orderId: delivery.orderId.toString(),
      status: delivery.status,
      eta: delivery.eta,
      click_action: 'ORDER_TRACKING'
    };

    return await this.sendToDevice(userToken, notification, data);
  }
}

module.exports = new FirebaseService();
