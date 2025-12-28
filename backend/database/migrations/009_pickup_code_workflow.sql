-- Pickup Code Workflow Migration

-- Add pickup_code to orders table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='pickup_code') THEN
        ALTER TABLE orders ADD COLUMN pickup_code VARCHAR(6);
    END IF;
END $$;

-- Create function to generate 6-digit pickup code
CREATE OR REPLACE FUNCTION generate_pickup_code() RETURNS VARCHAR(6) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to generate pickup code on rider assignment
CREATE OR REPLACE FUNCTION generate_code_on_rider_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rider_id IS NOT NULL AND OLD.rider_id IS NULL THEN
    NEW.pickup_code := generate_pickup_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DISABLED: Trigger for pickup code generation
-- Pickup codes are now generated in the application code ONLY when order transitions to 'in_delivery'
-- This ensures customers see the code only when the rider has actually picked up the order
-- DROP TRIGGER IF EXISTS trigger_generate_pickup_code ON orders;
-- CREATE TRIGGER trigger_generate_pickup_code
--   BEFORE UPDATE ON orders
--   FOR EACH ROW
--   EXECUTE FUNCTION generate_code_on_rider_assignment();

-- Disable the trigger if it exists from a previous migration run
DROP TRIGGER IF EXISTS trigger_generate_pickup_code ON orders;

SELECT 'Pickup code workflow migration completed!' AS status;