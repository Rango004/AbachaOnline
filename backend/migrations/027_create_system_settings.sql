-- Migration: Create system_settings table for admin configuration
-- Stores application-wide settings

CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Add comments
COMMENT ON TABLE system_settings IS 'Application-wide configuration settings';
COMMENT ON COLUMN system_settings.key IS 'Unique setting identifier';
COMMENT ON COLUMN system_settings.value IS 'Setting value (can be JSON for complex settings)';
COMMENT ON COLUMN system_settings.category IS 'Setting category for organization';

-- Insert default settings
INSERT INTO system_settings (key, value, description, category) VALUES
    ('platform_name', 'AbachaOnline', 'Platform display name', 'general'),
    ('delivery_fee_base', '500', 'Base delivery fee in local currency', 'pricing'),
    ('delivery_fee_per_km', '100', 'Additional fee per kilometer', 'pricing'),
    ('min_order_amount', '1000', 'Minimum order amount', 'pricing'),
    ('max_delivery_radius_km', '10', 'Maximum delivery radius in kilometers', 'delivery'),
    ('estimated_delivery_minutes', '45', 'Default estimated delivery time', 'delivery'),
    ('merchant_commission_percent', '10', 'Platform commission percentage from merchants', 'pricing'),
    ('rider_pay_per_delivery', '200', 'Base pay per delivery for riders', 'pricing'),
    ('support_phone', '+23276424149', 'Customer support phone number', 'contact'),
    ('support_email', 'support@abachaonline.com', 'Customer support email', 'contact'),
    ('maintenance_mode', 'false', 'Enable maintenance mode', 'system'),
    ('registration_enabled', 'true', 'Allow new user registrations', 'system')
ON CONFLICT (key) DO NOTHING;
