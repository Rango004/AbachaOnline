-- Synthetic Sales Data for Forecasting Training
-- Merchant ID: 3
-- Generated: 2025-12-09T06:06:16.095343
-- WARNING: This is synthetic test data


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10000);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10000, 1, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10000 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10001);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10001, 1, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10001 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4400, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10002);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10002, 1, 88, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10002 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4950, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10003);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10003, 1, 99, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10003 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4650, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10004);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10004, 1, 93, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10004 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10005);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10005, 1, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10005 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4250, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10006);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10006, 1, 85, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10006 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10007);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10007, 1, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10007 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10008);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10008, 1, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10008 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4400, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10009);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10009, 1, 88, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10009 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10010);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10010, 1, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10010 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4550, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10011);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10011, 1, 91, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10011 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10012);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10012, 1, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10012 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10013);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10013, 1, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10013 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10014);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10014, 1, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10014 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10015);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10015, 1, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10015 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10016);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10016, 1, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10016 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10017);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10017, 1, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10017 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10018);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10018, 1, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10018 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10019);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10019, 1, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10019 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10020);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10020, 1, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10020 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10021);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10021, 1, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10021 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4900, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10022);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10022, 1, 98, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10022 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10023);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10023, 1, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10023 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10024);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10024, 1, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10024 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6000, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10025);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10025, 1, 120, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10025 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10026);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10026, 1, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10026 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10027);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10027, 1, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10027 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10028);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10028, 1, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10028 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4750, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10029);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10029, 1, 95, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10029 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4550, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10030);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10030, 1, 91, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10030 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6400, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10031);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10031, 1, 128, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10031 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6050, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10032);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10032, 1, 121, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10032 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10033);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10033, 1, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10033 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4850, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10034);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10034, 1, 97, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10034 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10035);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10035, 1, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10035 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5250, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10036);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10036, 1, 105, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10036 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10037);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10037, 1, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10037 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10038);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10038, 1, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10038 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6350, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10039);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10039, 1, 127, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10039 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10040);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10040, 1, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10040 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10041);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10041, 1, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10041 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10042);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10042, 1, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10042 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4950, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10043);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10043, 1, 99, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10043 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10044);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10044, 1, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10044 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4650, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10045);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10045, 1, 93, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10045 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5850, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10046);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10046, 1, 117, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10046 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5500, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10047);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10047, 1, 110, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10047 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10048);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10048, 1, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10048 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10049);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10049, 1, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10049 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5550, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10050);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10050, 1, 111, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10050 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10051);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10051, 1, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10051 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4800, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10052);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10052, 1, 96, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10052 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7000, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10053);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10053, 1, 140, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10053 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5550, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10054);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10054, 1, 111, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10054 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5200, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10055);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10055, 1, 104, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10055 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10056);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10056, 1, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10056 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10057);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10057, 1, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10057 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5650, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10058);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10058, 1, 113, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10058 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6200, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10059);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10059, 1, 124, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10059 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6000, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10060);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10060, 1, 120, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10060 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10061);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10061, 1, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10061 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10062);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10062, 1, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10062 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10063);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10063, 1, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10063 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6050, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10064);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10064, 1, 121, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10064 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10065);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10065, 1, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10065 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5350, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10066);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10066, 1, 107, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10066 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7500, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10067);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10067, 1, 150, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10067 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10068);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10068, 1, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10068 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10069);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10069, 1, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10069 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4000, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10070);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10070, 1, 80, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10070 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4650, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10071);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10071, 1, 93, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10071 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10072);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10072, 1, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10072 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4650, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10073);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10073, 1, 93, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10073 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10074);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10074, 1, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10074 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10075);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10075, 1, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10075 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10076);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10076, 1, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10076 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10077);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10077, 1, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10077 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10078);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10078, 1, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10078 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10079);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10079, 1, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10079 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10080);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10080, 1, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10080 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4750, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10081);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10081, 1, 95, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10081 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10082);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10082, 1, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10082 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10083);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10083, 1, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10083 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10084);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10084, 1, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10084 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3450, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10085);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10085, 1, 69, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10085 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10086);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10086, 1, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10086 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10087);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10087, 1, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10087 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10088);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10088, 1, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10088 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10089);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10089, 1, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10089 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10090);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10090, 1, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10090 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10091);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10091, 1, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10091 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10092);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10092, 1, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10092 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10093);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10093, 1, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10093 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10094);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10094, 1, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10094 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10095);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10095, 1, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10095 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10096);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10096, 1, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10096 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10097);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10097, 1, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10097 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10098);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10098, 1, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10098 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10099);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10099, 1, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10099 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10100);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10100, 1, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10100 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10101);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10101, 1, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10101 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10102);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10102, 1, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10102 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10103);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10103, 1, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10103 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10104);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10104, 1, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10104 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10105);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10105, 1, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10105 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3950, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10106);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10106, 1, 79, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10106 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10107);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10107, 1, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10107 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10108);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10108, 1, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10108 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10109);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10109, 1, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10109 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10110);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10110, 1, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10110 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10111);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10111, 1, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10111 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10112);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10112, 1, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10112 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10113);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10113, 1, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10113 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10114);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10114, 1, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10114 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10115);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10115, 1, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10115 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10116);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10116, 1, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10116 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10117);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10117, 1, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10117 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10118);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10118, 1, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10118 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10119);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10119, 1, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10119 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10120);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10120, 1, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10120 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10121);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10121, 1, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10121 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10122);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10122, 1, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10122 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10123);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10123, 1, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10123 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10124);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10124, 1, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10124 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10125);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10125, 1, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10125 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10126);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10126, 1, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10126 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10127);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10127, 1, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10127 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10128);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10128, 1, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10128 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10129);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10129, 1, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10129 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10130);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10130, 1, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10130 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10131);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10131, 1, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10131 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10132);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10132, 1, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10132 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10133);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10133, 1, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10133 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10134);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10134, 1, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10134 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10135);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10135, 1, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10135 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10136);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10136, 1, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10136 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10137);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10137, 1, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10137 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10138);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10138, 1, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10138 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10139);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10139, 1, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10139 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10140);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10140, 1, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10140 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10141);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10141, 1, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10141 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10142);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10142, 1, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10142 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10143);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10143, 1, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10143 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10144);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10144, 1, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10144 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10145);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10145, 1, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10145 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10146);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10146, 1, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10146 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10147);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10147, 1, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10147 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10148);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10148, 1, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10148 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10149);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10149, 1, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10149 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10150);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10150, 1, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10150 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10151);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10151, 1, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10151 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10152);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10152, 1, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10152 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10153);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10153, 1, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10153 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10154);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10154, 1, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10154 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10155);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10155, 1, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10155 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3950, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10156);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10156, 1, 79, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10156 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10157);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10157, 1, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10157 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10158);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10158, 1, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10158 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10159);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10159, 1, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10159 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10160);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10160, 1, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10160 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10161);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10161, 1, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10161 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10162);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10162, 1, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10162 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10163);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10163, 1, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10163 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10164);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10164, 1, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10164 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10165);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10165, 1, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10165 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10166);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10166, 1, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10166 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10167);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10167, 1, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10167 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10168);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10168, 1, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10168 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10169);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10169, 1, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10169 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10170);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10170, 1, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10170 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10171);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10171, 1, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10171 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10172);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10172, 1, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10172 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10173);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10173, 1, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10173 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10174);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10174, 1, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10174 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3950, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10175);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10175, 1, 79, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10175 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10176);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10176, 1, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10176 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10177);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10177, 1, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10177 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3450, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10178);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10178, 1, 69, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10178 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6150, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10179);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10179, 1, 123, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10179 AND product_id = 1);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5450, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10180);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10180, 2, 109, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10180 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10181);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10181, 2, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10181 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10182);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10182, 2, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10182 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5400, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10183);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10183, 2, 108, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10183 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5850, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10184);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10184, 2, 117, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10184 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5050, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10185);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10185, 2, 101, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10185 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4600, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10186);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10186, 2, 92, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10186 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10187);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10187, 2, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10187 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10188);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10188, 2, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10188 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3950, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10189);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10189, 2, 79, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10189 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4750, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10190);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10190, 2, 95, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10190 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6950, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10191);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10191, 2, 139, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10191 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4750, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10192);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10192, 2, 95, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10192 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10193);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10193, 2, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10193 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6100, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10194);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10194, 2, 122, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10194 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6300, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10195);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10195, 2, 126, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10195 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10196);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10196, 2, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10196 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6100, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10197);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10197, 2, 122, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10197 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7250, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10198);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10198, 2, 145, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10198 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10199);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10199, 2, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10199 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5400, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10200);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10200, 2, 108, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10200 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6550, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10201);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10201, 2, 131, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10201 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7050, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10202);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10202, 2, 141, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10202 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7050, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10203);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10203, 2, 141, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10203 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4850, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10204);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10204, 2, 97, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10204 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6300, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10205);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10205, 2, 126, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10205 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5950, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10206);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10206, 2, 119, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10206 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5650, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10207);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10207, 2, 113, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10207 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10208);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10208, 2, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10208 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9750, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10209);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10209, 2, 195, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10209 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10210);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10210, 2, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10210 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7300, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10211);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10211, 2, 146, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10211 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8550, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10212);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10212, 2, 171, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10212 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6200, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10213);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10213, 2, 124, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10213 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10214);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10214, 2, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10214 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7000, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10215);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10215, 2, 140, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10215 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5600, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10216);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10216, 2, 112, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10216 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6100, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10217);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10217, 2, 122, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10217 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5900, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10218);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10218, 2, 118, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10218 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7750, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10219);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10219, 2, 155, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10219 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7750, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10220);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10220, 2, 155, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10220 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10221);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10221, 2, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10221 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7100, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10222);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10222, 2, 142, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10222 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4900, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10223);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10223, 2, 98, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10223 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6000, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10224);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10224, 2, 120, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10224 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7550, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10225);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10225, 2, 151, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10225 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7850, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10226);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10226, 2, 157, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10226 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4900, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10227);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10227, 2, 98, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10227 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4950, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10228);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10228, 2, 99, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10228 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7200, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10229);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10229, 2, 144, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10229 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5850, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10230);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10230, 2, 117, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10230 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10231);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10231, 2, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10231 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6600, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10232);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10232, 2, 132, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10232 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7150, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10233);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10233, 2, 143, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10233 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7850, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10234);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10234, 2, 157, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10234 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6150, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10235);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10235, 2, 123, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10235 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4600, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10236);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10236, 2, 92, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10236 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6800, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10237);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10237, 2, 136, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10237 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6000, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10238);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10238, 2, 120, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10238 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7500, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10239);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10239, 2, 150, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10239 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7050, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10240);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10240, 2, 141, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10240 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5900, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10241);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10241, 2, 118, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10241 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6100, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10242);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10242, 2, 122, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10242 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7550, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10243);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10243, 2, 151, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10243 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5500, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10244);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10244, 2, 110, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10244 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6350, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10245);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10245, 2, 127, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10245 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6200, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10246);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10246, 2, 124, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10246 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7250, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10247);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10247, 2, 145, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10247 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7650, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10248);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10248, 2, 153, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10248 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6050, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10249);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10249, 2, 121, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10249 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10250);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10250, 2, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10250 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5300, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10251);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10251, 2, 106, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10251 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6150, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10252);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10252, 2, 123, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10252 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5400, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10253);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10253, 2, 108, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10253 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10254);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10254, 2, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10254 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10255);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10255, 2, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10255 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10256);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10256, 2, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10256 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10257);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10257, 2, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10257 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4950, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10258);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10258, 2, 99, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10258 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5200, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10259);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10259, 2, 104, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10259 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4000, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10260);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10260, 2, 80, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10260 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5550, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10261);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10261, 2, 111, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10261 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10262);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10262, 2, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10262 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10263);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10263, 2, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10263 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10264);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10264, 2, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10264 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10265);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10265, 2, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10265 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5750, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10266);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10266, 2, 115, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10266 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10267);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10267, 2, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10267 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10268);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10268, 2, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10268 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10269);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10269, 2, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10269 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4750, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10270);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10270, 2, 95, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10270 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10271);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10271, 2, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10271 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10272);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10272, 2, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10272 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4000, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10273);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10273, 2, 80, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10273 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10274);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10274, 2, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10274 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10275);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10275, 2, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10275 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10276);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10276, 2, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10276 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10277);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10277, 2, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10277 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4000, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10278);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10278, 2, 80, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10278 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10279);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10279, 2, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10279 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4000, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10280);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10280, 2, 80, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10280 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10281);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10281, 2, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10281 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5850, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10282);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10282, 2, 117, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10282 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10283);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10283, 2, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10283 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4400, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10284);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10284, 2, 88, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10284 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10285);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10285, 2, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10285 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10286);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10286, 2, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10286 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4250, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10287);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10287, 2, 85, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10287 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10288);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10288, 2, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10288 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10289);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10289, 2, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10289 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10290);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10290, 2, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10290 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10291);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10291, 2, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10291 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10292);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10292, 2, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10292 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10293);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10293, 2, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10293 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10294);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10294, 2, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10294 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3450, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10295);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10295, 2, 69, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10295 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5200, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10296);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10296, 2, 104, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10296 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10297);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10297, 2, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10297 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10298);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10298, 2, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10298 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10299);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10299, 2, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10299 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10300);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10300, 2, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10300 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10301);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10301, 2, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10301 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10302);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10302, 2, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10302 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4950, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10303);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10303, 2, 99, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10303 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10304);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10304, 2, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10304 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10305);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10305, 2, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10305 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10306);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10306, 2, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10306 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3450, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10307);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10307, 2, 69, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10307 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10308);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10308, 2, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10308 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10309);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10309, 2, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10309 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10310);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10310, 2, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10310 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3950, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10311);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10311, 2, 79, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10311 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10312);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10312, 2, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10312 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10313);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10313, 2, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10313 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10314);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10314, 2, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10314 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10315);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10315, 2, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10315 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10316);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10316, 2, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10316 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10317);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10317, 2, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10317 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10318);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10318, 2, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10318 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10319);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10319, 2, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10319 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10320);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10320, 2, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10320 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10321);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10321, 2, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10321 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10322);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10322, 2, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10322 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10323);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10323, 2, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10323 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10324);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10324, 2, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10324 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10325);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10325, 2, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10325 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10326);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10326, 2, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10326 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10327);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10327, 2, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10327 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10328);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10328, 2, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10328 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4250, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10329);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10329, 2, 85, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10329 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10330);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10330, 2, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10330 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10331);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10331, 2, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10331 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10332);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10332, 2, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10332 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10333);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10333, 2, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10333 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10334);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10334, 2, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10334 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10335);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10335, 2, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10335 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10336);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10336, 2, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10336 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10337);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10337, 2, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10337 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10338);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10338, 2, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10338 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10339);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10339, 2, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10339 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10340);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10340, 2, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10340 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10341);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10341, 2, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10341 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4250, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10342);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10342, 2, 85, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10342 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10343);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10343, 2, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10343 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10344);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10344, 2, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10344 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10345);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10345, 2, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10345 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10346);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10346, 2, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10346 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10347);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10347, 2, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10347 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10348);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10348, 2, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10348 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10349);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10349, 2, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10349 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10350);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10350, 2, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10350 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5250, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10351);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10351, 2, 105, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10351 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5900, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10352);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10352, 2, 118, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10352 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10353);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10353, 2, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10353 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10354);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10354, 2, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10354 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10355);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10355, 2, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10355 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10356);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10356, 2, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10356 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10357);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10357, 2, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10357 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4750, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10358);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10358, 2, 95, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10358 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4800, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10359);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10359, 2, 96, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10359 AND product_id = 2);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8100, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10360);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10360, 3, 162, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10360 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9250, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10361);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10361, 3, 185, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10361 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7400, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10362);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10362, 3, 148, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10362 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8000, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10363);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10363, 3, 160, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10363 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10000, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10364);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10364, 3, 200, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10364 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6400, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10365);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10365, 3, 128, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10365 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10366);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10366, 3, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10366 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7600, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10367);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10367, 3, 152, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10367 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7700, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10368);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10368, 3, 154, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10368 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10369);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10369, 3, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10369 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7650, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10370);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10370, 3, 153, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10370 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9900, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10371);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10371, 3, 198, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10371 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8400, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10372);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10372, 3, 168, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10372 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7500, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10373);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10373, 3, 150, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10373 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11750, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10374);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10374, 3, 235, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10374 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7850, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10375);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10375, 3, 157, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10375 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10100, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10376);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10376, 3, 202, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10376 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9200, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10377);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10377, 3, 184, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10377 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 14250, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10378);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10378, 3, 285, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10378 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7100, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10379);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10379, 3, 142, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10379 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6700, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10380);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10380, 3, 134, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10380 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8200, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10381);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10381, 3, 164, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10381 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6150, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10382);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10382, 3, 123, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10382 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8350, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10383);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10383, 3, 167, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10383 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8050, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10384);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10384, 3, 161, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10384 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11200, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10385);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10385, 3, 224, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10385 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8650, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10386);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10386, 3, 173, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10386 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9950, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10387);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10387, 3, 199, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10387 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10500, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10388);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10388, 3, 210, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10388 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8400, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10389);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10389, 3, 168, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10389 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8000, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10390);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10390, 3, 160, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10390 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9950, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10391);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10391, 3, 199, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10391 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8900, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10392);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10392, 3, 178, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10392 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10650, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10393);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10393, 3, 213, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10393 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9300, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10394);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10394, 3, 186, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10394 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8700, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10395);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10395, 3, 174, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10395 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6950, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10396);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10396, 3, 139, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10396 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11300, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10397);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10397, 3, 226, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10397 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9250, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10398);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10398, 3, 185, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10398 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13400, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10399);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10399, 3, 268, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10399 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10400);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10400, 3, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10400 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7350, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10401);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10401, 3, 147, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10401 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9500, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10402);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10402, 3, 190, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10402 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9600, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10403);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10403, 3, 192, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10403 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8900, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10404);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10404, 3, 178, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10404 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10450, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10405);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10405, 3, 209, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10405 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9650, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10406);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10406, 3, 193, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10406 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8450, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10407);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10407, 3, 169, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10407 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8350, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10408);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10408, 3, 167, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10408 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10400, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10409);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10409, 3, 208, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10409 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10700, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10410);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10410, 3, 214, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10410 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8050, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10411);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10411, 3, 161, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10411 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7450, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10412);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10412, 3, 149, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10412 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13900, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10413);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10413, 3, 278, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10413 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9200, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10414);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10414, 3, 184, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10414 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7350, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10415);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10415, 3, 147, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10415 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12050, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10416);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10416, 3, 241, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10416 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9950, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10417);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10417, 3, 199, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10417 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11550, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10418);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10418, 3, 231, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10418 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9900, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10419);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10419, 3, 198, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10419 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 15450, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10420);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10420, 3, 309, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10420 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11200, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10421);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10421, 3, 224, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10421 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8050, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10422);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10422, 3, 161, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10422 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11300, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10423);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10423, 3, 226, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10423 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10850, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10424);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10424, 3, 217, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10424 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11900, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10425);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10425, 3, 238, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10425 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8450, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10426);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10426, 3, 169, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10426 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13100, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10427);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10427, 3, 262, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10427 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10350, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10428);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10428, 3, 207, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10428 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6200, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10429);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10429, 3, 124, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10429 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5700, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10430);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10430, 3, 114, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10430 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4800, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10431);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10431, 3, 96, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10431 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10432);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10432, 3, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10432 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7650, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10433);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10433, 3, 153, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10433 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10150, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10434);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10434, 3, 203, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10434 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6300, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10435);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10435, 3, 126, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10435 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7300, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10436);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10436, 3, 146, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10436 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5500, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10437);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10437, 3, 110, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10437 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10438);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10438, 3, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10438 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6850, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10439);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10439, 3, 137, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10439 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7300, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10440);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10440, 3, 146, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10440 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8250, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10441);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10441, 3, 165, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10441 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10442);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10442, 3, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10442 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5800, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10443);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10443, 3, 116, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10443 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5550, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10444);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10444, 3, 111, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10444 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7600, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10445);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10445, 3, 152, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10445 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7300, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10446);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10446, 3, 146, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10446 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5950, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10447);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10447, 3, 119, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10447 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7650, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10448);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10448, 3, 153, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10448 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5200, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10449);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10449, 3, 104, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10449 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5800, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10450);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10450, 3, 116, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10450 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6900, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10451);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10451, 3, 138, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10451 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10452);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10452, 3, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10452 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10453);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10453, 3, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10453 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5550, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10454);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10454, 3, 111, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10454 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6350, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10455);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10455, 3, 127, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10455 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5300, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10456);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10456, 3, 106, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10456 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10457);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10457, 3, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10457 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5500, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10458);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10458, 3, 110, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10458 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4900, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10459);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10459, 3, 98, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10459 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7750, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10460);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10460, 3, 155, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10460 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6000, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10461);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10461, 3, 120, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10461 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6400, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10462);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10462, 3, 128, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10462 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5550, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10463);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10463, 3, 111, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10463 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10464);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10464, 3, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10464 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5750, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10465);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10465, 3, 115, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10465 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10466);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10466, 3, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10466 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10467);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10467, 3, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10467 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5450, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10468);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10468, 3, 109, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10468 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10469);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10469, 3, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10469 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10470);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10470, 3, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10470 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10471);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10471, 3, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10471 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4600, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10472);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10472, 3, 92, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10472 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7150, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10473);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10473, 3, 143, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10473 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7350, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10474);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10474, 3, 147, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10474 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5700, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10475);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10475, 3, 114, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10475 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7700, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10476);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10476, 3, 154, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10476 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5550, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10477);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10477, 3, 111, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10477 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7350, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10478);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10478, 3, 147, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10478 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6900, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10479);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10479, 3, 138, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10479 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10480);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10480, 3, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10480 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10481);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10481, 3, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10481 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10482);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10482, 3, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10482 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7300, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10483);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10483, 3, 146, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10483 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10484);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10484, 3, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10484 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3950, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10485);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10485, 3, 79, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10485 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5300, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10486);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10486, 3, 106, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10486 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4950, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10487);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10487, 3, 99, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10487 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7400, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10488);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10488, 3, 148, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10488 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10489);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10489, 3, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10489 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7050, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10490);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10490, 3, 141, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10490 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10491);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10491, 3, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10491 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5050, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10492);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10492, 3, 101, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10492 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5150, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10493);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10493, 3, 103, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10493 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7250, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10494);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10494, 3, 145, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10494 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6400, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10495);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10495, 3, 128, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10495 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10496);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10496, 3, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10496 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6900, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10497);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10497, 3, 138, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10497 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4650, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10498);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10498, 3, 93, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10498 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4000, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10499);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10499, 3, 80, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10499 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10500);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10500, 3, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10500 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7650, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10501);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10501, 3, 153, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10501 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4700, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10502);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10502, 3, 94, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10502 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10503);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10503, 3, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10503 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10504);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10504, 3, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10504 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10505);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10505, 3, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10505 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4650, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10506);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10506, 3, 93, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10506 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5250, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10507);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10507, 3, 105, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10507 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6100, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10508);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10508, 3, 122, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10508 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5300, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10509);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10509, 3, 106, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10509 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10510);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10510, 3, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10510 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10511);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10511, 3, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10511 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5300, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10512);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10512, 3, 106, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10512 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10513);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10513, 3, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10513 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5600, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10514);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10514, 3, 112, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10514 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6850, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10515);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10515, 3, 137, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10515 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10516);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10516, 3, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10516 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5300, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10517);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10517, 3, 106, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10517 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7600, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10518);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10518, 3, 152, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10518 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6250, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10519);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10519, 3, 125, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10519 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4000, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10520);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10520, 3, 80, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10520 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6800, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10521);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10521, 3, 136, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10521 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5700, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10522);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10522, 3, 114, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10522 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6900, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10523);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10523, 3, 138, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10523 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5650, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10524);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10524, 3, 113, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10524 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5600, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10525);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10525, 3, 112, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10525 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10526);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10526, 3, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10526 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5500, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10527);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10527, 3, 110, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10527 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10528);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10528, 3, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10528 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5650, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10529);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10529, 3, 113, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10529 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7150, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10530);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10530, 3, 143, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10530 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4950, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10531);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10531, 3, 99, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10531 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7850, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10532);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10532, 3, 157, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10532 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4900, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10533);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10533, 3, 98, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10533 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10534);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10534, 3, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10534 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10535);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10535, 3, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10535 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5850, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10536);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10536, 3, 117, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10536 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6350, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10537);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10537, 3, 127, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10537 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7800, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10538);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10538, 3, 156, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10538 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7500, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10539);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10539, 3, 150, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10539 AND product_id = 3);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11250, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10540);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10540, 4, 225, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10540 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8300, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10541);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10541, 4, 166, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10541 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10850, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10542);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10542, 4, 217, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10542 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12250, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10543);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10543, 4, 245, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10543 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7600, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10544);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10544, 4, 152, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10544 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8000, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10545);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10545, 4, 160, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10545 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9350, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10546);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10546, 4, 187, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10546 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9800, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10547);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10547, 4, 196, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10547 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10700, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10548);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10548, 4, 214, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10548 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9250, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10549);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10549, 4, 185, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10549 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10300, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10550);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10550, 4, 206, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10550 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11950, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10551);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10551, 4, 239, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10551 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10800, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10552);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10552, 4, 216, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10552 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9050, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10553);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10553, 4, 181, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10553 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12400, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10554);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10554, 4, 248, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10554 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11100, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10555);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10555, 4, 222, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10555 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11000, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10556);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10556, 4, 220, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10556 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11100, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10557);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10557, 4, 222, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10557 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 15150, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10558);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10558, 4, 303, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10558 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10050, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10559);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10559, 4, 201, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10559 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10600, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10560);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10560, 4, 212, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10560 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 15750, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10561);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10561, 4, 315, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10561 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13600, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10562);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10562, 4, 272, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10562 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11450, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10563);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10563, 4, 229, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10563 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 14250, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10564);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10564, 4, 285, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10564 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13650, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10565);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10565, 4, 273, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10565 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7600, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10566);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10566, 4, 152, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10566 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8750, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10567);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10567, 4, 175, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10567 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8750, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10568);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10568, 4, 175, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10568 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11550, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10569);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10569, 4, 231, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10569 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12300, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10570);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10570, 4, 246, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10570 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 15350, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10571);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10571, 4, 307, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10571 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 15500, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10572);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10572, 4, 310, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10572 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10750, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10573);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10573, 4, 215, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10573 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11800, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10574);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10574, 4, 236, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10574 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8300, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10575);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10575, 4, 166, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10575 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12850, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10576);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10576, 4, 257, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10576 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13900, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10577);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10577, 4, 278, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10577 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9700, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10578);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10578, 4, 194, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10578 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 17550, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10579);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10579, 4, 351, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10579 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11850, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10580);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10580, 4, 237, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10580 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10000, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10581);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10581, 4, 200, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10581 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13750, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10582);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10582, 4, 275, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10582 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 16900, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10583);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10583, 4, 338, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10583 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13000, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10584);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10584, 4, 260, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10584 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13150, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10585);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10585, 4, 263, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10585 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 14150, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10586);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10586, 4, 283, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10586 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10000, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10587);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10587, 4, 200, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10587 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12150, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10588);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10588, 4, 243, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10588 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11100, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10589);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10589, 4, 222, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10589 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12900, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10590);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10590, 4, 258, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10590 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11900, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10591);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10591, 4, 238, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10591 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13750, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10592);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10592, 4, 275, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10592 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 16200, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10593);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10593, 4, 324, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10593 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13400, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10594);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10594, 4, 268, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10594 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10100, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10595);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10595, 4, 202, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10595 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12400, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10596);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10596, 4, 248, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10596 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11050, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10597);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10597, 4, 221, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10597 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12100, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10598);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10598, 4, 242, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10598 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13700, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10599);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10599, 4, 274, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10599 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 17350, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10600);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10600, 4, 347, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10600 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10100, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10601);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10601, 4, 202, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10601 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12500, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10602);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10602, 4, 250, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10602 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 15700, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10603);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10603, 4, 314, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10603 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13850, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10604);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10604, 4, 277, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10604 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 16750, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10605);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10605, 4, 335, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10605 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11550, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10606);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10606, 4, 231, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10606 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12800, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10607);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10607, 4, 256, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10607 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8650, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10608);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10608, 4, 173, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10608 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 13650, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10609);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10609, 4, 273, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10609 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10050, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10610);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10610, 4, 201, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10610 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9050, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10611);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10611, 4, 181, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10611 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9550, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10612);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10612, 4, 191, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10612 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7600, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10613);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10613, 4, 152, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10613 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 15050, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10614);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10614, 4, 301, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10614 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8400, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10615);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10615, 4, 168, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10615 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7950, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10616);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10616, 4, 159, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10616 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10200, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10617);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10617, 4, 204, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10617 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9850, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10618);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10618, 4, 197, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10618 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9500, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10619);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10619, 4, 190, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10619 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8100, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10620);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10620, 4, 162, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10620 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11800, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10621);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10621, 4, 236, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10621 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10600, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10622);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10622, 4, 212, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10622 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9400, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10623);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10623, 4, 188, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10623 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11400, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10624);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10624, 4, 228, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10624 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8500, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10625);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10625, 4, 170, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10625 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7850, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10626);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10626, 4, 157, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10626 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9050, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10627);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10627, 4, 181, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10627 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11150, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10628);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10628, 4, 223, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10628 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9650, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10629);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10629, 4, 193, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10629 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5850, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10630);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10630, 4, 117, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10630 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9900, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10631);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10631, 4, 198, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10631 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7850, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10632);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10632, 4, 157, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10632 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7550, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10633);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10633, 4, 151, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10633 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6800, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10634);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10634, 4, 136, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10634 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7250, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10635);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10635, 4, 145, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10635 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8150, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10636);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10636, 4, 163, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10636 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6900, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10637);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10637, 4, 138, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10637 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10638);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10638, 4, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10638 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6450, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10639);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10639, 4, 129, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10639 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7650, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10640);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10640, 4, 153, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10640 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10050, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10641);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10641, 4, 201, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10641 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9250, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10642);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10642, 4, 185, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10642 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5600, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10643);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10643, 4, 112, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10643 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6550, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10644);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10644, 4, 131, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10644 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7700, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10645);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10645, 4, 154, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10645 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4750, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10646);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10646, 4, 95, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10646 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7950, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10647);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10647, 4, 159, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10647 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7750, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10648);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10648, 4, 155, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10648 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10600, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10649);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10649, 4, 212, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10649 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9200, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10650);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10650, 4, 184, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10650 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7950, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10651);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10651, 4, 159, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10651 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7700, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10652);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10652, 4, 154, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10652 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10653);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10653, 4, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10653 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11100, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10654);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10654, 4, 222, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10654 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8050, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10655);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10655, 4, 161, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10655 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9600, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10656);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10656, 4, 192, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10656 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7150, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10657);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10657, 4, 143, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10657 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7000, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10658);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10658, 4, 140, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10658 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7800, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10659);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10659, 4, 156, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10659 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10660);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10660, 4, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10660 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4400, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10661);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10661, 4, 88, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10661 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7950, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10662);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10662, 4, 159, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10662 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8800, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10663);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10663, 4, 176, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10663 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6450, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10664);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10664, 4, 129, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10664 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6900, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10665);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10665, 4, 138, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10665 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7700, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10666);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10666, 4, 154, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10666 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9800, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10667);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10667, 4, 196, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10667 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4850, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10668);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10668, 4, 97, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10668 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9350, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10669);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10669, 4, 187, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10669 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11450, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10670);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10670, 4, 229, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10670 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5000, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10671);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10671, 4, 100, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10671 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6500, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10672);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10672, 4, 130, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10672 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7600, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10673);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10673, 4, 152, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10673 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6350, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10674);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10674, 4, 127, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10674 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7100, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10675);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10675, 4, 142, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10675 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6700, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10676);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10676, 4, 134, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10676 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 12250, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10677);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10677, 4, 245, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10677 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8300, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10678);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10678, 4, 166, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10678 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8200, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10679);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10679, 4, 164, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10679 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9000, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10680);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10680, 4, 180, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10680 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10681);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10681, 4, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10681 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7500, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10682);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10682, 4, 150, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10682 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8750, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10683);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10683, 4, 175, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10683 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8000, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10684);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10684, 4, 160, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10684 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8150, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10685);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10685, 4, 163, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10685 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6700, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10686);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10686, 4, 134, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10686 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7750, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10687);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10687, 4, 155, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10687 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9100, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10688);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10688, 4, 182, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10688 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8800, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10689);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10689, 4, 176, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10689 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10690);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10690, 4, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10690 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7000, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10691);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10691, 4, 140, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10691 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6250, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10692);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10692, 4, 125, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10692 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7750, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10693);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10693, 4, 155, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10693 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9100, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10694);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10694, 4, 182, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10694 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8000, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10695);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10695, 4, 160, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10695 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8800, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10696);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10696, 4, 176, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10696 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6850, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10697);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10697, 4, 137, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10697 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11550, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10698);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10698, 4, 231, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10698 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7400, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10699);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10699, 4, 148, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10699 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6650, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10700);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10700, 4, 133, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10700 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9850, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10701);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10701, 4, 197, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10701 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7650, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10702);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10702, 4, 153, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10702 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6750, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10703);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10703, 4, 135, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10703 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6600, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10704);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10704, 4, 132, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10704 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11300, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10705);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10705, 4, 226, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10705 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6300, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10706);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10706, 4, 126, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10706 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9350, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10707);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10707, 4, 187, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10707 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6000, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10708);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10708, 4, 120, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10708 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 11000, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10709);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10709, 4, 220, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10709 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9050, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10710);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10710, 4, 181, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10710 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8700, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10711);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10711, 4, 174, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10711 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9750, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10712);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10712, 4, 195, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10712 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8500, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10713);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10713, 4, 170, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10713 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 7550, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10714);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10714, 4, 151, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10714 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10450, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10715);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10715, 4, 209, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10715 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9150, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10716);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10716, 4, 183, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10716 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 9250, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10717);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10717, 4, 185, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10717 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 8550, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10718);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10718, 4, 171, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10718 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 10850, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10719);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10719, 4, 217, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10719 AND product_id = 4);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10720);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10720, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10720 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 750, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10721);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10721, 5, 15, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10721 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10722);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10722, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10722 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10723);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10723, 5, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10723 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10724);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10724, 5, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10724 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10725);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10725, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10725 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 850, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10726);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10726, 5, 17, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10726 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10727);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10727, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10727 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10728);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10728, 5, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10728 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10729);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10729, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10729 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10730);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10730, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10730 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10731);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10731, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10731 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10732);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10732, 5, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10732 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 650, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10733);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10733, 5, 13, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10733 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10734);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10734, 5, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10734 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10735);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10735, 5, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10735 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10736);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10736, 5, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10736 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10737);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10737, 5, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10737 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10738);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10738, 5, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10738 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10739);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10739, 5, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10739 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10740);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10740, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10740 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10741);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10741, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10741 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10742);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10742, 5, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10742 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10743);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10743, 5, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10743 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10744);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10744, 5, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10744 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10745);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10745, 5, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10745 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10746);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10746, 5, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10746 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10747);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10747, 5, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10747 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10748);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10748, 5, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10748 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10749);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10749, 5, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10749 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10750);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10750, 5, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10750 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10751);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10751, 5, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10751 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10752);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10752, 5, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10752 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10753);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10753, 5, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10753 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10754);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10754, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10754 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10755);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10755, 5, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10755 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10756);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10756, 5, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10756 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10757);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10757, 5, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10757 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10758);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10758, 5, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10758 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10759);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10759, 5, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10759 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10760);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10760, 5, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10760 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10761);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10761, 5, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10761 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10762);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10762, 5, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10762 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10763);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10763, 5, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10763 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10764);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10764, 5, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10764 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10765);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10765, 5, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10765 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10766);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10766, 5, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10766 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10767);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10767, 5, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10767 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10768);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10768, 5, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10768 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10769);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10769, 5, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10769 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10770);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10770, 5, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10770 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10771);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10771, 5, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10771 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10772);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10772, 5, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10772 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10773);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10773, 5, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10773 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10774);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10774, 5, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10774 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10775);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10775, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10775 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10776);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10776, 5, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10776 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10777);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10777, 5, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10777 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10778);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10778, 5, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10778 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10779);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10779, 5, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10779 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10780);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10780, 5, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10780 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10781);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10781, 5, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10781 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10782);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10782, 5, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10782 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10783);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10783, 5, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10783 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10784);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10784, 5, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10784 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10785);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10785, 5, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10785 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10786);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10786, 5, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10786 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10787);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10787, 5, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10787 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10788);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10788, 5, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10788 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10789);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10789, 5, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10789 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10790);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10790, 5, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10790 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10791);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10791, 5, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10791 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10792);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10792, 5, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10792 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 850, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10793);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10793, 5, 17, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10793 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10794);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10794, 5, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10794 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10795);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10795, 5, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10795 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10796);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10796, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10796 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10797);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10797, 5, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10797 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10798);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10798, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10798 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10799);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10799, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10799 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10800);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10800, 5, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10800 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10801);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10801, 5, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10801 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10802);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10802, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10802 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10803);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10803, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10803 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10804);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10804, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10804 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10805);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10805, 5, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10805 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10806);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10806, 5, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10806 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10807);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10807, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10807 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10808);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10808, 5, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10808 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10809);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10809, 5, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10809 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 750, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10810);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10810, 5, 15, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10810 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 750, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10811);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10811, 5, 15, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10811 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10812);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10812, 5, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10812 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10813);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10813, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10813 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 850, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10814);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10814, 5, 17, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10814 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10815);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10815, 5, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10815 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10816);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10816, 5, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10816 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10817);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10817, 5, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10817 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10818);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10818, 5, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10818 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10819);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10819, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10819 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 600, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10820);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10820, 5, 12, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10820 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10821);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10821, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10821 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10822);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10822, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10822 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 550, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10823);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10823, 5, 11, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10823 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10824);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10824, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10824 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 750, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10825);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10825, 5, 15, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10825 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 750, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10826);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10826, 5, 15, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10826 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 550, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10827);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10827, 5, 11, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10827 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 550, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10828);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10828, 5, 11, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10828 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 650, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10829);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10829, 5, 13, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10829 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10830);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10830, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10830 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10831);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10831, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10831 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 450, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10832);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10832, 5, 9, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10832 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 450, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10833);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10833, 5, 9, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10833 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10834);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10834, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10834 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10835);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10835, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10835 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10836);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10836, 5, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10836 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10837);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10837, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10837 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 450, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10838);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10838, 5, 9, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10838 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 450, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10839);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10839, 5, 9, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10839 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 250, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10840);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10840, 5, 5, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10840 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10841);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10841, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10841 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10842);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10842, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10842 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10843);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10843, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10843 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10844);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10844, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10844 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10845);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10845, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10845 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10846);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10846, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10846 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10847);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10847, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10847 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10848);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10848, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10848 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10849);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10849, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10849 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10850);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10850, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10850 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10851);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10851, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10851 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 250, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10852);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10852, 5, 5, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10852 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10853);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10853, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10853 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10854);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10854, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10854 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10855);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10855, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10855 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10856);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10856, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10856 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10857);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10857, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10857 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 250, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10858);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10858, 5, 5, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10858 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10859);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10859, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10859 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10860);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10860, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10860 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 250, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10861);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10861, 5, 5, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10861 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10862);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10862, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10862 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10863);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10863, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10863 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10864);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10864, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10864 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10865);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10865, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10865 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10866);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10866, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10866 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10867);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10867, 5, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10867 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10868);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10868, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10868 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10869);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10869, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10869 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 250, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10870);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10870, 5, 5, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10870 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 250, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10871);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10871, 5, 5, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10871 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10872);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10872, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10872 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 300, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10873);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10873, 5, 6, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10873 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10874);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10874, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10874 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 550, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10875);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10875, 5, 11, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10875 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10876);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10876, 5, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10876 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 450, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10877);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10877, 5, 9, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10877 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 550, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10878);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10878, 5, 11, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10878 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10879);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10879, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10879 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 600, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10880);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10880, 5, 12, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10880 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10881);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10881, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10881 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10882);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10882, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10882 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 650, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10883);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10883, 5, 13, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10883 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 650, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10884);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10884, 5, 13, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10884 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10885);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10885, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10885 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 600, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10886);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10886, 5, 12, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10886 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 500, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10887);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10887, 5, 10, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10887 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10888);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10888, 5, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10888 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10889);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10889, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10889 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10890);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10890, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10890 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 750, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10891);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10891, 5, 15, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10891 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10892);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10892, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10892 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10893);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10893, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10893 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10894);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10894, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10894 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10895);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10895, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10895 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 800, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10896);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10896, 5, 16, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10896 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10897);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10897, 5, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10897 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10898);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10898, 5, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10898 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10899);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10899, 5, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10899 AND product_id = 5);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10900);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10900, 6, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10900 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10901);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10901, 6, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10901 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10902);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10902, 6, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10902 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10903);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10903, 6, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10903 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10904);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10904, 6, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10904 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10905);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10905, 6, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10905 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10906);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10906, 6, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10906 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10907);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10907, 6, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10907 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10908);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10908, 6, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10908 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10909);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10909, 6, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10909 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10910);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10910, 6, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10910 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10911);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10911, 6, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10911 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10912);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10912, 6, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10912 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10913);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10913, 6, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10913 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10914);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10914, 6, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10914 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10915);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10915, 6, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10915 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3950, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10916);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10916, 6, 79, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10916 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10917);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10917, 6, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10917 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10918);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10918, 6, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10918 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10919);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10919, 6, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10919 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10920);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10920, 6, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10920 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10921);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10921, 6, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10921 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10922);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10922, 6, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10922 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10923);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10923, 6, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10923 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10924);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10924, 6, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10924 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3450, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10925);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10925, 6, 69, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10925 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10926);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10926, 6, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10926 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10927);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10927, 6, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10927 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4650, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10928);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10928, 6, 93, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10928 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10929);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10929, 6, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10929 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10930);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10930, 6, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10930 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4900, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10931);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10931, 6, 98, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10931 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10932);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10932, 6, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10932 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10933);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10933, 6, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10933 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10934);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10934, 6, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10934 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10935);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10935, 6, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10935 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10936);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10936, 6, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10936 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10937);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10937, 6, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10937 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10938);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10938, 6, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10938 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10939);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10939, 6, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10939 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10940);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10940, 6, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10940 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3800, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10941);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10941, 6, 76, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10941 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4350, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10942);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10942, 6, 87, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10942 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10943);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10943, 6, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10943 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5100, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10944);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10944, 6, 102, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10944 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10945);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10945, 6, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10945 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10946);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10946, 6, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10946 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10947);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10947, 6, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10947 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10948);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10948, 6, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10948 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4200, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10949);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10949, 6, 84, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10949 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3900, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10950);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10950, 6, 78, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10950 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10951);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10951, 6, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10951 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10952);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10952, 6, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10952 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5950, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10953);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10953, 6, 119, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10953 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10954);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10954, 6, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10954 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10955);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10955, 6, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10955 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4300, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10956);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10956, 6, 86, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10956 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4400, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10957);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10957, 6, 88, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10957 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10958);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10958, 6, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10958 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4400, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10959);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10959, 6, 88, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10959 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5450, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10960);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10960, 6, 109, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10960 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4450, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10961);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10961, 6, 89, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10961 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10962);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10962, 6, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10962 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4600, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10963);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10963, 6, 92, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10963 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10964);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10964, 6, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10964 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 5050, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10965);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10965, 6, 101, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10965 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10966);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10966, 6, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10966 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 6300, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10967);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10967, 6, 126, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10967 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10968);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10968, 6, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10968 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10969);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10969, 6, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10969 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10970);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10970, 6, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10970 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10971);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10971, 6, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10971 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10972);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10972, 6, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10972 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10973);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10973, 6, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10973 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10974);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10974, 6, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10974 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10975);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10975, 6, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10975 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10976);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10976, 6, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10976 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10977);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10977, 6, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10977 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10978);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10978, 6, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10978 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10979);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10979, 6, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10979 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10980);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10980, 6, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10980 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10981);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10981, 6, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10981 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10982);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10982, 6, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10982 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10983);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10983, 6, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10983 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10984);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10984, 6, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10984 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10985);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10985, 6, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10985 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10986);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10986, 6, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10986 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10987);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10987, 6, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10987 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10988);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10988, 6, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10988 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10989);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10989, 6, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10989 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10990);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10990, 6, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10990 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10991);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10991, 6, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10991 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10992);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10992, 6, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10992 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10993);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10993, 6, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10993 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10994);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10994, 6, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10994 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10995);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10995, 6, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10995 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10996);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10996, 6, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10996 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10997);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10997, 6, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10997 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10998);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10998, 6, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10998 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 10999);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 10999, 6, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 10999 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11000);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11000, 6, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11000 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11001);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11001, 6, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11001 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11002);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11002, 6, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11002 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11003);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11003, 6, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11003 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11004);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11004, 6, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11004 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11005);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11005, 6, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11005 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11006);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11006, 6, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11006 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11007);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11007, 6, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11007 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11008);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11008, 6, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11008 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11009);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11009, 6, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11009 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11010);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11010, 6, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11010 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11011);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11011, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11011 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11012);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11012, 6, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11012 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11013);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11013, 6, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11013 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11014);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11014, 6, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11014 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11015);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11015, 6, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11015 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11016);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11016, 6, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11016 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11017);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11017, 6, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11017 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11018);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11018, 6, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11018 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11019);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11019, 6, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11019 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11020);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11020, 6, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11020 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11021);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11021, 6, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11021 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11022);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11022, 6, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11022 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11023);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11023, 6, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11023 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11024);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11024, 6, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11024 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11025);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11025, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11025 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11026);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11026, 6, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11026 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11027);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11027, 6, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11027 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11028);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11028, 6, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11028 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11029);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11029, 6, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11029 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11030);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11030, 6, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11030 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11031);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11031, 6, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11031 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11032);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11032, 6, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11032 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11033);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11033, 6, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11033 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11034);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11034, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11034 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11035);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11035, 6, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11035 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11036);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11036, 6, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11036 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11037);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11037, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11037 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11038);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11038, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11038 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11039);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11039, 6, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11039 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11040);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11040, 6, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11040 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11041);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11041, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11041 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11042);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11042, 6, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11042 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11043);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11043, 6, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11043 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11044);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11044, 6, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11044 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11045);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11045, 6, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11045 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11046);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11046, 6, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11046 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11047);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11047, 6, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11047 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11048);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11048, 6, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11048 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11049);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11049, 6, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11049 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 600, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11050);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11050, 6, 12, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11050 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11051);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11051, 6, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11051 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11052);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11052, 6, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11052 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11053);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11053, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11053 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11054);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11054, 6, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11054 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11055);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11055, 6, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11055 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11056);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11056, 6, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11056 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11057);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11057, 6, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11057 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11058);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11058, 6, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11058 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11059);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11059, 6, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11059 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11060);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11060, 6, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11060 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11061);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11061, 6, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11061 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11062);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11062, 6, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11062 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11063);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11063, 6, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11063 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11064);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11064, 6, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11064 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11065);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11065, 6, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11065 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11066);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11066, 6, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11066 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11067);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11067, 6, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11067 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11068);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11068, 6, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11068 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11069);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11069, 6, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11069 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11070);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11070, 6, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11070 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11071);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11071, 6, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11071 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11072);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11072, 6, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11072 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11073);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11073, 6, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11073 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11074);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11074, 6, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11074 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11075);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11075, 6, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11075 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11076);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11076, 6, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11076 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11077);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11077, 6, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11077 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11078);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11078, 6, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11078 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11079);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11079, 6, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11079 AND product_id = 6);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11080);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11080, 7, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11080 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11081);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11081, 7, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11081 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11082);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11082, 7, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11082 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11083);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11083, 7, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11083 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11084);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11084, 7, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11084 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11085);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11085, 7, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11085 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11086);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11086, 7, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11086 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11087);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11087, 7, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11087 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11088);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11088, 7, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11088 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11089);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11089, 7, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11089 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11090);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11090, 7, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11090 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11091);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11091, 7, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11091 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11092);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11092, 7, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11092 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11093);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11093, 7, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11093 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11094);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11094, 7, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11094 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11095);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11095, 7, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11095 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11096);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11096, 7, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11096 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11097);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11097, 7, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11097 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11098);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11098, 7, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11098 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11099);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11099, 7, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11099 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11100);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11100, 7, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11100 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11101);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11101, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11101 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11102);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11102, 7, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11102 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11103);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11103, 7, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11103 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11104);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11104, 7, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11104 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11105);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11105, 7, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11105 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11106);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11106, 7, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11106 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11107);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11107, 7, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11107 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11108);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11108, 7, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11108 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11109);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11109, 7, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11109 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2500, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11110);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11110, 7, 50, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11110 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11111);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11111, 7, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11111 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11112);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11112, 7, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11112 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11113);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11113, 7, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11113 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11114);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11114, 7, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11114 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11115);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11115, 7, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11115 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3600, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11116);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11116, 7, 72, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11116 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11117);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11117, 7, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11117 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11118);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11118, 7, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11118 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11119);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11119, 7, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11119 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11120);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11120, 7, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11120 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11121);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11121, 7, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11121 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11122);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11122, 7, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11122 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11123);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11123, 7, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11123 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3450, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11124);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11124, 7, 69, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11124 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11125);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11125, 7, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11125 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11126);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11126, 7, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11126 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11127);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11127, 7, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11127 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11128);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11128, 7, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11128 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11129);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11129, 7, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11129 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11130);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11130, 7, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11130 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11131);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11131, 7, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11131 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3500, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11132);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11132, 7, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11132 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11133);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11133, 7, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11133 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11134);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11134, 7, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11134 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11135);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11135, 7, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11135 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11136);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11136, 7, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11136 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11137);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11137, 7, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11137 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11138);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11138, 7, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11138 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11139);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11139, 7, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11139 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11140);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11140, 7, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11140 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11141);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11141, 7, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11141 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11142);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11142, 7, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11142 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11143);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11143, 7, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11143 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11144);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11144, 7, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11144 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11145);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11145, 7, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11145 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11146);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11146, 7, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11146 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11147);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11147, 7, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11147 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11148);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11148, 7, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11148 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11149);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11149, 7, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11149 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11150);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11150, 7, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11150 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11151);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11151, 7, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11151 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11152);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11152, 7, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11152 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11153);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11153, 7, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11153 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11154);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11154, 7, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11154 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11155);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11155, 7, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11155 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11156);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11156, 7, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11156 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11157);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11157, 7, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11157 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11158);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11158, 7, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11158 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11159);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11159, 7, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11159 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11160);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11160, 7, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11160 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11161);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11161, 7, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11161 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11162);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11162, 7, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11162 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11163);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11163, 7, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11163 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11164);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11164, 7, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11164 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11165);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11165, 7, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11165 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11166);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11166, 7, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11166 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11167);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11167, 7, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11167 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11168);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11168, 7, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11168 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11169);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11169, 7, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11169 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11170);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11170, 7, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11170 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11171);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11171, 7, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11171 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11172);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11172, 7, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11172 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11173);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11173, 7, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11173 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11174);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11174, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11174 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11175);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11175, 7, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11175 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11176);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11176, 7, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11176 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11177);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11177, 7, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11177 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11178);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11178, 7, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11178 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11179);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11179, 7, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11179 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11180);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11180, 7, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11180 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11181);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11181, 7, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11181 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11182);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11182, 7, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11182 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11183);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11183, 7, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11183 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11184);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11184, 7, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11184 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11185);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11185, 7, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11185 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11186);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11186, 7, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11186 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11187);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11187, 7, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11187 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11188);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11188, 7, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11188 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11189);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11189, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11189 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11190);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11190, 7, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11190 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11191);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11191, 7, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11191 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11192);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11192, 7, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11192 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11193);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11193, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11193 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11194);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11194, 7, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11194 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11195);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11195, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11195 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11196);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11196, 7, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11196 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11197);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11197, 7, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11197 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11198);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11198, 7, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11198 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11199);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11199, 7, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11199 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 400, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11200);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11200, 7, 8, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11200 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11201);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11201, 7, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11201 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11202);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11202, 7, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11202 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11203);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11203, 7, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11203 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11204);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11204, 7, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11204 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11205);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11205, 7, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11205 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11206);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11206, 7, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11206 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11207);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11207, 7, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11207 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11208);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11208, 7, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11208 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11209);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11209, 7, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11209 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11210);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11210, 7, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11210 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11211);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11211, 7, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11211 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 900, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11212);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11212, 7, 18, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11212 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11213);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11213, 7, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11213 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11214);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11214, 7, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11214 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11215);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11215, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11215 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11216);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11216, 7, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11216 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11217);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11217, 7, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11217 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11218);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11218, 7, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11218 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11219);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11219, 7, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11219 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1000, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11220);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11220, 7, 20, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11220 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11221);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11221, 7, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11221 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11222);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11222, 7, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11222 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11223);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11223, 7, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11223 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11224);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11224, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11224 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11225);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11225, 7, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11225 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1050, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11226);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11226, 7, 21, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11226 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11227);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11227, 7, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11227 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11228);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11228, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11228 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11229);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11229, 7, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11229 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 350, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11230);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11230, 7, 7, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11230 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 700, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11231);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11231, 7, 14, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11231 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11232);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11232, 7, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11232 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11233);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11233, 7, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11233 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11234);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11234, 7, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11234 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11235);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11235, 7, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11235 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11236);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11236, 7, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11236 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11237);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11237, 7, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11237 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11238);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11238, 7, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11238 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11239);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11239, 7, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11239 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11240);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11240, 7, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11240 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11241);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11241, 7, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11241 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11242);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11242, 7, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11242 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11243);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11243, 7, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11243 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11244);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11244, 7, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11244 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11245);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11245, 7, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11245 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11246);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11246, 7, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11246 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1150, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11247);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11247, 7, 23, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11247 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11248);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11248, 7, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11248 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1200, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11249);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11249, 7, 24, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11249 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11250);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11250, 7, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11250 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11251);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11251, 7, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11251 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11252);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11252, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11252 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11253);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11253, 7, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11253 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11254);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11254, 7, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11254 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11255);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11255, 7, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11255 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11256);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11256, 7, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11256 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11257);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11257, 7, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11257 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11258);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11258, 7, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11258 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11259);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11259, 7, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11259 AND product_id = 7);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-06-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11260);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11260, 8, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11260 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2550, 'delivered', '2025-06-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11261);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11261, 8, 51, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11261 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-06-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11262);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11262, 8, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11262 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-06-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11263);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11263, 8, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11263 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-06-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11264);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11264, 8, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11264 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-06-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11265);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11265, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11265 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-06-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11266);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11266, 8, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11266 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-06-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11267);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11267, 8, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11267 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-06-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11268);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11268, 8, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11268 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-06-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11269);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11269, 8, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11269 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-06-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11270);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11270, 8, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11270 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-06-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11271);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11271, 8, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11271 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-06-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11272);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11272, 8, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11272 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-06-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11273);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11273, 8, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11273 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-06-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11274);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11274, 8, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11274 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-06-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11275);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11275, 8, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11275 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4050, 'delivered', '2025-06-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11276);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11276, 8, 81, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11276 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-06-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11277);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11277, 8, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11277 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-06-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11278);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11278, 8, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11278 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-07-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11279);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11279, 8, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11279 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-07-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11280);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11280, 8, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11280 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-07-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11281);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11281, 8, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11281 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-07-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11282);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11282, 8, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11282 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-07-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11283);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11283, 8, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11283 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-07-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11284);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11284, 8, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11284 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-07-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11285);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11285, 8, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11285 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-07-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11286);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11286, 8, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11286 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-07-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11287);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11287, 8, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11287 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-07-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11288);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11288, 8, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11288 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-07-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11289);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11289, 8, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11289 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-07-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11290);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11290, 8, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11290 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4400, 'delivered', '2025-07-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11291);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11291, 8, 88, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11291 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-07-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11292);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11292, 8, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11292 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-07-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11293);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11293, 8, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11293 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2800, 'delivered', '2025-07-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11294);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11294, 8, 56, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11294 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3200, 'delivered', '2025-07-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11295);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11295, 8, 64, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11295 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3700, 'delivered', '2025-07-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11296);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11296, 8, 74, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11296 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-07-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11297);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11297, 8, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11297 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3450, 'delivered', '2025-07-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11298);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11298, 8, 69, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11298 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-07-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11299);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11299, 8, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11299 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-07-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11300);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11300, 8, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11300 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-07-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11301);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11301, 8, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11301 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-07-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11302);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11302, 8, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11302 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-07-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11303);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11303, 8, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11303 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-07-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11304);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11304, 8, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11304 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-07-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11305);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11305, 8, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11305 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-07-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11306);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11306, 8, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11306 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-07-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11307);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11307, 8, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11307 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3350, 'delivered', '2025-07-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11308);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11308, 8, 67, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11308 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3650, 'delivered', '2025-07-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11309);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11309, 8, 73, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11309 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-08-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11310);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11310, 8, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11310 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3850, 'delivered', '2025-08-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11311);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11311, 8, 77, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11311 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4150, 'delivered', '2025-08-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11312);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11312, 8, 83, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11312 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4500, 'delivered', '2025-08-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11313);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11313, 8, 90, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11313 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3100, 'delivered', '2025-08-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11314);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11314, 8, 62, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11314 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-08-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11315);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11315, 8, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11315 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2900, 'delivered', '2025-08-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11316);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11316, 8, 58, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11316 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3300, 'delivered', '2025-08-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11317);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11317, 8, 66, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11317 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3150, 'delivered', '2025-08-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11318);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11318, 8, 63, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11318 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-08-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11319);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11319, 8, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11319 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4250, 'delivered', '2025-08-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11320);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11320, 8, 85, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11320 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3400, 'delivered', '2025-08-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11321);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11321, 8, 68, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11321 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-08-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11322);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11322, 8, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11322 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3750, 'delivered', '2025-08-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11323);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11323, 8, 75, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11323 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3550, 'delivered', '2025-08-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11324);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11324, 8, 71, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11324 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-08-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11325);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11325, 8, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11325 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-08-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11326);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11326, 8, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11326 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 4100, 'delivered', '2025-08-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11327);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11327, 8, 82, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11327 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2600, 'delivered', '2025-08-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11328);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11328, 8, 52, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11328 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3250, 'delivered', '2025-08-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11329);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11329, 8, 65, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11329 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3000, 'delivered', '2025-08-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11330);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11330, 8, 60, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11330 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-08-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11331);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11331, 8, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11331 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-08-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11332);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11332, 8, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11332 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-08-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11333);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11333, 8, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11333 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2950, 'delivered', '2025-08-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11334);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11334, 8, 59, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11334 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-08-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11335);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11335, 8, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11335 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-08-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11336);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11336, 8, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11336 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-08-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11337);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11337, 8, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11337 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-08-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11338);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11338, 8, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11338 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-08-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11339);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11339, 8, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11339 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2450, 'delivered', '2025-08-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11340);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11340, 8, 49, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11340 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-09-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11341);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11341, 8, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11341 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-09-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11342);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11342, 8, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11342 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2350, 'delivered', '2025-09-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11343);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11343, 8, 47, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11343 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2700, 'delivered', '2025-09-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11344);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11344, 8, 54, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11344 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11345);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11345, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11345 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-09-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11346);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11346, 8, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11346 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-09-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11347);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11347, 8, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11347 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-09-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11348);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11348, 8, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11348 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-09-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11349);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11349, 8, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11349 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-09-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11350);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11350, 8, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11350 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-09-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11351);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11351, 8, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11351 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-09-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11352);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11352, 8, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11352 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-09-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11353);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11353, 8, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11353 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-09-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11354);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11354, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11354 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-09-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11355);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11355, 8, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11355 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-09-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11356);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11356, 8, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11356 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-09-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11357);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11357, 8, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11357 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1500, 'delivered', '2025-09-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11358);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11358, 8, 30, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11358 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-09-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11359);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11359, 8, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11359 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-09-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11360);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11360, 8, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11360 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-09-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11361);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11361, 8, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11361 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-09-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11362);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11362, 8, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11362 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-09-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11363);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11363, 8, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11363 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-09-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11364);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11364, 8, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11364 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-09-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11365);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11365, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11365 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-09-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11366);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11366, 8, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11366 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-09-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11367);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11367, 8, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11367 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-09-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11368);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11368, 8, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11368 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-09-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11369);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11369, 8, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11369 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-09-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11370);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11370, 8, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11370 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-10-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11371);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11371, 8, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11371 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-10-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11372);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11372, 8, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11372 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-10-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11373);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11373, 8, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11373 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-10-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11374);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11374, 8, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11374 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-10-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11375);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11375, 8, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11375 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-10-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11376);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11376, 8, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11376 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-10-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11377);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11377, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11377 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-10-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11378);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11378, 8, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11378 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-10-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11379);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11379, 8, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11379 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 550, 'delivered', '2025-10-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11380);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11380, 8, 11, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11380 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 950, 'delivered', '2025-10-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11381);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11381, 8, 19, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11381 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2200, 'delivered', '2025-10-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11382);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11382, 8, 44, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11382 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-10-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11383);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11383, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11383 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-10-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11384);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11384, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11384 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-10-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11385);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11385, 8, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11385 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-10-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11386);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11386, 8, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11386 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-10-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11387);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11387, 8, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11387 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-10-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11388);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11388, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11388 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1450, 'delivered', '2025-10-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11389);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11389, 8, 29, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11389 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-10-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11390);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11390, 8, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11390 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-10-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11391);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11391, 8, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11391 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-10-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11392);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11392, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11392 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-10-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11393);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11393, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11393 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-10-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11394);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11394, 8, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11394 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-10-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11395);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11395, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11395 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-10-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11396);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11396, 8, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11396 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-10-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11397);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11397, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11397 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-10-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11398);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11398, 8, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11398 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1250, 'delivered', '2025-10-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11399);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11399, 8, 25, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11399 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-10-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11400);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11400, 8, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11400 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-10-31 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11401);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11401, 8, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11401 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1900, 'delivered', '2025-11-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11402);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11402, 8, 38, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11402 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-11-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11403);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11403, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11403 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-11-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11404);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11404, 8, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11404 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1300, 'delivered', '2025-11-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11405);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11405, 8, 26, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11405 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1100, 'delivered', '2025-11-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11406);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11406, 8, 22, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11406 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2050, 'delivered', '2025-11-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11407);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11407, 8, 41, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11407 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-11-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11408);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11408, 8, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11408 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-11-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11409);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11409, 8, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11409 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 600, 'delivered', '2025-11-09 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11410);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11410, 8, 12, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11410 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1350, 'delivered', '2025-11-10 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11411);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11411, 8, 27, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11411 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-11 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11412);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11412, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11412 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-11-12 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11413);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11413, 8, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11413 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1550, 'delivered', '2025-11-13 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11414);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11414, 8, 31, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11414 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2000, 'delivered', '2025-11-14 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11415);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11415, 8, 40, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11415 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1800, 'delivered', '2025-11-15 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11416);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11416, 8, 36, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11416 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1850, 'delivered', '2025-11-16 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11417);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11417, 8, 37, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11417 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2650, 'delivered', '2025-11-17 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11418);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11418, 8, 53, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11418 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-11-18 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11419);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11419, 8, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11419 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1700, 'delivered', '2025-11-19 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11420);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11420, 8, 34, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11420 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-11-20 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11421);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11421, 8, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11421 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-11-21 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11422);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11422, 8, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11422 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-22 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11423);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11423, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11423 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1600, 'delivered', '2025-11-23 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11424);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11424, 8, 32, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11424 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1650, 'delivered', '2025-11-24 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11425);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11425, 8, 33, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11425 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-11-25 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11426);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11426, 8, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11426 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1400, 'delivered', '2025-11-26 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11427);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11427, 8, 28, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11427 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-11-27 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11428);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11428, 8, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11428 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1950, 'delivered', '2025-11-28 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11429);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11429, 8, 39, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11429 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2150, 'delivered', '2025-11-29 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11430);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11430, 8, 43, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11430 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2300, 'delivered', '2025-11-30 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11431);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11431, 8, 46, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11431 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2850, 'delivered', '2025-12-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11432);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11432, 8, 57, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11432 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-12-02 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11433);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11433, 8, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11433 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 1750, 'delivered', '2025-12-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11434);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11434, 8, 35, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11434 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2250, 'delivered', '2025-12-04 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11435);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11435, 8, 45, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11435 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2100, 'delivered', '2025-12-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11436);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11436, 8, 42, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11436 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2750, 'delivered', '2025-12-06 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11437);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11437, 8, 55, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11437 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 2400, 'delivered', '2025-12-07 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11438);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11438, 8, 48, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11438 AND product_id = 8);


INSERT INTO orders (student_id, merchant_id, total_amount, order_status, created_at)
SELECT 2, 3, 3050, 'delivered', '2025-12-08 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 11439);


INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 11439, 8, 61, 50
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = 11439 AND product_id = 8);
