-- Migration 017: Create Chat and Chatbot System Tables
-- Creates tables for merchant-customer direct messaging and RASA chatbot integration

-- =====================================================
-- 1. CONVERSATIONS TABLE
-- =====================================================
-- Stores merchant-customer conversation threads (can be product-specific)
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  customer_unread_count INT DEFAULT 0,
  merchant_unread_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_conversation UNIQUE(customer_id, merchant_id, product_id)
);

-- Indexes for fast conversation lookups
CREATE INDEX idx_conversations_customer ON conversations(customer_id, last_message_at DESC);
CREATE INDEX idx_conversations_merchant ON conversations(merchant_id, last_message_at DESC);
CREATE INDEX idx_conversations_product ON conversations(product_id) WHERE product_id IS NOT NULL;

COMMENT ON TABLE conversations IS 'Merchant-customer conversation threads, optionally linked to specific products';
COMMENT ON COLUMN conversations.customer_unread_count IS 'Number of unread messages for the customer';
COMMENT ON COLUMN conversations.merchant_unread_count IS 'Number of unread messages for the merchant';

-- =====================================================
-- 2. ENHANCED CHAT_MESSAGES TABLE
-- =====================================================
-- Drop existing minimal chat_messages table if it exists
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Create enhanced version with conversation support
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type VARCHAR(20) DEFAULT 'text',
  message_text TEXT,
  message_metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  CONSTRAINT check_message_type CHECK (message_type IN ('text', 'image', 'product_link', 'system'))
);

-- Indexes for fast message queries
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = FALSE AND is_deleted = FALSE;
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id, created_at DESC);

COMMENT ON TABLE chat_messages IS 'Individual chat messages within conversations';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: text, image, product_link, system';
COMMENT ON COLUMN chat_messages.message_metadata IS 'Additional data for images, product links, etc.';
COMMENT ON COLUMN chat_messages.is_deleted IS 'Soft delete flag - message hidden but preserved';

-- =====================================================
-- 3. CHATBOT_SESSIONS TABLE
-- =====================================================
-- Stores RASA chatbot sessions for customers
CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  context JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Indexes for session lookups
CREATE INDEX idx_chatbot_sessions_customer ON chatbot_sessions(customer_id, is_active);
CREATE INDEX idx_chatbot_sessions_active ON chatbot_sessions(is_active, last_activity DESC);
CREATE INDEX idx_chatbot_sessions_session_id ON chatbot_sessions(session_id);

COMMENT ON TABLE chatbot_sessions IS 'RASA chatbot conversation sessions for customers';
COMMENT ON COLUMN chatbot_sessions.session_id IS 'RASA sender_id used for conversation continuity';
COMMENT ON COLUMN chatbot_sessions.context IS 'Conversation context for state management';

-- =====================================================
-- 4. CHATBOT_MESSAGES TABLE
-- =====================================================
-- Stores chatbot conversation history
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL,
  message_text TEXT NOT NULL,
  intent VARCHAR(100),
  confidence DECIMAL(5,4),
  entities JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_sender CHECK (sender IN ('user', 'bot'))
);

-- Indexes for message history queries
CREATE INDEX idx_chatbot_messages_session ON chatbot_messages(session_id, created_at DESC);
CREATE INDEX idx_chatbot_messages_intent ON chatbot_messages(intent) WHERE intent IS NOT NULL;

COMMENT ON TABLE chatbot_messages IS 'Chat history between customers and RASA chatbot';
COMMENT ON COLUMN chatbot_messages.sender IS 'Message sender: user or bot';
COMMENT ON COLUMN chatbot_messages.intent IS 'RASA detected intent (e.g., check_order_status)';
COMMENT ON COLUMN chatbot_messages.confidence IS 'RASA intent confidence score (0-1)';
COMMENT ON COLUMN chatbot_messages.entities IS 'Extracted entities from the message';

