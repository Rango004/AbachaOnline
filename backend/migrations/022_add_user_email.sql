-- Add email column for account recovery
-- Email is optional but recommended for account recovery when OTP fails

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create unique index for non-null emails (allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL;

-- Add index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.email IS 'Optional email for account recovery via SendGrid';

SELECT 'Email column added to users table' AS status;
