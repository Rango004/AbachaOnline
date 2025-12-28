-- Create holidays_events table for calendar-based impact on sales
CREATE TABLE IF NOT EXISTS holidays_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  end_date DATE, -- For multi-day events
  category VARCHAR(50) NOT NULL, -- 'holiday', 'exam_season', 'event', 'custom'
  country VARCHAR(100) DEFAULT 'Sierra Leone',
  impact_factor NUMERIC(5, 2) DEFAULT 1.0, -- 1.0 = no impact, 0.8 = -20%, 1.3 = +30%
  description TEXT,
  applies_to_categories VARCHAR(255), -- JSON array of product categories affected
  is_recurring BOOLEAN DEFAULT FALSE, -- For yearly holidays
  recurring_month INTEGER, -- Month for recurring holidays (1-12)
  recurring_day INTEGER, -- Day for recurring holidays (1-31)
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_holidays_events_date ON holidays_events(event_date);
CREATE INDEX idx_holidays_events_category ON holidays_events(category);
CREATE INDEX idx_holidays_events_country ON holidays_events(country);

-- Insert predefined holidays for Sierra Leone
INSERT INTO holidays_events (event_name, event_date, category, impact_factor, description, is_recurring, recurring_month, recurring_day) VALUES
  ('New Year Day', '2024-01-01', 'holiday', 0.6, 'Public holiday - reduced business activity', true, 1, 1),
  ('Independence Day', '2024-04-27', 'holiday', 1.4, 'Public holiday - increased celebration and gatherings', true, 4, 27),
  ('Christmas Day', '2024-12-25', 'holiday', 1.5, 'Major holiday - high demand for beverages and snacks', true, 12, 25),
  ('Boxing Day', '2024-12-26', 'holiday', 1.3, 'Post-Christmas shopping continues', true, 12, 26),
  ('Good Friday', '2024-03-29', 'holiday', 0.8, 'Religious holiday - reduced activity', false, null, null),
  ('Easter Monday', '2024-04-01', 'holiday', 1.2, 'Easter celebration period', false, null, null);

-- Insert exam seasons (high demand for snacks, energy drinks, stationery)
INSERT INTO holidays_events (event_name, event_date, end_date, category, impact_factor, description, applies_to_categories, is_recurring, recurring_month, recurring_day) VALUES
  ('First Semester Exams', '2024-05-01', '2024-06-30', 'exam_season', 1.4, 'WAEC and School exams - High demand for snacks, drinks, stationery', '["stationery", "drinks", "food"]', true, 5, 1),
  ('Second Semester Exams', '2024-11-01', '2024-12-20', 'exam_season', 1.5, 'Final exams before Christmas - Peak demand for food and drinks', '["stationery", "drinks", "food"]', true, 11, 1);

-- Alter table to add merchant-specific event settings
CREATE TABLE IF NOT EXISTS merchant_event_overrides (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES holidays_events(id) ON DELETE CASCADE,
  custom_impact_factor NUMERIC(5, 2),
  is_applicable BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(merchant_id, event_id)
);

CREATE INDEX idx_merchant_event_overrides_merchant ON merchant_event_overrides(merchant_id);
CREATE INDEX idx_merchant_event_overrides_event ON merchant_event_overrides(event_id);
