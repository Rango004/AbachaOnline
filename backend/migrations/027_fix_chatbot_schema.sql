-- Migration: Fix Chatbot Schema for Railway
-- This adds missing columns that exist in local but not on Railway

-- Add missing context column to chatbot_sessions if it doesn't exist
ALTER TABLE chatbot_sessions
ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb;

-- Add is_active column if missing
ALTER TABLE chatbot_sessions
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add last_activity column if missing
ALTER TABLE chatbot_sessions
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW();

-- Ensure all columns exist in chatbot_messages
ALTER TABLE chatbot_messages
ADD COLUMN IF NOT EXISTS intent VARCHAR(100),
ADD COLUMN IF NOT EXISTS confidence DECIMAL(3, 2);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_customer_active
ON chatbot_sessions(customer_id, is_active)
WHERE is_active = true;

-- Create index for message lookups
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session
ON chatbot_messages(session_id, created_at DESC);

-- Update existing sessions to have context
UPDATE chatbot_sessions
SET context = '{}'::jsonb
WHERE context IS NULL;
