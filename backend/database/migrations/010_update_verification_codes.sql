-- Update verification system: pickup_code for customers, delivery_code removed
-- Rename delivery_code to pickup_code (customer's verification code)
ALTER TABLE orders RENAME COLUMN delivery_code TO pickup_code;

-- Update the function to set pickup code instead
DROP FUNCTION IF EXISTS set_delivery_code() CASCADE;

CREATE OR REPLACE FUNCTION set_pickup_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate pickup code when order is created or marked ready
  IF (NEW.order_status IN ('pending', 'ready') OR TG_OP = 'INSERT') AND NEW.pickup_code IS NULL THEN
    NEW.pickup_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_pickup_code ON orders;
CREATE TRIGGER trigger_set_pickup_code
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_pickup_code();

-- Generate pickup codes for existing orders that don't have one
UPDATE orders
SET pickup_code = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
WHERE pickup_code IS NULL;

SELECT 'Pickup code verification system updated successfully!' AS status;
