-- Migration: Add GPS coordinates to student_addresses
-- Allows students to save addresses with GPS location instead of predefined locations

-- Add GPS coordinate columns
ALTER TABLE student_addresses
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geospatial queries (if needed for distance calculations)
CREATE INDEX IF NOT EXISTS idx_student_addresses_coordinates
ON student_addresses USING gist (
    ll_to_earth(latitude::float8, longitude::float8)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comments
COMMENT ON COLUMN student_addresses.latitude IS 'GPS latitude coordinate (optional, used when user captures location)';
COMMENT ON COLUMN student_addresses.longitude IS 'GPS longitude coordinate (optional, used when user captures location)';

-- Note: location_id remains optional (can be NULL when GPS is used instead)