-- =====================================================
-- 5. CHATBOT_FAQS TABLE
-- =====================================================
-- FAQ knowledge base for chatbot fallback
CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  intent VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  keywords TEXT[],
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for FAQ search
CREATE INDEX idx_chatbot_faqs_intent ON chatbot_faqs(intent);
CREATE INDEX idx_chatbot_faqs_category ON chatbot_faqs(category) WHERE category IS NOT NULL;
CREATE INDEX idx_chatbot_faqs_keywords ON chatbot_faqs USING GIN(keywords);
CREATE INDEX idx_chatbot_faqs_active ON chatbot_faqs(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE chatbot_faqs IS 'FAQ knowledge base for chatbot responses when RASA unavailable';
COMMENT ON COLUMN chatbot_faqs.keywords IS 'Array of keywords for text search matching';
COMMENT ON COLUMN chatbot_faqs.usage_count IS 'Number of times this FAQ has been used';

-- =====================================================
-- 6. SEED INITIAL FAQ DATA
-- =====================================================
INSERT INTO chatbot_faqs (question, answer, intent, category, keywords) VALUES
  (
    'How long does delivery take?',
    'Delivery typically takes 30-60 minutes within campus. You can track your order in real-time once a rider is assigned.',
    'ask_delivery_time',
    'delivery',
    ARRAY['delivery', 'time', 'how long', 'when', 'arrive']
  ),
  (
    'What payment methods do you accept?',
    'We accept Orange Money, Africell Money, and Cash on Delivery. Select your preferred payment method at checkout.',
    'ask_payment_methods',
    'payment',
    ARRAY['payment', 'pay', 'money', 'mobile money', 'cash']
  ),
  (
    'How do I request a refund?',
    'You can request a refund within 24 hours of delivery if the product is damaged or incorrect. Go to My Orders > Select Order > Request Refund.',
    'request_refund',
    'refunds',
    ARRAY['refund', 'return', 'money back', 'cancel']
  ),
  (
    'Where is my order?',
    'You can track your order by going to My Orders and clicking on the order. You will see the current status and rider location if assigned.',
    'check_order_status',
    'orders',
    ARRAY['order', 'track', 'where', 'status', 'location']
  ),
  (
    'How do I contact a merchant?',
    'Click on any product to view details, then click "Ask Merchant" to start a direct chat conversation.',
    'contact_merchant',
    'support',
    ARRAY['merchant', 'contact', 'message', 'talk', 'seller']
  ),
  (
    'Can I change my delivery location?',
    'Yes, you can update your delivery location in your profile settings before placing an order. You cannot change it after the order is confirmed.',
    'change_delivery_location',
    'delivery',
    ARRAY['change', 'location', 'address', 'delivery', 'update']
  ),
  (
    'What if my order is wrong or damaged?',
    'Take a photo of the issue and request a refund within 24 hours. Go to My Orders > Select Order > Request Refund. Upload the photo and describe the problem.',
    'complaint',
    'support',
    ARRAY['wrong', 'damaged', 'broken', 'problem', 'issue', 'complaint']
  ),
  (
    'How do I search for products?',
    'Use the search bar at the top of the Browse page. You can also filter by category, price range, and ratings.',
    'product_search',
    'products',
    ARRAY['search', 'find', 'product', 'look for', 'browse']
  );

-- =====================================================
-- 7. TRIGGER: UPDATE last_message_at ON NEW MESSAGE
-- =====================================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- 8. TRIGGER: UPDATE UNREAD COUNTS
-- =====================================================
CREATE OR REPLACE FUNCTION update_unread_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread count for receiver's role
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

CREATE TRIGGER trigger_update_unread_counts
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_unread_counts();

-- =====================================================
-- 9. TRIGGER: UPDATE chatbot_sessions LAST_ACTIVITY
-- =====================================================
CREATE OR REPLACE FUNCTION update_chatbot_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chatbot_sessions
  SET last_activity = NEW.created_at
  WHERE session_id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chatbot_session_activity
AFTER INSERT ON chatbot_messages
FOR EACH ROW
EXECUTE FUNCTION update_chatbot_session_activity();

-- =====================================================
-- 10. GRANT PERMISSIONS (if using specific database user)
-- =====================================================
-- Uncomment if you have a specific application database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON conversations, chat_messages, chatbot_sessions, chatbot_messages, chatbot_faqs TO wego_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO wego_app;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- - Conversations table for merchant-customer threads
-- - Enhanced chat_messages table with conversation support
-- - Chatbot_sessions for RASA chatbot state management
-- - Chatbot_messages for chatbot conversation history
-- - Chatbot_faqs for FAQ fallback knowledge base
-- - Triggers for automatic last_message_at and unread count updates
-- - 8 seed FAQ entries for common questions
-- =====================================================
