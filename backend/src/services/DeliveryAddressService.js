const db = require('../config/database');

class DeliveryAddressService {
  /**
   * Get all addresses for a student with pagination
   */
  static async getStudentAddresses(studentId, limit = 20, offset = 0) {
    try {
      const result = await db.query(
        `SELECT
           sa.id,
           sa.student_id,
           sa.location_id,
           sa.address_label,
           sa.delivery_address,
           sa.notes,
           sa.is_default,
           sa.latitude,
           sa.longitude,
           sa.created_at,
           sa.updated_at,
           l.name as location_name
         FROM student_addresses sa
         LEFT JOIN locations l ON sa.location_id = l.id
         WHERE sa.student_id = $1
         ORDER BY sa.is_default DESC, sa.created_at DESC
         LIMIT $2 OFFSET $3`,
        [studentId, limit, offset]
      );

      // Get total count
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM student_addresses WHERE student_id = $1`,
        [studentId]
      );

      return {
        items: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset
      };
    } catch (error) {
      throw new Error(`Failed to fetch addresses: ${error.message}`);
    }
  }

  /**
   * Get a specific address by ID (verify ownership)
   */
  static async getStudentAddressById(studentId, addressId) {
    try {
      const result = await db.query(
        `SELECT
           sa.id,
           sa.student_id,
           sa.location_id,
           sa.address_label,
           sa.delivery_address,
           sa.notes,
           sa.is_default,
           sa.latitude,
           sa.longitude,
           sa.created_at,
           sa.updated_at,
           l.name as location_name
         FROM student_addresses sa
         LEFT JOIN locations l ON sa.location_id = l.id
         WHERE sa.id = $1 AND sa.student_id = $2`,
        [addressId, studentId]
      );

      if (result.rows.length === 0) {
        throw new Error('Address not found or you do not have permission to access it');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to fetch address: ${error.message}`);
    }
  }

  /**
   * Get default address for a student
   */
  static async getDefaultAddress(studentId) {
    try {
      const result = await db.query(
        `SELECT
           sa.id,
           sa.student_id,
           sa.location_id,
           sa.address_label,
           sa.delivery_address,
           sa.notes,
           sa.is_default,
           sa.created_at,
           sa.latitude,
           sa.longitude,
           sa.updated_at,
           l.name as location_name
         FROM student_addresses sa
         LEFT JOIN locations l ON sa.location_id = l.id
         WHERE sa.student_id = $1 AND sa.is_default = TRUE
         LIMIT 1`,
        [studentId]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch default address: ${error.message}`);
    }
  }

  /**
   * Create a new address for a student
   */
  static async createAddress(studentId, addressData) {
    try {
      const { location_id, address_label, delivery_address, notes, is_default } = addressData;

      // Validate required fields
      if (!address_label || !delivery_address) {
        throw new Error('Address label and delivery address are required');
      }

      // Validate location if provided
      if (location_id) {
        const locationCheck = await db.query(
          'SELECT id FROM locations WHERE id = $1',
          [location_id]
        );
        if (locationCheck.rows.length === 0) {
          throw new Error('Invalid location ID');
        }
      }

      // If this is the first address or is_default is true, handle default logic
      let defaultFlag = is_default || false;
      if (defaultFlag) {
        // Remove default flag from other addresses
        await db.query(
          'UPDATE student_addresses SET is_default = FALSE WHERE student_id = $1',
          [studentId]
        );
      }

      const result = await db.query(
        `INSERT INTO student_addresses (student_id, location_id, address_label, delivery_address, notes, is_default)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [studentId, location_id || null, address_label, delivery_address, notes || null, defaultFlag]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create address: ${error.message}`);
    }
  }

  /**
   * Update an existing address
   */
  static async updateAddress(studentId, addressId, addressData) {
    try {
      // First verify the address belongs to the student
      const addressCheck = await db.query(
        'SELECT id FROM student_addresses WHERE id = $1 AND student_id = $2',
        [addressId, studentId]
      );

      if (addressCheck.rows.length === 0) {
        throw new Error('Address not found or you do not have permission to update it');
      }

      const { location_id, address_label, delivery_address, notes, is_default, latitude, longitude } = addressData;

      // Build dynamic update query
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (location_id !== undefined) {
        if (location_id) {
          const locationCheck = await db.query(
            'SELECT id FROM locations WHERE id = $1',
            [location_id]
          );
          if (locationCheck.rows.length === 0) {
            throw new Error('Invalid location ID');
          }
        }
        updates.push(`location_id = $${paramCount++}`);
        params.push(location_id || null);
      }

      if (address_label !== undefined) {
        updates.push(`address_label = $${paramCount++}`);
        params.push(address_label);
      }

      if (delivery_address !== undefined) {
        updates.push(`delivery_address = $${paramCount++}`);
        params.push(delivery_address);
      }

      if (notes !== undefined) {
        updates.push(`notes = $${paramCount++}`);
        params.push(notes);
      }

      if (latitude !== undefined) {
        updates.push(`latitude = $${paramCount++}`);
        params.push(latitude || null);
      }

      if (longitude !== undefined) {
        updates.push(`longitude = $${paramCount++}`);
        params.push(longitude || null);
      }

      if (is_default !== undefined && is_default) {
        // Remove default flag from other addresses
        await db.query(
          'UPDATE student_addresses SET is_default = FALSE WHERE student_id = $1',
          [studentId]
        );
        updates.push(`is_default = $${paramCount++}`);
        params.push(true);
      } else if (is_default === false) {
        updates.push(`is_default = $${paramCount++}`);
        params.push(false);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      params.push(addressId);
      params.push(studentId);

      const query = `
        UPDATE student_addresses
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND student_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update address: ${error.message}`);
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(studentId, addressId) {
    try {
      const result = await db.query(
        `DELETE FROM student_addresses
         WHERE id = $1 AND student_id = $2
         RETURNING *`,
        [addressId, studentId]
      );

      if (result.rows.length === 0) {
        throw new Error('Address not found or you do not have permission to delete it');
      }

      // If deleted address was default, unset default flag
      const wasDefault = result.rows[0].is_default;
      if (wasDefault) {
        // Set the first remaining address as default if any exist
        await db.query(
          `UPDATE student_addresses
           SET is_default = TRUE
           WHERE student_id = $1 AND is_default = FALSE
           ORDER BY created_at ASC
           LIMIT 1`,
          [studentId]
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to delete address: ${error.message}`);
    }
  }

  /**
   * Set an address as default
   */
  static async setDefaultAddress(studentId, addressId) {
    try {
      // Verify the address belongs to the student
      const addressCheck = await db.query(
        'SELECT id FROM student_addresses WHERE id = $1 AND student_id = $2',
        [addressId, studentId]
      );

      if (addressCheck.rows.length === 0) {
        throw new Error('Address not found or you do not have permission to update it');
      }

      // Remove default flag from all other addresses
      await db.query(
        'UPDATE student_addresses SET is_default = FALSE WHERE student_id = $1',
        [studentId]
      );

      // Set this address as default
      const result = await db.query(
        `UPDATE student_addresses
         SET is_default = TRUE, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [addressId]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to set default address: ${error.message}`);
    }
  }

  /**
   * Validate that a location exists
   */
  static async validateAddressAgainstLocations(locationId) {
    try {
      const result = await db.query(
        'SELECT id, name FROM locations WHERE id = $1',
        [locationId]
      );

      if (result.rows.length === 0) {
        return { valid: false, message: 'Location not found' };
      }

      return { valid: true, location: result.rows[0] };
    } catch (error) {
      throw new Error(`Failed to validate location: ${error.message}`);
    }
  }

  /**
   * Get all locations (for dropdown/selection)
   * Filters to only show delivery-relevant locations (hostels, dormitories, buildings, landmarks, staff_quarters)
   * Excludes internal locations (merchants, depot, offices)
   */
  static async getAllLocations() {
    try {
      const result = await db.query(
        `SELECT id, name, latitude, longitude, type
         FROM locations
         WHERE type IN ('hostel', 'dormitory', 'building', 'landmark', 'staff_quarters')
         ORDER BY
           CASE type
             WHEN 'hostel' THEN 1
             WHEN 'dormitory' THEN 2
             WHEN 'building' THEN 3
             WHEN 'staff_quarters' THEN 4
             WHEN 'landmark' THEN 5
           END,
           name ASC`
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }
  }
}

module.exports = DeliveryAddressService;
