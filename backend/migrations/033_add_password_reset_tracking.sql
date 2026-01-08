-- Migration: Add password reset tracking columns
-- Purpose: Track temporary passwords and enforce first-login password changes
-- Date: 2026-01-09

-- Add password reset tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;

-- Add index for password reset queries
CREATE INDEX IF NOT EXISTS idx_users_password_reset_required
  ON users(password_reset_required) WHERE password_reset_required = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN users.password_reset_required IS 'Forces user to change password on next login (for temporary passwords)';
COMMENT ON COLUMN users.temp_password_expires_at IS 'Expiration timestamp for temporary passwords (typically 7 days)';
COMMENT ON COLUMN users.last_password_change IS 'Timestamp of last password/PIN change';

SELECT 'Password reset tracking columns added to users table' AS status;
