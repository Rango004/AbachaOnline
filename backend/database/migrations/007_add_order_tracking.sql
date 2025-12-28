-- Add order tracking and logistics system
-- Run this migration to add tracking numbers and status history

-- Add tracking number and rider assignment to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS rider_id INT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id);

-- Create order status history table for detailed tracking
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  location VARCHAR(255),
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at);

-- Function to generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_tracking_number VARCHAR(50);
  tracking_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate tracking number format: WG-YYYY-NNNNNN
    new_tracking_number := 'WG-' ||
                          TO_CHAR(NOW(), 'YYYY') || '-' ||
                          LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');

    -- Check if tracking number already exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE tracking_number = new_tracking_number)
    INTO tracking_exists;

    -- Exit loop if unique
    EXIT WHEN NOT tracking_exists;
  END LOOP;

  RETURN new_tracking_number;
END;
$$ LANGUAGE plpgsql;

-- Add tracking numbers to existing orders that don't have one
UPDATE orders
SET tracking_number = generate_tracking_number()
WHERE tracking_number IS NULL;

-- Success message
SELECT 'Order tracking system migration completed successfully!' AS status;
