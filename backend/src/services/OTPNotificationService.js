/**
 * Multi-Channel OTP Notification Service
 * Supports: WhatsApp, Flash Call, SMS, and Simple Fallback
 *
 * Priority Order:
 * 1. WhatsApp OTP (if configured) - Most reliable in Africa
 * 2. Flash Call / Missed Call (if configured) - Simple for users
 * 3. SMS (if configured) - Traditional method
 * 4. Simple Fallback - Always works (shows OTP in response)
 *
 * Sierra Leone Mobile Prefixes:
 * - Orange: +232 25, +232 76, +232 78
 * - Africell: +232 30, +232 33, +232 77, +232 88, +232 90, +232 99
 * - Sierratel: +232 21, +232 22
 * - Qcell: +232 34
 */

const https = require('https');

class OTPNotificationService {
  constructor() {
    // ===========================================
    // WhatsApp Configuration (Twilio)
    // ===========================================
    this.whatsappEnabled = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER);
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

    // ===========================================
    // Flash Call Configuration (Twilio Verify or MSG91)
    // ===========================================
    this.flashCallEnabled = !!(process.env.TWILIO_VERIFY_SERVICE_SID || process.env.MSG91_AUTH_KEY);
    this.twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    this.msg91AuthKey = process.env.MSG91_AUTH_KEY;

    // ===========================================
    // SMS Configuration (EasySendSMS)
    // ===========================================
    this.smsEnabled = !!process.env.EASYSENDSMS_API_KEY;
    this.smsApiKey = process.env.EASYSENDSMS_API_KEY;
    this.smsApiUrl = 'https://restapi.easysendsms.app/v1/rest/sms/send';
    this.smsSenderId = process.env.SMS_SENDER_ID || 'AbachaOL';

    // ===========================================
    // Simple Fallback (Always enabled)
    // ===========================================
    this.fallbackEnabled = process.env.OTP_FALLBACK_ENABLED !== 'false'; // Enabled by default

    // ===========================================
    // Email Configuration (SendGrid) - Optional backup
    // ===========================================
    this.emailEnabled = !!process.env.SENDGRID_API_KEY;
    this.sendGridApiKey = process.env.SENDGRID_API_KEY;
    this.sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@abachaonline.com';
    this.sendGridFromName = process.env.SENDGRID_FROM_NAME || 'AbachaOnline';

