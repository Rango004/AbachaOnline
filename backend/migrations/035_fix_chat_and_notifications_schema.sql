-- Migration 035: Fix Chat and Notifications Schema
-- Fixes schema mismatches between code expectations and actual database tables

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
  END IF;
END $$;

-- =====================================================
-- 2. HANDLE chat_conversations -> conversations MIGRATION
-- =====================================================
-- Check if chat_conversations exists and conversations doesn't
DO $$
BEGIN
  -- If chat_conversations exists but conversations doesn't, rename it
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    ALTER TABLE chat_conversations RENAME TO conversations;
    RAISE NOTICE 'Renamed chat_conversations to conversations';
  -- If both exist, migrate data from chat_conversations to conversations
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    -- Data migration would go here if needed
    RAISE NOTICE 'Both tables exist - conversations table will be used';
  END IF;
END $$;

-- =====================================================
-- 3. ADD MISSING COLUMNS TO CONVERSATIONS TABLE
-- =====================================================
DO $$
BEGIN
  -- Add customer_unread_count if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'conversations' AND column_name = 'customer_unread_count'
     ) THEN
    ALTER TABLE conversations ADD COLUMN customer_unread_count INT DEFAULT 0;
    RAISE NOTICE 'Added customer_unread_count column to conversations table';
  END IF;

  -- Add merchant_unread_count if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'conversations' AND column_name = 'merchant_unread_count'
     ) THEN
    ALTER TABLE conversations ADD COLUMN merchant_unread_count INT DEFAULT 0;
    RAISE NOTICE 'Added merchant_unread_count column to conversations table';
  END IF;

  -- Add last_message_at if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'conversations' AND column_name = 'last_message_at'
     ) THEN
    ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added last_message_at column to conversations table';
  END IF;
END $$;

-- =====================================================
-- 4. FIX CHAT_MESSAGES TABLE COLUMNS
-- =====================================================
DO $$
BEGIN
  -- Add read_at column if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'chat_messages' AND column_name = 'read_at'
     ) THEN
    ALTER TABLE chat_messages ADD COLUMN read_at TIMESTAMP;
    RAISE NOTICE 'Added read_at column to chat_messages table';
  END IF;

  -- Handle metadata -> message_metadata rename
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages')
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'chat_messages' AND column_name = 'metadata'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'chat_messages' AND column_name = 'message_metadata'
     ) THEN
    ALTER TABLE chat_messages RENAME COLUMN metadata TO message_metadata;
    RAISE NOTICE 'Renamed metadata to message_metadata in chat_messages table';
  END IF;

  -- Add message_metadata if neither exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'chat_messages' AND column_name = 'message_metadata'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'chat_messages' AND column_name = 'metadata'
     ) THEN
    ALTER TABLE chat_messages ADD COLUMN message_metadata JSONB DEFAULT '{}';
    RAISE NOTICE 'Added message_metadata column to chat_messages table';
  END IF;

  -- Add is_deleted if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'chat_messages' AND column_name = 'is_deleted'
     ) THEN
    ALTER TABLE chat_messages ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_deleted column to chat_messages table';
  END IF;

  -- Add message_type if missing
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'chat_messages' AND column_name = 'message_type'
     ) THEN
    ALTER TABLE chat_messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';
    RAISE NOTICE 'Added message_type column to chat_messages table';
  END IF;
END $$;

-- =====================================================
-- 5. CREATE INDEXES IF MISSING
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notifications_data ON notifications USING GIN (data) WHERE data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_merchant ON conversations(merchant_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = FALSE;

-- =====================================================
-- 6. CREATE/REPLACE TRIGGERS FOR UNREAD COUNTS
-- =====================================================
-- Trigger function to update unread counts on new message
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

-- Drop and recreate trigger to ensure it's attached correctly
DROP TRIGGER IF EXISTS trigger_update_unread_counts ON chat_messages;
CREATE TRIGGER trigger_update_unread_counts
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_unread_counts();

-- Trigger function to update last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's attached correctly
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON chat_messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration fixes:
-- 1. Missing 'data' JSONB column in notifications table
-- 2. chat_conversations -> conversations table rename
-- 3. Missing unread count columns in conversations
-- 4. Missing/renamed columns in chat_messages (read_at, message_metadata)
-- 5. Recreates triggers for unread count updates
-- =====================================================
