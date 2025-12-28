-- Add delivery verification codes to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_code VARCHAR(6);

-- Function to generate 6-digit delivery code
CREATE OR REPLACE FUNCTION generate_delivery_code() RETURNS VARCHAR(6) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to set delivery code when order is marked ready
CREATE OR REPLACE FUNCTION set_delivery_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate delivery code when order becomes 'ready' and doesn't have one
  IF NEW.order_status = 'ready' AND (OLD.order_status IS NULL OR OLD.order_status != 'ready') AND NEW.delivery_code IS NULL THEN
    NEW.delivery_code := generate_delivery_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_delivery_code ON orders;
CREATE TRIGGER trigger_set_delivery_code
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_delivery_code();

-- Generate delivery codes for existing ready orders
UPDATE orders
SET delivery_code = generate_delivery_code()
WHERE order_status = 'ready' AND delivery_code IS NULL;

SELECT 'Delivery verification system added successfully!' AS status;
