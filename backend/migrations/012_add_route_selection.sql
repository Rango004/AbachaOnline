-- Migration 012: Add route selection tracking
-- Tracks which route was selected by rider (primary vs alternate)
-- and links alternate routes to primary routes for comparison

ALTER TABLE delivery_routes
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alternate_route_id INTEGER REFERENCES delivery_routes(id),
ADD COLUMN IF NOT EXISTS is_alternate BOOLEAN DEFAULT false;

-- Index for quick lookup of selected routes
CREATE INDEX IF NOT EXISTS idx_delivery_routes_selected
ON delivery_routes(rider_id, is_selected, status);

-- Index for finding alternate routes
CREATE INDEX IF NOT EXISTS idx_delivery_routes_alternate
ON delivery_routes(alternate_route_id);

-- Log the migration
SELECT NOW() as migrated_at, 'Migration 012: Route selection tracking added' as description;