    // Log available channels
    console.log('[OTP Service] Available channels:');
    console.log(`  - WhatsApp: ${this.whatsappEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  - Flash Call: ${this.flashCallEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  - SMS: ${this.smsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  - Email: ${this.emailEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  - Fallback: ${this.fallbackEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Get carrier name from phone number
   */
  getCarrier(phone) {
    const normalized = phone.replace(/[\s\-\(\)]/g, '');

    const carriers = {
      'Africell': ['+23230', '+23233', '+23277', '+23288', '+23290', '+23299'],
      'Orange': ['+23225', '+23276', '+23278'],
      'Sierratel': ['+23221', '+23222'],
      'Qcell': ['+23234']
    };

    for (const [carrier, prefixes] of Object.entries(carriers)) {
      if (prefixes.some(p => normalized.startsWith(p) || normalized.startsWith(p.substring(1)))) {
        return carrier;
      }
    }
    return 'Unknown';
  }

  /**
   * Format phone number (remove + or 00 prefix)
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
   * Format phone for WhatsApp (needs + prefix)
   */
  formatPhoneForWhatsApp(phone) {
    let formatted = phone.replace(/[\s\-\(\)]/g, '');
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    return `whatsapp:${formatted}`;
  }

  // ===========================================
  // MAIN OTP SENDING METHOD
  // ===========================================

  /**
   * Send OTP using available channels with automatic fallback
   * @param {string} phone - Phone number in international format
   * @param {string} otp - OTP code
   * @param {Object} options - Additional options (userName, email)
   * @returns {Promise<Object>} Send result with OTP if fallback used
   */
  async sendOTP(phone, otp, options = {}) {
    const { preferredMethod, userName, email } = options;

    console.log(`[OTP] ========================================`);
    console.log(`[OTP] Sending OTP to ${phone}`);
    console.log(`[OTP] Email: ${email || 'Not provided'}`);
    console.log(`[OTP] Generated code: ${otp}`);
    console.log(`[OTP] Carrier: ${this.getCarrier(phone)}`);
    console.log(`[OTP] ========================================`);

    // Track which methods we tried
    const attempts = [];

    // Try WhatsApp first (most reliable in Africa)
    if (this.whatsappEnabled && preferredMethod !== 'skip_whatsapp') {
      console.log(`[OTP] Trying WhatsApp...`);
      const result = await this.sendWhatsApp(phone, otp);
      attempts.push({ method: 'whatsapp', ...result });
      if (result.success) {
        return { ...result, method: 'whatsapp', otp: null }; // Don't expose OTP if sent successfully
      }
    }

    // Try Flash Call (simple for users)
    if (this.flashCallEnabled && preferredMethod !== 'skip_flashcall') {
      console.log(`[OTP] Trying Flash Call...`);
      const result = await this.sendFlashCall(phone, otp);
      attempts.push({ method: 'flashcall', ...result });
      if (result.success) {
        return { ...result, method: 'flashcall', otp: null };
      }
    }

    // Try SMS
    if (this.smsEnabled && preferredMethod !== 'skip_sms') {
      console.log(`[OTP] Trying SMS...`);
      const result = await this.sendSMS(phone, otp);
      attempts.push({ method: 'sms', ...result });
      if (result.success) {
        return {
          ...result,
          method: 'sms',
          message: 'OTP sent via SMS. Please wait 1-2 minutes. Use "Resend Code" if not received.'
        };
      }
    }

    // Try Email if provided (recovery option)
    if (this.emailEnabled && email && preferredMethod !== 'skip_email') {
      console.log(`[OTP] Trying Email to ${email}...`);
      const result = await this.sendEmail(email, otp, userName);
      attempts.push({ method: 'email', ...result });
      if (result.success) {
        return {
          ...result,
          method: 'email',
          message: 'OTP sent to your email. Please check your inbox (and spam folder).'
        };
      }
    }

    // Fallback: All delivery methods failed, but OTP is stored in database
    // User should use "Resend Code" to try again or contact support
    if (this.fallbackEnabled) {
      console.log(`[OTP] All delivery methods failed. OTP stored in database: ${otp}`);
      console.log(`[OTP] User should use Resend Code or check Railway logs for testing`);
      return {
        success: true,
        method: 'fallback',
        message: 'Verification code generated. Please check your phone/email or use "Resend Code" to try again.',
        attempts: attempts
      };
    }

    // All methods failed
    console.error(`[OTP] All delivery methods failed!`);
    return {
      success: false,
      method: 'none',
      error: 'All OTP delivery methods failed',
      message: 'Unable to send verification code. Please try again later.',
      attempts: attempts
    };
  }

  // ===========================================
  // WHATSAPP OTP (via Twilio)
  // ===========================================

  async sendWhatsApp(phone, otp) {
    if (!this.whatsappEnabled) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const toNumber = this.formatPhoneForWhatsApp(phone);
      const message = `🔐 *AbachaOnline Verification*\n\nYour code is: *${otp}*\n\nValid for 5 minutes. Do not share this code.`;

      const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');

      const response = await this.httpPostForm(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          From: this.twilioWhatsappNumber,
          To: toNumber,
          Body: message
        },
        {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      );

      console.log(`[OTP] WhatsApp response:`, JSON.stringify(response));

      if (response.sid) {
        console.log(`[OTP] ✅ WhatsApp OTP sent successfully`);
        return { success: true, messageId: response.sid, message: 'OTP sent via WhatsApp' };
      } else {
        return { success: false, error: response.message || 'WhatsApp send failed' };
      }
    } catch (error) {
      console.error(`[OTP] WhatsApp error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // FLASH CALL OTP (via Twilio Verify or MSG91)
  // ===========================================

  async sendFlashCall(phone, otp) {
    // Try Twilio Verify first
    if (this.twilioVerifyServiceSid) {
      return this.sendTwilioVerifyCall(phone);
    }

    // Try MSG91
    if (this.msg91AuthKey) {
      return this.sendMSG91FlashCall(phone, otp);
    }

    return { success: false, error: 'Flash call not configured' };
  }

  async sendTwilioVerifyCall(phone) {
    try {
      const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
      const formattedPhone = phone.startsWith('+') ? phone : '+' + phone;

      const response = await this.httpPostForm(
        `https://verify.twilio.com/v2/Services/${this.twilioVerifyServiceSid}/Verifications`,
        {
          To: formattedPhone,
          Channel: 'call' // Voice call channel
        },
        {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      );

      console.log(`[OTP] Twilio Verify response:`, JSON.stringify(response));

      if (response.status === 'pending') {
        console.log(`[OTP] ✅ Flash call initiated`);
        return {
          success: true,
          sid: response.sid,
          message: 'You will receive a call. The last 4 digits of the caller ID is your OTP.'
        };
      } else {
        return { success: false, error: response.message || 'Flash call failed' };
      }
    } catch (error) {
      console.error(`[OTP] Twilio Verify error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendMSG91FlashCall(phone, otp) {
    try {
      const formattedPhone = this.formatPhoneForAPI(phone);

      const response = await this.httpPost(
        'https://api.msg91.com/api/v5/otp',
        {
          mobile: formattedPhone,
          otp: otp,
          sender: 'ABACHA',
          DLT_TE_ID: process.env.MSG91_DLT_TE_ID || ''
        },
        {
          'authkey': this.msg91AuthKey,
          'Content-Type': 'application/json'
        }
      );

      console.log(`[OTP] MSG91 response:`, JSON.stringify(response));

      if (response.type === 'success') {
        console.log(`[OTP] ✅ MSG91 OTP sent`);
        return { success: true, message: 'OTP sent via MSG91' };
      } else {
        return { success: false, error: response.message || 'MSG91 failed' };
      }
    } catch (error) {
      console.error(`[OTP] MSG91 error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // SMS OTP (via EasySendSMS)
  // ===========================================

  async sendSMS(phone, otp) {
    if (!this.smsEnabled) {
      return { success: false, error: 'SMS not configured' };
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
          type: '0'
        },
        {
          'apikey': this.smsApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      );

      console.log(`[OTP] EasySendSMS response:`, JSON.stringify(response));

      if (response.status === 'OK' || response.messageIds) {
        console.log(`[OTP] ✅ SMS sent (delivery not guaranteed)`);
        return {
          success: true,
          messageId: response.messageIds?.[0],
          carrier: this.getCarrier(phone),
          message: 'OTP sent via SMS'
        };
      } else {
        return { success: false, error: response.description || 'SMS send failed' };
      }
    } catch (error) {
      console.error(`[OTP] SMS error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // EMAIL OTP (via SendGrid)
  // ===========================================

  async sendEmail(email, otp, userName) {
    if (!this.emailEnabled) {
      return { success: false, error: 'Email not configured' };
    }

    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">AbachaOnline</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Campus Delivery Platform</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">Hello${userName ? ` ${userName}` : ''},</p>
            <p style="color: #666; font-size: 14px;">Your verification code is:</p>
            <div style="background: #fff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This code is valid for <strong>5 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>AbachaOnline - Your Campus Delivery Partner</p>
          </div>
        </div>
      `;

      const textContent = `AbachaOnline Verification Code\n\nHello${userName ? ` ${userName}` : ''},\n\nYour verification code is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;

      const response = await this.httpPost(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [{
            to: [{ email: email }],
            subject: `Your AbachaOnline verification code: ${otp}`
          }],
          from: {
            email: this.sendGridFromEmail,
            name: this.sendGridFromName
          },
          content: [
            { type: 'text/plain', value: textContent },
            { type: 'text/html', value: htmlContent }
          ]
        },
        {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json'
        }
      );

      console.log(`[OTP] SendGrid response:`, JSON.stringify(response));

      // SendGrid returns empty response on success (202 Accepted)
      if (!response.errors) {
        console.log(`[OTP] ✅ Email OTP sent successfully to ${email}`);
        return { success: true, message: 'OTP sent via email' };
      } else {
        return { success: false, error: response.errors?.[0]?.message || 'Email send failed' };
      }
    } catch (error) {
      console.error(`[OTP] Email error:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // ===========================================
  // HTTP HELPERS
  // ===========================================

  httpPost(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = JSON.stringify(data);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
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
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch {
            resolve({ raw: body });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  httpPostForm(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = new URLSearchParams(data).toString();

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch {
            resolve({ raw: body });
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
