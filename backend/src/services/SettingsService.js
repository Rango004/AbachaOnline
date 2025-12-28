const db = require('../config/database');

class SettingsService {
  /**
   * Get a system setting by key
   */
  async getSetting(settingKey, defaultValue = null) {
    try {
      const result = await db.query(
        'SELECT setting_value FROM system_settings WHERE setting_key = $1',
        [settingKey]
      );

      if (result.rows.length === 0) {
        return defaultValue;
      }

      return parseFloat(result.rows[0].setting_value);
    } catch (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
  }

  /**
   * Get all system settings
   */
  async getAllSettings() {
    try {
      const result = await db.query(
        'SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key'
      );

      const settings = {};
      result.rows.forEach(row => {
        settings[row.setting_key] = {
          value: parseFloat(row.setting_value),
          description: row.description
        };
      });

      return settings;
    } catch (error) {
      console.error('Error getting all settings:', error);
      throw error;
    }
  }

  /**
   * Update a system setting
   */
  async updateSetting(settingKey, newValue, adminId, description = null) {
    try {
      const result = await db.query(
        `UPDATE system_settings
         SET setting_value = $1, updated_at = NOW(), updated_by = $2, description = COALESCE($3, description)
         WHERE setting_key = $4
         RETURNING setting_key, setting_value, description`,
        [newValue, adminId, description, settingKey]
      );

      if (result.rows.length === 0) {
        // Create new setting if it doesn't exist
        const insertResult = await db.query(
          `INSERT INTO system_settings (setting_key, setting_value, updated_by, description)
           VALUES ($1, $2, $3, $4)
           RETURNING setting_key, setting_value, description`,
          [settingKey, newValue, adminId, description]
        );
        return insertResult.rows[0];
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  /**
   * Get rider delivery fee (commission)
   */
  async getRiderDeliveryFee() {
    try {
      return await this.getSetting('rider_delivery_fee', 50);
    } catch (error) {
      console.error('Error getting rider delivery fee:', error);
      return 50; // Default fallback
    }
  }

  /**
   * Update rider delivery fee (commission)
   */
  async updateRiderDeliveryFee(newFee, adminId) {
    try {
      if (newFee < 0) {
        throw new Error('Delivery fee cannot be negative');
      }

      return await this.updateSetting(
        'rider_delivery_fee',
        newFee,
        adminId,
        'Commission/fee paid to riders per delivery in Leone (Le)'
      );
    } catch (error) {
      console.error('Error updating rider delivery fee:', error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
