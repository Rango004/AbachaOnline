/**
 * Comprehensive Database Migration for Railway PostgreSQL
 * Fixes ALL schema mismatches and missing columns
 */

const { Pool } = require('pg');
require('dotenv').config();

// Get Railway PostgreSQL connection from environment or command line
const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: No database connection string provided');
  console.log('\nUsage:');
  console.log('  node run-migration.js "postgresql://user:pass@host:port/database"');
  console.log('\nOr set DATABASE_URL in your .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const migration = `
-- ==============================================
-- 1. FIX SYSTEM_SETTINGS TABLE
-- ==============================================
-- The table might have 'key' column but services expect 'setting_key'

-- Create table if it doesn't exist with correct columns
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  updated_by INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- If table exists with 'key' column instead of 'setting_key', rename it
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'key'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'setting_key'
  ) THEN
    ALTER TABLE system_settings RENAME COLUMN key TO setting_key;
  END IF;
END $$;

-- If table has 'value' column instead of 'setting_value', rename it
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'value'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'setting_value'
  ) THEN
    ALTER TABLE system_settings RENAME COLUMN value TO setting_value;
  END IF;
END $$;

-- Add missing columns to system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_by INT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default settings if they don't exist
INSERT INTO system_settings (setting_key, setting_value, description, category)
VALUES
  ('rider_delivery_fee', '5000', 'Commission/fee paid to riders per delivery in Leone (Le)', 'pricing'),
  ('platform_commission', '10', 'Platform commission percentage on each order', 'pricing'),
  ('min_order_amount', '10000', 'Minimum order amount in Leone (Le)', 'pricing'),
  ('max_delivery_distance', '10', 'Maximum delivery distance in kilometers', 'delivery')
ON CONFLICT (setting_key) DO NOTHING;

-- ==============================================
-- 2. FIX CONVERSATIONS TABLE
-- ==============================================
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

-- Create unique constraint if it doesn't exist
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

-- Fix foreign key constraint on chat_messages
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_messages_conversation_id_fkey'
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_conversation_id_fkey;
  END IF;

  ALTER TABLE chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- ==============================================
-- 3. FIX WEBSOCKET TABLES
-- ==============================================

-- Create websocket_sessions if not exists
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

-- Create websocket_events with correct columns
CREATE TABLE IF NOT EXISTS websocket_events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(100),
  room VARCHAR(100),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fix websocket_events: rename event_data to data if needed
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websocket_events' AND column_name = 'event_data'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websocket_events' AND column_name = 'data'
  ) THEN
    ALTER TABLE websocket_events RENAME COLUMN event_data TO data;
  END IF;
END $$;

-- Add missing columns to websocket_events
ALTER TABLE websocket_events ADD COLUMN IF NOT EXISTS event_name VARCHAR(100);
ALTER TABLE websocket_events ADD COLUMN IF NOT EXISTS room VARCHAR(100);
ALTER TABLE websocket_events ADD COLUMN IF NOT EXISTS data JSONB;

-- Create websocket_pending_messages with correct columns
CREATE TABLE IF NOT EXISTS websocket_pending_messages (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  is_delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

-- Fix websocket_pending_messages: rename columns if needed
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websocket_pending_messages' AND column_name = 'message_data'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websocket_pending_messages' AND column_name = 'data'
  ) THEN
    ALTER TABLE websocket_pending_messages RENAME COLUMN message_data TO data;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websocket_pending_messages' AND column_name = 'delivered'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websocket_pending_messages' AND column_name = 'is_delivered'
  ) THEN
    ALTER TABLE websocket_pending_messages RENAME COLUMN delivered TO is_delivered;
  END IF;
END $$;

-- Add missing columns
ALTER TABLE websocket_pending_messages ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT FALSE;
ALTER TABLE websocket_pending_messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- ==============================================
-- 4. FIX CHAT_MESSAGES TABLE
-- ==============================================
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(50) DEFAULT 'text';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- ==============================================
-- 5. FIX CHATBOT TABLES
-- ==============================================
ALTER TABLE chatbot_sessions ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb;
ALTER TABLE chatbot_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE chatbot_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW();

ALTER TABLE chatbot_messages ADD COLUMN IF NOT EXISTS intent VARCHAR(100);
ALTER TABLE chatbot_messages ADD COLUMN IF NOT EXISTS confidence DECIMAL(5, 4);

-- Update existing sessions to have context
UPDATE chatbot_sessions SET context = '{}'::jsonb WHERE context IS NULL;

-- ==============================================
-- 6. FIX USERS TABLE
-- ==============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- ==============================================
-- 7. FIX ORDERS TABLE
-- ==============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP;

-- ==============================================
-- 8. CREATE MISSING TABLES
-- ==============================================

-- Order status history for audit trail
DROP TABLE IF EXISTS order_status_history;
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Merchant balances
CREATE TABLE IF NOT EXISTS merchant_balances (
  id SERIAL PRIMARY KEY,
  merchant_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  last_payout_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Merchant transactions
CREATE TABLE IF NOT EXISTS merchant_transactions (
  id SERIAL PRIMARY KEY,
  merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2),
  reference_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rider current location
CREATE TABLE IF NOT EXISTS rider_current_location (
  rider_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy DECIMAL(8,2),
  heading DECIMAL(5,2),
  speed DECIMAL(8,2),
  is_online BOOLEAN DEFAULT false,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 10. FIX PRODUCTS TABLE
-- ==============================================
-- Add images column to products table for product galleries
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- Update existing products to have a non-null empty array
UPDATE products SET images = '[]' WHERE images IS NULL;


-- ==============================================
-- 9. CREATE INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_user_id ON websocket_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_socket_id ON websocket_sessions(socket_id);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_is_active ON websocket_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_websocket_events_user_id ON websocket_events(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_events_event_type ON websocket_events(event_type);

CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_user_id ON websocket_pending_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_is_delivered ON websocket_pending_messages(is_delivered);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_customer_active ON chatbot_sessions(customer_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session ON chatbot_messages(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_transactions_merchant ON merchant_transactions(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
`;

async function runMigration() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully\n');

    console.log('Running comprehensive migration...');
    console.log('This will fix ALL known schema issues:\n');
    console.log('  - system_settings: key -> setting_key, value -> setting_value');
    console.log('  - conversations: create table and fix foreign keys');
    console.log('  - websocket_events: event_data -> data, add missing columns');
    console.log('  - websocket_pending_messages: fix column names');
    console.log('  - chat_messages: add message_metadata and other columns');
    console.log('  - chatbot_sessions/messages: add missing columns');
    console.log('  - users: add is_active, email');
    console.log('  - orders: add picked_up_at');
    console.log('  - products: add images column');
    console.log('  - Create missing tables: order_status_history, merchant_balances, etc.');
    console.log('');

    await client.query(migration);

    console.log('Migration completed successfully!\n');

    // Verify critical tables
    console.log('Verifying critical tables...\n');

    const systemSettings = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'system_settings'
      ORDER BY ordinal_position
    `);
    console.log('system_settings columns:', systemSettings.rows.map(r => r.column_name).join(', '));

    const websocketEvents = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'websocket_events'
      ORDER BY ordinal_position
    `);
    console.log('websocket_events columns:', websocketEvents.rows.map(r => r.column_name).join(', '));

    const conversations = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `);
    console.log('conversations columns:', conversations.rows.map(r => r.column_name).join(', '));

    console.log('\nAll done! You can now use all features.');

    client.release();
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
