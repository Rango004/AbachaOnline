-- ==========================================
-- Populate Hostel Locations from OSM Data
-- ==========================================
-- This SQL script inserts all hostel locations from Njala map OSM file
-- into the delivery_locations table.
--
-- Usage:
-- 1. Connect to your PostgreSQL database
-- 2. Run this script: psql -U username -d database_name -f populate-hostels.sql
--    OR copy and paste into your database client (pgAdmin, DBeaver, etc.)
-- ==========================================

-- Start transaction
BEGIN;

-- Insert or update hostel locations
-- Using INSERT ... ON CONFLICT to handle duplicates

INSERT INTO delivery_locations (name, latitude, longitude, description, created_at, updated_at)
VALUES
  ('Quadrangle 1', 8.1138658, -12.0708755, 'Female hostel close to student union canteen', NOW(), NOW()),
  ('Quadrangle 2', 8.1139857, -12.0704704, 'Student hostel', NOW(), NOW()),
  ('Tourist', 8.1141939, -12.0701773, 'Student hostel', NOW(), NOW()),
  ('Winters Extension', 8.1144437, -12.0715245, 'Student hostel', NOW(), NOW()),
  ('TK. Jamaica', 8.1138974, -12.0682860, 'Student hostel', NOW(), NOW()),
  ('TK. Africa', 8.1140332, -12.0693395, 'Student hostel', NOW(), NOW()),
  ('TK. Asia', 8.1142495, -12.0693038, 'Student hostel', NOW(), NOW()),
  ('TK. America', 8.1141447, -12.0686472, 'Student hostel', NOW(), NOW()),
  ('TK. Europe', 8.1143499, -12.0686082, 'Student hostel', NOW(), NOW()),
  ('Postgrad & Medicine', 8.1164181, -12.0674767, 'Postgraduate and medical students hostel', NOW(), NOW()),
  ('Heavens 2', 8.1169224, -12.0674210, 'Student hostel', NOW(), NOW()),
  ('Heavens 1', 8.1174974, -12.0674132, 'Student hostel', NOW(), NOW()),
  ('Matturi Block C', 8.1183434, -12.0693430, 'Male hostel', NOW(), NOW()),
  ('Matturi Block B', 8.1183370, -12.0699996, 'Male hostel', NOW(), NOW()),
  ('Matturi Block H', 8.1188194, -12.0692962, 'Male hostel', NOW(), NOW()),
  ('Matturi Block A', 8.1188050, -12.0699399, 'Male hostel', NOW(), NOW()),
  ('Matturi Block F', 8.1192762, -12.0693139, 'Male hostel', NOW(), NOW()),
  ('Matturi Block E', 8.1188130, -12.0706562, 'Male hostel with 42 rooms', NOW(), NOW()),
  ('Matturi Block D', 8.1183699, -12.0706575, 'Female hostel', NOW(), NOW())
ON CONFLICT (name)
DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verify the insertions
SELECT COUNT(*) as total_hostels FROM delivery_locations;

-- Display all hostel locations
SELECT id, name, latitude, longitude, description
FROM delivery_locations
ORDER BY name;

-- Commit transaction
COMMIT;

-- Success message
SELECT '✅ Hostel locations populated successfully!' as status;
