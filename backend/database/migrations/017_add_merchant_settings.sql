-- Add merchant_settings column to users table for storing merchant configuration
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_settings JSONB DEFAULT NULL;

-- Create index for merchant settings queries
CREATE INDEX IF NOT EXISTS idx_users_merchant_settings ON users USING gin(merchant_settings);

-- Comment for clarity
COMMENT ON COLUMN users.merchant_settings IS 'Stores merchant-specific settings including bank_account, location, and business_hours';
