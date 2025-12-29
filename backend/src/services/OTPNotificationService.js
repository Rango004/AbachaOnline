/**
 * OTP Notification Service
 * Handles sending OTP codes via SMS (EasySendSMS) and Email (SendGrid)
 *
 * Sierra Leone Mobile Prefixes:
 * - Orange: +232 25, +232 76, +232 78
 * - Africell: +232 30, +232 33, +232 77, +232 88, +232 90, +232 99 (BLOCKED - expensive rates)
 * - Sierratel: +232 21, +232 22
 * - Qcell: +232 34
 */

const https = require('https');

class OTPNotificationService {
  constructor() {
    // EasySendSMS configuration
    this.smsApiKey = process.env.EASYSENDSMS_API_KEY;
    this.smsApiUrl = 'https://restapi.easysendsms.app/v1/rest/sms/send';
    this.smsSenderId = process.env.SMS_SENDER_ID || 'AbachaOL';

    // SendGrid configuration
    this.sendGridApiKey = process.env.SENDGRID_API_KEY;
    this.sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@abachaonline.com';
    this.sendGridFromName = process.env.SENDGRID_FROM_NAME || 'AbachaOnline';

    // Africell prefixes to block (expensive rates)
    this.blockedPrefixes = [
      '+23230', '+23233', '+23277', '+23288', '+23290', '+23299',
      '23230', '23233', '23277', '23288', '23290', '23299'
    ];

    // Supported Orange/Sierratel/Qcell prefixes
    this.supportedPrefixes = [
      '+23225', '+23276', '+23278', // Orange
      '+23221', '+23222', // Sierratel
      '+23234', // Qcell
      '23225', '23276', '23278',
      '23221', '23222',
      '23234'
    ];
  }

  /**
   * Check if phone number is Africell (blocked)
   * @param {string} phone - Phone number
   * @returns {boolean} True if Africell number
   */
  isAfricellNumber(phone) {
    const normalized = phone.replace(/[\s\-\(\)]/g, '');
    return this.blockedPrefixes.some(prefix => normalized.startsWith(prefix));
  }

  /**
   * Check if phone number is supported (Orange/Sierratel)
   * @param {string} phone - Phone number
   * @returns {boolean} True if supported carrier
   */
  isSupportedCarrier(phone) {
    const normalized = phone.replace(/[\s\-\(\)]/g, '');
    return this.supportedPrefixes.some(prefix => normalized.startsWith(prefix));
  }

  /**
   * Get carrier name from phone number
   * @param {string} phone - Phone number
   * @returns {string} Carrier name
   */
  getCarrier(phone) {
    const normalized = phone.replace(/[\s\-\(\)]/g, '');

    // Africell (blocked - expensive rates)
    const africellPrefixes = ['+23230', '+23233', '+23277', '+23288', '+23290', '+23299', '23230', '23233', '23277', '23288', '23290', '23299'];
    if (africellPrefixes.some(p => normalized.startsWith(p))) {
      return 'Africell';
    }

    // Orange
    const orangePrefixes = ['+23225', '+23276', '+23278', '23225', '23276', '23278'];
    if (orangePrefixes.some(p => normalized.startsWith(p))) {
      return 'Orange';
    }

    // Sierratel
    const sierratelPrefixes = ['+23221', '+23222', '23221', '23222'];
    if (sierratelPrefixes.some(p => normalized.startsWith(p))) {
      return 'Sierratel';
    }

    // Qcell
    const qcellPrefixes = ['+23234', '23234'];
    if (qcellPrefixes.some(p => normalized.startsWith(p))) {
      return 'Qcell';
    }

    return 'Unknown';
  }

