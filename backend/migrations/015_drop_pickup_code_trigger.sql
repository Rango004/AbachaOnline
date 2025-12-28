-- Drop pickup code trigger permanently
-- This ensures pickup codes are ONLY generated in application code when rider picks up order
-- NOT automatically when rider is assigned

DROP TRIGGER IF EXISTS trigger_generate_pickup_code ON orders CASCADE;
DROP FUNCTION IF EXISTS generate_code_on_rider_assignment() CASCADE;
DROP FUNCTION IF EXISTS generate_pickup_code() CASCADE;

-- Clear any codes from orders that shouldn't have them
UPDATE orders
SET pickup_code = NULL
WHERE order_status NOT IN ('in_delivery', 'delivered');

SELECT 'Pickup code trigger permanently removed' AS migration_status;
