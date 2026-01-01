-- Migration: Add missing columns for orders and chatbot_sessions
-- Fixes missing tracking_number on orders and ensures chatbot_sessions has is_active

-- Add tracking_number to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50);

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN orders.tracking_number IS 'Unique tracking number for order delivery tracking';

-- Ensure chatbot_sessions table exists with is_active column
-- First check if the table exists
DO $$
BEGIN
    -- If chatbot_sessions doesn't exist, create it
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'chatbot_sessions') THEN
        CREATE TABLE chatbot_sessions (
            id SERIAL PRIMARY KEY,
            customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            context JSONB,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW(),
            last_activity TIMESTAMP DEFAULT NOW(),
            ended_at TIMESTAMP
        );

        CREATE INDEX idx_chatbot_sessions_customer ON chatbot_sessions(customer_id, is_active);
        CREATE INDEX idx_chatbot_sessions_active ON chatbot_sessions(is_active, last_activity DESC);
        CREATE INDEX idx_chatbot_sessions_session_id ON chatbot_sessions(session_id);
    ELSE
        -- If table exists but is_active column doesn't, add it
        IF NOT EXISTS (SELECT FROM information_schema.columns
                      WHERE table_name = 'chatbot_sessions' AND column_name = 'is_active') THEN
            ALTER TABLE chatbot_sessions ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
    END IF;
END
$$;
