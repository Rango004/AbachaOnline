-- Merchant Financial Tracking Migration
-- This migration adds tables for tracking merchant sales and financial records

-- Add merchant_id to orders table if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_id INT REFERENCES users(id) ON DELETE SET NULL;

-- Create merchant_sales table for financial tracking
CREATE TABLE IF NOT EXISTS merchant_sales (
  id SERIAL PRIMARY KEY,
  merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.05, -- 5% platform commission
  commission_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL, -- Amount after commission
  sale_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_merchant_sales_merchant ON merchant_sales(merchant_id, sale_date);
CREATE INDEX idx_merchant_sales_order ON merchant_sales(order_id);
CREATE INDEX idx_merchant_sales_status ON merchant_sales(status);

-- Create merchant_payouts table for tracking payments to merchants
CREATE TABLE IF NOT EXISTS merchant_payouts (
  id SERIAL PRIMARY KEY,
  merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_deducted DECIMAL(10,2) NOT NULL,
  net_payout DECIMAL(10,2) NOT NULL,
  payout_method VARCHAR(50) DEFAULT 'bank_transfer',
  payout_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_merchant_payouts_merchant ON merchant_payouts(merchant_id, created_at);
CREATE INDEX idx_merchant_payouts_status ON merchant_payouts(status);

-- Create payout_items table to link sales to payouts
CREATE TABLE IF NOT EXISTS payout_items (
  id SERIAL PRIMARY KEY,
  payout_id INT NOT NULL REFERENCES merchant_payouts(id) ON DELETE CASCADE,
  sale_id INT NOT NULL REFERENCES merchant_sales(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add order_status_history table if not exists (for tracking)
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  location JSON, -- GPS coordinates if available
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_by_role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id, created_at);

-- Add tracking_number to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(20) UNIQUE;

-- Add rider assignment fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- Create function to generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number() RETURNS VARCHAR(20) AS $$
DECLARE
  tracking_num VARCHAR(20);
BEGIN
  tracking_num := 'WG' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN tracking_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate tracking numbers
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_tracking_number ON orders;
CREATE TRIGGER trigger_set_tracking_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_number();

-- Create function to record merchant sales automatically
CREATE OR REPLACE FUNCTION record_merchant_sale()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  commission_rate DECIMAL(5,4) := 0.05; -- 5% platform commission
  commission_amt DECIMAL(10,2);
  net_amt DECIMAL(10,2);
BEGIN
  -- Only record sales when order is delivered
  IF NEW.order_status = 'delivered' AND OLD.order_status != 'delivered' THEN
    -- Loop through all order items and record sales for each merchant
    FOR item IN 
      SELECT oi.*, p.merchant_id 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = NEW.id
    LOOP
      commission_amt := item.subtotal * commission_rate;
      net_amt := item.subtotal - commission_amt;
      
      INSERT INTO merchant_sales (
        merchant_id, order_id, product_id, quantity, unit_price, 
        total_amount, commission_rate, commission_amount, net_amount, status
      ) VALUES (
        item.merchant_id, NEW.id, item.product_id, item.quantity, item.unit_price,
        item.subtotal, commission_rate, commission_amt, net_amt, 'confirmed'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_record_merchant_sale ON orders;
CREATE TRIGGER trigger_record_merchant_sale
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION record_merchant_sale();

-- Success message
SELECT 'Merchant financial tracking migration completed successfully!' AS status;