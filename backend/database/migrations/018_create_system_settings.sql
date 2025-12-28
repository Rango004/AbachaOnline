-- Create system_settings table for configurable application settings
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value DECIMAL(10, 2) DEFAULT 50,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id)
);

-- Insert default rider commission rate
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('rider_delivery_fee', 50, 'Commission/fee paid to riders per delivery in Leone (Le)')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Add comment
COMMENT ON TABLE system_settings IS 'Stores system-wide configuration settings like rider commission rates';
