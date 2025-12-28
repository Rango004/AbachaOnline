-- WeGo Database Setup Script
-- Run this in PostgreSQL to create and set up your database

-- Step 1: Create the database
CREATE DATABASE wego_dev;

-- Step 2: Connect to the database
\c wego_dev;

-- Step 3: Create the schema (tables, indexes, etc.)

-- Users table (students, merchants, riders, admins)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'rider', 'admin')),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_available ON products(is_available);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES users(id) ON DELETE SET NULL,
  merchant_id INT REFERENCES users(id) ON DELETE SET NULL,
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled', 'refund_requested')),
  delivery_address TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_tracking ON orders(tracking_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Step 4: Insert sample data for testing

-- Insert test users
INSERT INTO users (phone_number, full_name, email, role, location, is_active, is_verified) VALUES
  ('+23276111111', 'John Merchant', 'john@merchant.com', 'merchant', 'Freetown Campus', TRUE, TRUE),
  ('+23276222222', 'Sarah Shop', 'sarah@shop.com', 'merchant', 'Freetown Downtown', TRUE, TRUE),
  ('+23276333333', 'Test Customer', 'customer@test.com', 'customer', 'Freetown', TRUE, TRUE);

-- Insert sample products
INSERT INTO products (merchant_id, name, description, price, category, stock_quantity, is_available) VALUES
  (1, 'Rice - 25kg Bag', 'Premium quality rice imported from Thailand', 250000, 'Food & Groceries', 50, TRUE),
  (1, 'Cooking Oil - 5L', 'Pure vegetable cooking oil', 85000, 'Food & Groceries', 30, TRUE),
  (1, 'Sugar - 2kg', 'Refined white sugar', 25000, 'Food & Groceries', 100, TRUE),
  (2, 'Bottled Water - Pack of 12', 'Pure drinking water 500ml bottles', 15000, 'Beverages', 200, TRUE),
  (2, 'Soft Drinks - Coca Cola', 'Coca Cola 1.5L bottle', 8000, 'Beverages', 150, TRUE),
  (1, 'Bread - Loaf', 'Fresh white bread', 5000, 'Bakery', 40, TRUE),
  (2, 'Eggs - Dozen', 'Fresh farm eggs', 18000, 'Food & Groceries', 60, TRUE),
  (1, 'Notebook - A4', 'Student notebook 200 pages', 12000, 'Stationery', 80, TRUE),
  (2, 'Pen - Blue (Pack of 10)', 'Ballpoint pens', 5000, 'Stationery', 120, TRUE),
  (1, 'Phone Charger - USB-C', 'Fast charging cable 2m', 35000, 'Electronics', 25, TRUE),
  (2, 'Headphones - Wireless', 'Bluetooth headphones with mic', 120000, 'Electronics', 15, TRUE),
  (1, 'Power Bank - 10000mAh', 'Portable phone charger', 75000, 'Electronics', 20, TRUE);

-- Insert a sample order
INSERT INTO orders (customer_id, merchant_id, tracking_number, total_price, payment_method, payment_status, status, delivery_address) VALUES
  (3, 1, 'WG603DC0224CA1CDDA', 250000, 'Orange Money', 'completed', 'in_transit', 'Fourah Bay College, Room 234');

-- Insert order items for the sample order
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
  (1, 1, 1, 250000, 250000);

-- Success message
SELECT 'Database setup complete! You now have:' AS status;
SELECT COUNT(*) || ' users' AS info FROM users;
SELECT COUNT(*) || ' products' AS info FROM products;
SELECT COUNT(*) || ' orders' AS info FROM orders;
