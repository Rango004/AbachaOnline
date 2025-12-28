-- Delete optimized routes for test riders
DELETE FROM delivery_routes
WHERE rider_id IN (
  SELECT id FROM users
  WHERE phone IN ('+23231475452', '+23277040420')
);
