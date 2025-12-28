-- Disable automatic pickup code generation on rider assignment
-- Pickup codes are now generated ONLY when order transitions to 'in_delivery' status
-- This ensures customers see the code only when the rider has picked up the order

-- Drop the automatic trigger
DROP TRIGGER IF EXISTS trigger_generate_pickup_code ON orders;

-- Clear any pickup codes from orders that haven't been picked up yet
-- (Keeping codes for delivered orders for reference)
UPDATE orders
SET pickup_code = NULL
WHERE order_status NOT IN ('in_delivery', 'delivered');

SELECT 'Disabled automatic pickup code generation on rider assignment' AS migration_status;
