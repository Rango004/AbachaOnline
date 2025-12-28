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
  client_type VARCHAR(50), -- 'web', 'mobile', 'app'
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_user_id ON websocket_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_socket_id ON websocket_sessions(socket_id);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_is_active ON websocket_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_last_heartbeat ON websocket_sessions(last_heartbeat);

-- Create table for tracking WebSocket events for debugging/analytics
CREATE TABLE IF NOT EXISTS websocket_events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  room VARCHAR(100),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for event querying
CREATE INDEX IF NOT EXISTS idx_websocket_events_user_id ON websocket_events(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_events_event_type ON websocket_events(event_type);
CREATE INDEX IF NOT EXISTS idx_websocket_events_created_at ON websocket_events(created_at DESC);

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

-- Create indexes for pending messages
CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_user_id ON websocket_pending_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_is_delivered ON websocket_pending_messages(is_delivered);
CREATE INDEX IF NOT EXISTS idx_websocket_pending_messages_created_at ON websocket_pending_messages(created_at DESC);

SELECT 'WebSocket session tracking tables created successfully!' AS status;
