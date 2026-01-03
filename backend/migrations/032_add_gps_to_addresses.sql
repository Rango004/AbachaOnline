-- Migration: Add GPS coordinates to student_addresses
-- Allows students to save addresses with GPS location instead of predefined locations

-- Add GPS coordinate columns
ALTER TABLE student_addresses
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add simple index for GPS coordinate queries
-- Using B-tree index which works without requiring PostGIS or earthdistance extensions
CREATE INDEX IF NOT EXISTS idx_student_addresses_lat_lng
ON student_addresses (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comments
COMMENT ON COLUMN student_addresses.latitude IS 'GPS latitude coordinate (optional, used when user captures location)';
COMMENT ON COLUMN student_addresses.longitude IS 'GPS longitude coordinate (optional, used when user captures location)';

-- Note: location_id remains optional (can be NULL when GPS is used instead)
-- For advanced geospatial queries (distance calculations), you can enable PostGIS or earthdistance extension later
