/**
 * Run Database Migration for Railway PostgreSQL
 * Adds missing columns to chatbot_sessions table
 */

const { Pool } = require('pg');
require('dotenv').config();

// Get Railway PostgreSQL connection from environment or command line
const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: No database connection string provided');
  console.log('\nUsage:');
  console.log('  node run-migration.js "postgresql://user:pass@host:port/database"');
  console.log('\nOr set DATABASE_URL in your .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const migration = `
-- ==============================================
-- FIX CONVERSATIONS TABLE NAMING
-- ==============================================

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  customer_unread_count INT DEFAULT 0,
  merchant_unread_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create unique constraint if it doesn't exist (ignore error if exists)
DO $$ BEGIN
  ALTER TABLE conversations ADD CONSTRAINT unique_conversation
    UNIQUE(customer_id, merchant_id, product_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_merchant ON conversations(merchant_id, last_message_at DESC);

-- If chat_conversations exists but conversations doesn't have the data, copy it
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
    INSERT INTO conversations (id, customer_id, merchant_id, product_id, last_message_at, created_at)
    SELECT id, customer_id, merchant_id, product_id, last_message_at, created_at
    FROM chat_conversations
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Fix foreign key constraint on chat_messages to reference conversations instead of chat_conversations
DO $$ BEGIN
  -- Drop the incorrect foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_messages_conversation_id_fkey'
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_conversation_id_fkey;
  END IF;

  -- Add the correct foreign key
  ALTER TABLE chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- ==============================================
-- WEBSOCKET TABLES (from 010_create_websocket_sessions.sql)
-- ==============================================

-- Create table for tracking WebSocket connections
CREATE TABLE IF NOT EXISTS websocket_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  socket_id VARCHAR(255) UNIQUE NOT NULL,
  session_token VARCHAR(500),
  user_role VARCHAR(50),
  connected_at TIMESTAMP DEFAULT NOW(),
  last_heartbeat TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  client_type VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create table for tracking WebSocket events
CREATE TABLE IF NOT EXISTS websocket_events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  room VARCHAR(100),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create table for storing pending messages (for offline clients)
CREATE TABLE IF NOT EXISTS websocket_pending_messages (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  is_delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

-- Add missing columns to websocket_pending_messages if table already exists
ALTER TABLE websocket_pending_messages
ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- ==============================================
-- CHATBOT SCHEMA FIXES (from 027_fix_chatbot_schema.sql)
-- ==============================================

-- Add missing columns to chatbot_sessions table
ALTER TABLE chatbot_sessions
ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW();

-- Ensure all columns exist in chatbot_messages
ALTER TABLE chatbot_messages
ADD COLUMN IF NOT EXISTS intent VARCHAR(100),
ADD COLUMN IF NOT EXISTS confidence DECIMAL(3, 2);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- WebSocket session indexes
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_user_id ON websocket_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_socket_id ON websocket_sessions(socket_id);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_is_active ON websocket_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_last_heartbeat ON websocket_sessions(last_heartbeat);

-- WebSocket event indexes
CREATE INDEX IF NOT EXISTS idx_websocket_events_user_id ON websocket_events(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_events_event_type ON websocket_events(event_type);
CREATE INDEX IF NOT EXISTS idx_websocket_events_created_at ON websocket_events(created_at DESC);

-- WebSocket pending message indexes
CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_user_id ON websocket_pending_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_is_delivered ON websocket_pending_messages(is_delivered);
CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_created_at ON websocket_pending_messages(created_at DESC);

-- Chatbot session indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_customer_active ON chatbot_sessions(customer_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session ON chatbot_messages(session_id, created_at DESC);

-- ==============================================
-- CHAT MESSAGES SCHEMA FIXES
-- ==============================================

-- Add missing message_metadata column to chat_messages
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS message_metadata JSONB DEFAULT '{}'::jsonb;

-- Add other potentially missing columns to chat_messages
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

-- Update existing sessions to have context
UPDATE chatbot_sessions SET context = '{}'::jsonb WHERE context IS NULL;

-- ==============================================
-- ADMIN SETTINGS TABLE FIX
-- ==============================================

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default settings if they don't exist
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
  ('rider_delivery_fee', '5000', 'Commission/fee paid to riders per delivery in Leone (Le)'),
  ('platform_commission', '10', 'Platform commission percentage on each order'),
  ('min_order_amount', '10000', 'Minimum order amount in Leone (Le)'),
  ('max_delivery_distance', '10', 'Maximum delivery distance in kilometers')
ON CONFLICT (setting_key) DO NOTHING;
`;

async function runMigration() {
  try {
    console.log('🔌 Connecting to database...');
    await pool.connect();
    console.log('✅ Connected successfully\n');

    console.log('🔄 Running migration...');
    await pool.query(migration);
    console.log('✅ Migration completed successfully\n');

    console.log('📋 Verifying columns...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'chatbot_sessions'
      ORDER BY ordinal_position;
    `);

    console.log('\nChatbot Sessions Table Schema:');
    console.table(result.rows);

    console.log('\n✅ All done! You can now use the chatbot.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
