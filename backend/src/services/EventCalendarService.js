const db = require('../config/database');

class EventCalendarService {
  /**
   * Get all upcoming events for the next 30 days
   * @param {Number} daysAhead - Number of days to look ahead (default: 30)
   * @returns {Promise<Array>} - Array of event objects
   */
  async getUpcomingEvents(daysAhead = 30) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const result = await db.query(
        `SELECT
          id,
          event_name as name,
          event_date as date,
          end_date,
          category,
          impact_factor,
          description,
          applies_to_categories,
          is_recurring
        FROM holidays_events
        WHERE event_date BETWEEN CURRENT_DATE AND $1
          OR (is_recurring = true AND EXTRACT(MONTH FROM event_date) = EXTRACT(MONTH FROM CURRENT_DATE))
        ORDER BY event_date ASC`,
        [endDate]
      );

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        date: row.date,
        end_date: row.end_date,
        category: row.category,
        impact_factor: parseFloat(row.impact_factor),
        description: row.description,
        applies_to_categories: row.applies_to_categories ? JSON.parse(row.applies_to_categories) : [],
        is_recurring: row.is_recurring
      }));
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  }

  /**
   * Get events for a specific date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>}
   */
  async getEventsByDateRange(startDate, endDate) {
    try {
      const result = await db.query(
        `SELECT
          id,
          event_name as name,
          event_date as date,
          end_date,
          category,
          impact_factor,
          description
        FROM holidays_events
        WHERE event_date BETWEEN $1 AND $2
        ORDER BY event_date ASC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get events by category
   * @param {String} category - 'holiday', 'exam_season', 'event', 'custom'
   * @returns {Promise<Array>}
   */
  async getEventsByCategory(category) {
    try {
      const result = await db.query(
        `SELECT
          id,
          event_name as name,
          event_date as date,
          impact_factor,
          description,
          is_recurring
        FROM holidays_events
        WHERE category = $1
        ORDER BY event_date ASC`,
        [category]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get relevant events for forecasting
   * Includes upcoming events and exam seasons
   * @param {Number} daysAhead - Days to look ahead
   * @returns {Promise<Array>}
   */
  async getRelevantEvents(daysAhead = 30) {
    try {
      const events = await this.getUpcomingEvents(daysAhead);

      // Format for Prophet
      return events.map(event => ({
        date: event.date.toISOString().split('T')[0],
        name: event.name,
        impact_factor: event.impact_factor,
        days_before: event.category === 'exam_season' ? 5 : 2,
        days_after: event.category === 'exam_season' ? 30 : 3,
        category: event.category
      }));
    } catch (error) {
      console.error('Error getting relevant events:', error);
      throw error;
    }
  }

  /**
   * Add a custom event for a merchant
   * @param {Number} merchantId
   * @param {Object} eventData - {event_name, event_date, impact_factor, applies_to_categories}
   * @returns {Promise<Object>}
   */
  async addMerchantEvent(merchantId, eventData) {
    try {
      // First insert into holidays_events if it doesn't exist
      const existingEvent = await db.query(
        `SELECT id FROM holidays_events
         WHERE event_name = $1 AND event_date = $2`,
        [eventData.event_name, eventData.event_date]
      );

      let eventId;
      if (existingEvent.rows.length === 0) {
        const insertResult = await db.query(
          `INSERT INTO holidays_events
           (event_name, event_date, category, impact_factor, applies_to_categories)
           VALUES ($1, $2, 'custom', $3, $4)
           RETURNING id`,
          [
            eventData.event_name,
            eventData.event_date,
            eventData.impact_factor || 1.0,
            JSON.stringify(eventData.applies_to_categories || [])
          ]
        );
        eventId = insertResult.rows[0].id;
      } else {
        eventId = existingEvent.rows[0].id;
      }

      // Add merchant-specific override if needed
      if (eventData.custom_impact_factor) {
        await db.query(
          `INSERT INTO merchant_event_overrides
           (merchant_id, event_id, custom_impact_factor, is_applicable)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (merchant_id, event_id) DO UPDATE
           SET custom_impact_factor = EXCLUDED.custom_impact_factor,
               updated_at = CURRENT_TIMESTAMP`,
          [merchantId, eventId, eventData.custom_impact_factor]
        );
      }

      return { event_id: eventId, message: 'Event added successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Override event impact factor for a specific merchant
   * @param {Number} merchantId
   * @param {Number} eventId
   * @param {Number} customImpactFactor
   * @returns {Promise<Object>}
   */
  async setMerchantEventOverride(merchantId, eventId, customImpactFactor) {
    try {
      await db.query(
        `INSERT INTO merchant_event_overrides
         (merchant_id, event_id, custom_impact_factor, is_applicable)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (merchant_id, event_id) DO UPDATE
         SET custom_impact_factor = EXCLUDED.custom_impact_factor`,
        [merchantId, eventId, customImpactFactor]
      );

      return { message: 'Event override set successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get merchant's event overrides
   * @param {Number} merchantId
   * @returns {Promise<Array>}
   */
  async getMerchantEventOverrides(merchantId) {
    try {
      const result = await db.query(
        `SELECT
          he.id,
          he.event_name as name,
          he.event_date as date,
          he.impact_factor as default_impact,
          meo.custom_impact_factor as merchant_impact,
          meo.is_applicable
        FROM holidays_events he
        LEFT JOIN merchant_event_overrides meo ON he.id = meo.event_id
          AND meo.merchant_id = $1
        WHERE meo.merchant_id = $1`,
        [merchantId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get impact-adjusted event for a merchant
   * Takes into account merchant-specific overrides
   * @param {Number} merchantId
   * @param {Number} eventId
   * @returns {Promise<Object>}
   */
  async getMerchantEventWithImpact(merchantId, eventId) {
    try {
      const result = await db.query(
        `SELECT
          he.id,
          he.event_name as name,
          he.event_date as date,
          he.impact_factor as default_impact,
          COALESCE(meo.custom_impact_factor, he.impact_factor) as effective_impact,
          he.category,
          he.applies_to_categories
        FROM holidays_events he
        LEFT JOIN merchant_event_overrides meo ON he.id = meo.event_id
          AND meo.merchant_id = $1
        WHERE he.id = $2`,
        [merchantId, eventId]
      );

      if (result.rows.length === 0) {
        throw new Error('Event not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get major events for Sierra Leone context
   * @returns {Promise<Array>}
   */
  async getMajorEventsContext() {
    try {
      const majorEvents = [
        {
          name: 'New Year',
          month: 1,
          day: 1,
          impact: 0.6,
          description: 'Reduced business activity'
        },
        {
          name: 'Independence Day',
          month: 4,
          day: 27,
          impact: 1.4,
          description: 'National celebration - high demand for beverages and snacks'
        },
        {
          name: 'First Semester Exams',
          month: 5,
          day: 1,
          impact: 1.4,
          description: 'WAEC and School exams - high demand for snacks, drinks, stationery'
        },
        {
          name: 'Christmas',
          month: 12,
          day: 25,
          impact: 1.5,
          description: 'Major holiday - peak demand for beverages and food'
        },
        {
          name: 'Exam Season (Nov-Dec)',
          month: 11,
          day: 1,
          impact: 1.5,
          description: 'Final exams - peak demand for food, drinks, and stationery'
        }
      ];

      return majorEvents;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EventCalendarService();