  /**
   * Format phone number for EasySendSMS API (remove + or 00 prefix)
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneForAPI(phone) {
    let formatted = phone.replace(/[\s\-\(\)]/g, '');
    if (formatted.startsWith('+')) {
      formatted = formatted.substring(1);
    } else if (formatted.startsWith('00')) {
      formatted = formatted.substring(2);
    }
    return formatted;
  }

  /**
   * Send OTP via SMS using EasySendSMS
   * @param {string} phone - Phone number in international format
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} Send result
   */
  async sendSMS(phone, otp) {
    // Always log OTP for debugging (check Railway logs)
    console.log(`[OTP] Generated OTP for ${phone}: ${otp}`);

    // Check if API key is configured
    if (!this.smsApiKey) {
      console.log(`[OTP][DEV MODE] No API key - SMS OTP for ${phone}: ${otp}`);
      return {
        success: true,
        devMode: true,
        otp: otp, // Return OTP in dev mode for testing
        message: 'SMS sent (development mode)'
      };
    }

    try {
      const message = `Your AbachaOnline verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
      const formattedPhone = this.formatPhoneForAPI(phone);

      console.log(`[OTP] Sending SMS to ${formattedPhone} from ${this.smsSenderId}`);

      const response = await this.httpPost(
        this.smsApiUrl,
        {
          from: this.smsSenderId,
          to: formattedPhone,
          text: message,
          type: '0' // Plain text (GSM 3.38)
        },
        {
          'apikey': this.smsApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      );

      // Log full API response for debugging
      console.log(`[OTP] EasySendSMS API Response:`, JSON.stringify(response));

      // Check if response indicates success
      if (response.error || response.Error) {
        console.error(`[OTP] EasySendSMS error:`, response.error || response.Error, response.description || response.Description);
        return {
          success: false,
          error: response.description || response.Description || 'SMS delivery failed',
          message: 'Failed to send SMS. Please check Railway logs for OTP.'
        };
      }

      console.log(`[OTP] SMS sent successfully to ${phone} via EasySendSMS`);

      return {
        success: true,
        carrier: this.getCarrier(phone),
        messageId: response.messageIds?.[0] || response.messageId || null,
        message: 'OTP sent via SMS'
      };
    } catch (error) {
      console.error(`[OTP] SMS sending failed for ${phone}:`, error.message);
      // Still log the OTP so user can verify via Railway logs
      console.log(`[OTP] FALLBACK - Use this OTP from logs: ${otp}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send SMS. Please check Railway logs for OTP.'
      };
    }
  }

  /**
   * Send OTP via Email using SendGrid
   * @param {string} email - Email address
   * @param {string} otp - OTP code
   * @param {string} userName - User's name for personalization
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(email, otp, userName = 'Customer') {
    // Check if API key is configured
    if (!this.sendGridApiKey) {
      console.log(`📧 [DEV MODE] Email OTP for ${email}: ${otp}`);
      return {
        success: true,
        devMode: true,
        message: 'Email sent (development mode)'
      };
    }

    try {
      const emailData = {
        personalizations: [{
          to: [{ email: email }],
          subject: `Your AbachaOnline Verification Code: ${otp}`
        }],
        from: {
          email: this.sendGridFromEmail,
          name: this.sendGridFromName
        },
        content: [{
          type: 'text/html',
          value: this.getEmailTemplate(otp, userName)
        }]
      };

      await this.httpPost('https://api.sendgrid.com/v3/mail/send', emailData, {
        'Authorization': `Bearer ${this.sendGridApiKey}`,
        'Content-Type': 'application/json'
      });

      console.log(`📧 Email sent to ${email} via SendGrid`);

      return {
        success: true,
        message: 'OTP sent via email'
      };
    } catch (error) {
      console.error(`❌ Email sending failed for ${email}:`, error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email. Please try again.'
      };
    }
  }

  /**
   * Send OTP - tries SMS first, falls back to email if available
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @param {string} email - Optional email for fallback
   * @param {string} userName - User's name
   * @returns {Promise<Object>} Send result
   */
  async sendOTP(phone, otp, email = null, userName = 'Customer') {
    // Try SMS first
    const smsResult = await this.sendSMS(phone, otp);

    // If SMS was blocked (Africell) and email is available, use email
    if (smsResult.blocked && email) {
      console.log(`📧 Falling back to email for Africell user: ${email}`);
      const emailResult = await this.sendEmail(email, otp, userName);
      return {
        ...emailResult,
        method: 'email',
        reason: 'Africell SMS temporarily unavailable'
      };
    }

    // If SMS failed but not blocked, and email available, try email
    if (!smsResult.success && !smsResult.blocked && email) {
      console.log(`📧 SMS failed, falling back to email: ${email}`);
      const emailResult = await this.sendEmail(email, otp, userName);
      return {
        ...emailResult,
        method: 'email',
        reason: 'SMS delivery failed'
      };
    }

    return {
      ...smsResult,
      method: smsResult.blocked ? 'blocked' : 'sms'
    };
  }

  /**
   * Generate HTML email template for OTP
   * @param {string} otp - OTP code
   * @param {string} userName - User's name
   * @returns {string} HTML email content
   */
  getEmailTemplate(otp, userName) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #4CAF50; margin: 0; font-size: 24px;">AbachaOnline</h1>
      <p style="color: #666; margin: 5px 0 0 0;">Campus Delivery Platform</p>
    </div>

    <p style="color: #333; font-size: 16px;">Hi ${userName},</p>

    <p style="color: #666; font-size: 14px;">Your verification code is:</p>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4CAF50;">${otp}</span>
    </div>

    <p style="color: #666; font-size: 14px;">This code expires in <strong>5 minutes</strong>.</p>

    <p style="color: #999; font-size: 12px; margin-top: 30px;">
      If you didn't request this code, please ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

    <p style="color: #999; font-size: 11px; text-align: center;">
      &copy; ${new Date().getFullYear()} AbachaOnline. All rights reserved.
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * HTTP POST helper
   * @param {string} url - API endpoint
   * @param {Object} data - Request body
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  httpPost(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = JSON.stringify(data);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch {
              resolve({ raw: body });
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

module.exports = new OTPNotificationService();
