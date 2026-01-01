-- Update User Locations Based on Hostels and Dormitories
-- This script distributes student users across available hostel locations

-- First, let's see the current state of users without proper locations
SELECT
  COUNT(*) as total_students,
  COUNT(location_id) as students_with_location,
  COUNT(latitude) as students_with_coordinates
FROM users
WHERE role = 'customer';

-- Get list of available hostel locations
SELECT id, name, latitude, longitude, type
FROM locations
WHERE type = 'dormitory'
ORDER BY name;

-- ================================================================
-- BACKUP EXISTING DATA BEFORE UPDATE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_location_backup AS
SELECT id, location_id, latitude, longitude, updated_at
FROM users
WHERE role = 'customer';

-- ================================================================
-- UPDATE STRATEGY 1: Randomly assign students to hostels
-- ================================================================

-- This assigns students to hostels in a round-robin fashion
WITH hostels AS (
  SELECT id, name, latitude, longitude,
    ROW_NUMBER() OVER (ORDER BY name) as hostel_num
  FROM locations
  WHERE type = 'dormitory'
),
students AS (
  SELECT id,
    ROW_NUMBER() OVER (ORDER BY id) as student_num
  FROM users
  WHERE role = 'customer'
),
hostel_count AS (
  SELECT COUNT(*) as total_hostels FROM hostels
),
assignments AS (
  SELECT
    s.id as user_id,
    h.id as location_id,
    h.name as hostel_name,
    h.latitude,
    h.longitude
  FROM students s
  CROSS JOIN hostel_count hc
  JOIN hostels h ON h.hostel_num = ((s.student_num - 1) % hc.total_hostels) + 1
)
UPDATE users u
SET
  location_id = a.location_id,
  latitude = a.latitude::decimal(10,8),
  longitude = a.longitude::decimal(11,8),
  updated_at = NOW()
FROM assignments a
WHERE u.id = a.user_id
  AND u.role = 'customer';

-- ================================================================
-- VERIFICATION: Check the distribution
-- ================================================================
SELECT
  l.name as hostel_name,
  l.type,
  COUNT(u.id) as student_count,
  l.latitude,
  l.longitude
FROM locations l
LEFT JOIN users u ON u.location_id = l.id AND u.role = 'customer'
WHERE l.type = 'dormitory'
GROUP BY l.id, l.name, l.type, l.latitude, l.longitude
ORDER BY student_count DESC, l.name;

-- ================================================================
-- ALTERNATIVE UPDATE STRATEGY 2: Gender-based hostel assignment
-- (Uncomment if you want to use this instead)
-- ================================================================
/*
-- For Female students - assign to female hostels
-- Examples: Quad 1, Quad 2, Matturi Block D, Matturi Block E

WITH female_hostels AS (
  SELECT id, name, latitude, longitude,
    ROW_NUMBER() OVER (ORDER BY name) as hostel_num
  FROM locations
  WHERE type = 'dormitory'
    AND name IN ('Quad 1', 'Quad 2', 'Matturi Block D')
),
female_students AS (
  SELECT id,
    ROW_NUMBER() OVER (ORDER BY id) as student_num
  FROM users
  WHERE role = 'customer'
    AND (name ILIKE '%female%' OR id % 2 = 0) -- Adjust this condition based on your data
),
hostel_count AS (
  SELECT COUNT(*) as total_hostels FROM female_hostels
),
assignments AS (
  SELECT
    s.id as user_id,
    h.id as location_id,
    h.name as hostel_name,
    h.latitude,
    h.longitude
  FROM female_students s
  CROSS JOIN hostel_count hc
  JOIN female_hostels h ON h.hostel_num = ((s.student_num - 1) % hc.total_hostels) + 1
)
UPDATE users u
SET
  location_id = a.location_id,
  latitude = a.latitude::decimal(10,8),
  longitude = a.longitude::decimal(11,8),
  updated_at = NOW()
FROM assignments a
WHERE u.id = a.user_id;

-- For Male students - assign to male hostels
-- Examples: Winters, Tourist, TK hostels, Matturi Blocks A, B, C, E, F, H
WITH male_hostels AS (
  SELECT id, name, latitude, longitude,
    ROW_NUMBER() OVER (ORDER BY name) as hostel_num
  FROM locations
  WHERE type = 'dormitory'
    AND name IN ('Winters', 'Winters Extension', 'Tourist', 'TK Jamaica', 'TK Asia', 'TK Africa',
                 'TK Europe', 'TK America', 'Matturi Block A', 'Matturi Block B', 'Matturi Block C',
                 'Matturi Block E', 'Matturi Block F', 'Matturi Block H')
),
male_students AS (
  SELECT id,
    ROW_NUMBER() OVER (ORDER BY id) as student_num
  FROM users
  WHERE role = 'customer'
    AND NOT (name ILIKE '%female%' OR id % 2 = 0) -- Adjust this condition based on your data
),
hostel_count AS (
  SELECT COUNT(*) as total_hostels FROM male_hostels
),
assignments AS (
  SELECT
    s.id as user_id,
    h.id as location_id,
    h.name as hostel_name,
    h.latitude,
    h.longitude
  FROM male_students s
  CROSS JOIN hostel_count hc
  JOIN male_hostels h ON h.hostel_num = ((s.student_num - 1) % hc.total_hostels) + 1
)
UPDATE users u
SET
  location_id = a.location_id,
  latitude = a.latitude::decimal(10,8),
  longitude = a.longitude::decimal(11,8),
  updated_at = NOW()
FROM assignments a
WHERE u.id = a.user_id;
*/

-- ================================================================
-- UPDATE MERCHANT LOCATIONS (if needed)
-- ================================================================
-- Update merchants to be at building/merchant locations
UPDATE users u
SET
  location_id = l.id,
  latitude = l.latitude::decimal(10,8),
  longitude = l.longitude::decimal(11,8),
  updated_at = NOW()
FROM (
  SELECT id, name, latitude, longitude,
    ROW_NUMBER() OVER (ORDER BY name) as loc_num
  FROM locations
  WHERE type IN ('merchant', 'building')
) l
WHERE u.role = 'merchant'
  AND u.id % (SELECT COUNT(*) FROM locations WHERE type IN ('merchant', 'building')) = l.loc_num - 1;

-- ================================================================
-- FINAL VERIFICATION
-- ================================================================
SELECT
  'Students' as user_type,
  COUNT(*) as total_users,
  COUNT(location_id) as users_with_location,
  COUNT(latitude) as users_with_coordinates,
  ROUND(100.0 * COUNT(location_id) / COUNT(*), 2) as percentage_with_location
FROM users
WHERE role = 'customer'

UNION ALL

SELECT
  'Merchants' as user_type,
  COUNT(*) as total_users,
  COUNT(location_id) as users_with_location,
  COUNT(latitude) as users_with_coordinates,
  ROUND(100.0 * COUNT(location_id) / COUNT(*), 2) as percentage_with_location
FROM users
WHERE role = 'merchant'

UNION ALL

SELECT
  'Riders' as user_type,
  COUNT(*) as total_users,
  COUNT(location_id) as users_with_location,
  COUNT(latitude) as users_with_coordinates,
  ROUND(100.0 * COUNT(location_id) / COUNT(*), 2) as percentage_with_location
FROM users
WHERE role = 'rider';

-- Show sample of updated users
SELECT
  u.id,
  u.name,
  u.phone,
  u.role,
  l.name as location_name,
  l.type as location_type,
  u.latitude,
  u.longitude
FROM users u
LEFT JOIN locations l ON l.id = u.location_id
WHERE u.role = 'customer'
ORDER BY u.id
LIMIT 20;
