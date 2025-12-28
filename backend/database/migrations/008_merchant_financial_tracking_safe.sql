-- Safe Merchant Financial Tracking Migration
-- This migration safely adds tables and columns without conflicts

-- Add merchant_id to orders table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='merchant_id') THEN
        ALTER TABLE orders ADD COLUMN merchant_id INT REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add rider assignment fields if not exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='rider_id') THEN
        ALTER TABLE orders ADD COLUMN rider_id INT REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='assigned_at') THEN
        ALTER TABLE orders ADD COLUMN assigned_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='picked_up_at') THEN
        ALTER TABLE orders ADD COLUMN picked_up_at TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivered_at') THEN
        ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP;
    END IF;
END $$;

-- Create merchant_sales table if not exists
CREATE TABLE IF NOT EXISTS merchant_sales (
  id SERIAL PRIMARY KEY,
  merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.05,
  commission_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_merchant_sales_merchant') THEN
        CREATE INDEX idx_merchant_sales_merchant ON merchant_sales(merchant_id, sale_date);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_merchant_sales_order') THEN
        CREATE INDEX idx_merchant_sales_order ON merchant_sales(order_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_merchant_sales_status') THEN
        CREATE INDEX idx_merchant_sales_status ON merchant_sales(status);
    END IF;
END $$;

-- Create merchant_payouts table if not exists
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

-- Create payout_items table if not exists
CREATE TABLE IF NOT EXISTS payout_items (
  id SERIAL PRIMARY KEY,
  payout_id INT NOT NULL REFERENCES merchant_payouts(id) ON DELETE CASCADE,
  sale_id INT NOT NULL REFERENCES merchant_sales(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create function to record merchant sales
CREATE OR REPLACE FUNCTION record_merchant_sale()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  commission_rate DECIMAL(5,4) := 0.05;
  commission_amt DECIMAL(10,2);
  net_amt DECIMAL(10,2);
BEGIN
  IF NEW.order_status = 'delivered' AND OLD.order_status != 'delivered' THEN
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
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_record_merchant_sale ON orders;
CREATE TRIGGER trigger_record_merchant_sale
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION record_merchant_sale();

SELECT 'Safe merchant financial tracking migration completed!' AS status;