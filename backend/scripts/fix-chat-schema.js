#!/usr/bin/env node
/**
 * Fix Chat and Notifications Schema Migration
 *
 * Run this script to fix schema mismatches between code and database.
 *
 * Usage:
 *   node scripts/fix-chat-schema.js
 *
 * On Railway:
 *   railway run node scripts/fix-chat-schema.js
 */

require('dotenv').config();
const { Pool } = require('pg');

// Create pool from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const migrationSQL = `
-- =====================================================
-- 1. FIX NOTIFICATIONS TABLE - ADD DATA COLUMN
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'data'
  ) THEN
    ALTER TABLE notifications ADD COLUMN data JSONB;
    RAISE NOTICE 'Added data column to notifications table';
  ELSE
    RAISE NOTICE 'data column already exists in notifications table';
  END IF;
END $$;

-- =====================================================
-- 2. HANDLE chat_conversations -> conversations MIGRATION
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    ALTER TABLE chat_conversations RENAME TO conversations;
    RAISE NOTICE 'Renamed chat_conversations to conversations';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    RAISE NOTICE 'Both tables exist - conversations table will be used';
  ELSE
    RAISE NOTICE 'conversations table exists or will be created';
  END IF;
END $$;

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES users(id) ON DELETE CASCADE,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  customer_unread_count INT DEFAULT 0,
  merchant_unread_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. ADD MISSING COLUMNS TO CONVERSATIONS TABLE
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'customer_unread_count'
  ) THEN
    ALTER TABLE conversations ADD COLUMN customer_unread_count INT DEFAULT 0;
    RAISE NOTICE 'Added customer_unread_count column to conversations table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'merchant_unread_count'
  ) THEN
    ALTER TABLE conversations ADD COLUMN merchant_unread_count INT DEFAULT 0;
    RAISE NOTICE 'Added merchant_unread_count column to conversations table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added last_message_at column to conversations table';
  END IF;
END $$;

-- =====================================================
-- 4. CREATE CHAT_MESSAGES TABLE IF NOT EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INT REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INT REFERENCES users(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  message_metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. FIX CHAT_MESSAGES TABLE COLUMNS
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN read_at TIMESTAMP;
    RAISE NOTICE 'Added read_at column to chat_messages table';
  END IF;

  -- Handle metadata -> message_metadata rename
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'metadata'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'message_metadata'
  ) THEN
    ALTER TABLE chat_messages RENAME COLUMN metadata TO message_metadata;
    RAISE NOTICE 'Renamed metadata to message_metadata in chat_messages table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'message_metadata'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN message_metadata JSONB DEFAULT '{}';
    RAISE NOTICE 'Added message_metadata column to chat_messages table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_deleted column to chat_messages table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'message_type'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN message_type VARCHAR(50) DEFAULT 'text';
    RAISE NOTICE 'Added message_type column to chat_messages table';
  END IF;
END $$;

-- =====================================================
-- 6. CREATE DEVICE_TOKENS TABLE IF MISSING
-- =====================================================
CREATE TABLE IF NOT EXISTS device_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. CREATE INDEXES IF MISSING
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notifications_data ON notifications USING GIN (data) WHERE data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_merchant ON conversations(merchant_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = FALSE;

-- =====================================================
-- 7. CREATE/REPLACE TRIGGERS FOR UNREAD COUNTS
-- =====================================================
CREATE OR REPLACE FUNCTION update_unread_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    customer_unread_count = CASE
      WHEN NEW.receiver_id = customer_id THEN customer_unread_count + 1
      ELSE customer_unread_count
    END,
    merchant_unread_count = CASE
      WHEN NEW.receiver_id = merchant_id THEN merchant_unread_count + 1
      ELSE merchant_unread_count
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_unread_counts ON chat_messages;
CREATE TRIGGER trigger_update_unread_counts
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_unread_counts();

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON chat_messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();
`;

async function runMigration() {
  console.log('='.repeat(60));
  console.log('Fix Chat and Notifications Schema Migration');
  console.log('='.repeat(60));

  const client = await pool.connect();

  try {
    console.log('\nConnected to database. Running migration...\n');

    await client.query(migrationSQL);

    console.log('\n' + '='.repeat(60));
    console.log('Migration completed successfully!');
    console.log('='.repeat(60));

    // Verify the schema
    console.log('\nVerifying schema...\n');

    // Check notifications.data column
    const notifCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = 'data'
    `);
    console.log('notifications.data column:', notifCheck.rows.length > 0 ? 'EXISTS' : 'MISSING');

    // Check conversations table
    const convCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `);
    console.log('conversations columns:', convCheck.rows.map(r => r.column_name).join(', '));

    // Check chat_messages table
    const msgCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'chat_messages'
      ORDER BY ordinal_position
    `);
    console.log('chat_messages columns:', msgCheck.rows.map(r => r.column_name).join(', '));

    // Check triggers
    const triggerCheck = await client.query(`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_table = 'chat_messages'
    `);
    console.log('chat_messages triggers:', triggerCheck.rows.map(r => r.trigger_name).join(', '));

    console.log('\n' + '='.repeat(60));
    console.log('Schema verification complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nMigration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
