-- Migration: Create notifications table for customer alerts

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'Stores notifications for users about refunds, orders, etc.';
COMMENT ON COLUMN notifications.type IS 'Type of notification: refund_approved, refund_rejected, order_status, etc.';
COMMENT ON COLUMN notifications.data IS 'Additional JSON data (e.g., order_id, refund_amount, etc.)';
