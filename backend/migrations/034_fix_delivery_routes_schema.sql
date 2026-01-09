-- Fix delivery_routes schema to match code expectations
-- Adds missing columns needed for route optimization

-- Add order_ids array column
ALTER TABLE delivery_routes
ADD COLUMN IF NOT EXISTS order_ids INTEGER[] NOT NULL DEFAULT '{}';

-- Create GIN index for efficient array operations
CREATE INDEX IF NOT EXISTS idx_delivery_routes_order_ids
ON delivery_routes USING GIN (order_ids);

-- Add merchant_id column
ALTER TABLE delivery_routes
ADD COLUMN IF NOT EXISTS merchant_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Populate merchant_id from existing order data
UPDATE delivery_routes dr
SET merchant_id = (
  SELECT o.merchant_id
  FROM orders o
  WHERE o.id = dr.order_ids[1]
)
WHERE dr.merchant_id IS NULL AND array_length(dr.order_ids, 1) > 0;

-- Create index for merchant_id
CREATE INDEX IF NOT EXISTS idx_delivery_routes_merchant_id
ON delivery_routes(merchant_id);

-- Add route_coordinates column (JSONB format for coordinates)
ALTER TABLE delivery_routes
ADD COLUMN IF NOT EXISTS route_coordinates JSONB;

-- Copy data from route_geometry to route_coordinates for existing rows
UPDATE delivery_routes
SET route_coordinates = route_geometry
WHERE route_coordinates IS NULL AND route_geometry IS NOT NULL;

-- Add optimization_source column (maps from optimization_method)
ALTER TABLE delivery_routes
ADD COLUMN IF NOT EXISTS optimization_source VARCHAR(50);

-- Copy data from optimization_method to optimization_source
UPDATE delivery_routes
SET optimization_source = optimization_method
WHERE optimization_source IS NULL AND optimization_method IS NOT NULL;

-- Add optimization_algorithm column
ALTER TABLE delivery_routes
ADD COLUMN IF NOT EXISTS optimization_algorithm VARCHAR(100);

-- Add optimized_at timestamp column
ALTER TABLE delivery_routes
ADD COLUMN IF NOT EXISTS optimized_at TIMESTAMP;

-- Set optimized_at to created_at for existing rows
UPDATE delivery_routes
SET optimized_at = created_at
WHERE optimized_at IS NULL AND created_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN delivery_routes.order_ids IS 'Array of order IDs assigned to this route';
COMMENT ON COLUMN delivery_routes.merchant_id IS 'Merchant who owns the orders in this route';
COMMENT ON COLUMN delivery_routes.route_coordinates IS 'JSONB array of coordinate pairs for the route';
COMMENT ON COLUMN delivery_routes.optimization_source IS 'Source of the route optimization (osrm, google, fallback)';
COMMENT ON COLUMN delivery_routes.optimization_algorithm IS 'Algorithm used for optimization (clarke-wright, etc)';
COMMENT ON COLUMN delivery_routes.optimized_at IS 'Timestamp when route was optimized';
