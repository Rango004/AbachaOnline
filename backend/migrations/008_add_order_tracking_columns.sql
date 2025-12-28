-- Add tracking and delivery columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS pickup_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS rider_id INT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- Create order status history table to track all status changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created ON order_status_history(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

SELECT 'Order tracking columns and history table created successfully!' AS status;
