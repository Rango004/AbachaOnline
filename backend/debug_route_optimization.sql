-- DEBUG SCRIPT: Route Optimization Issues

-- 1. Check order statuses distribution
SELECT 'ORDER STATUS DISTRIBUTION' as check_name;
SELECT order_status, COUNT(*) as count
FROM orders
GROUP BY order_status
ORDER BY count DESC;

-- 2. Check ready orders with GPS data
SELECT '--- READY ORDERS WITH GPS (UNASSIGNED) ---' as info;
SELECT o.id, o.order_status, o.rider_id, u.name, u.latitude, u.longitude
FROM orders o
LEFT JOIN users u ON o.student_id = u.id
WHERE o.order_status = 'ready'
  AND o.rider_id IS NULL
  AND u.latitude IS NOT NULL
  AND u.longitude IS NOT NULL
LIMIT 10;

-- 3. Check orders assigned to riders
SELECT '--- READY ORDERS ASSIGNED TO RIDERS ---' as info;
SELECT o.id, o.order_status, o.rider_id, r.name as rider_name, u.name as customer_name, u.latitude, u.longitude
FROM orders o
LEFT JOIN users u ON o.student_id = u.id
LEFT JOIN users r ON o.rider_id = r.id
WHERE o.order_status = 'ready'
  AND o.rider_id IS NOT NULL
LIMIT 10;

-- 4. Check confirmed orders
SELECT '--- CONFIRMED ORDERS (AWAITING PREP) ---' as info;
SELECT o.id, o.order_status, o.rider_id, u.name as customer_name, u.latitude, u.longitude
FROM orders o
LEFT JOIN users u ON o.student_id = u.id
WHERE o.order_status = 'confirmed'
LIMIT 10;

-- 5. Check riders with GPS data
SELECT '--- RIDERS WITH GPS DATA ---' as info;
SELECT u.id, u.name, u.latitude, u.longitude, u.is_verified, COUNT(o.id) as active_orders
FROM users u
LEFT JOIN orders o ON u.id = o.rider_id AND o.order_status IN ('ready', 'in_delivery')
WHERE u.role = 'rider'
GROUP BY u.id, u.name, u.latitude, u.longitude, u.is_verified
LIMIT 10;

-- 6. Check customers with GPS data
SELECT '--- CUSTOMERS WITH GPS DATA ---' as info;
SELECT u.id, u.name, u.latitude, u.longitude, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.student_id
WHERE u.role = 'student'
  AND u.latitude IS NOT NULL
  AND u.longitude IS NOT NULL
GROUP BY u.id, u.name, u.latitude, u.longitude
LIMIT 10;
