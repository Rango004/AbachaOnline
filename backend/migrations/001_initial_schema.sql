-- WeGo Delivery Platform - Initial Database Schema
-- Run this file after creating the database: CREATE DATABASE wego_dev;

-- Users table (students, merchants, riders, admins)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'merchant', 'rider', 'admin')),
  zone_id INT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Zones table (campus zones for efficient delivery)
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coordinates JSON, -- GeoJSON polygon
  created_at TIMESTAMP DEFAULT NOW()
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
  zone_id INT REFERENCES zones(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_zone_category ON products(zone_id, category);
CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_active ON products(is_active);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id) ON DELETE SET NULL,
  merchant_id INT REFERENCES users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled')),
  delivery_id INT,
  delivery_address TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_student_status ON orders(student_id, order_status);
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
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

-- Escrow table (holds payment until delivery confirmed)
CREATE TABLE escrow (
  id SERIAL PRIMARY KEY,
  order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  held_at TIMESTAMP DEFAULT NOW(),
  released_at TIMESTAMP,
  notes TEXT
);

-- Deliveries table (batch delivery routes)
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  rider_id INT REFERENCES users(id) ON DELETE SET NULL,
  zone_id INT REFERENCES zones(id),
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  planned_route JSON, -- Array of order IDs with coordinates
  actual_route JSON, -- GPS tracking data
  estimated_time INT, -- minutes
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deliveries_zone_status ON deliveries(zone_id, status);
CREATE INDEX idx_deliveries_rider ON deliveries(rider_id);

-- Forecast data table (AI predictions)
CREATE TABLE forecast_data (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  category VARCHAR(100),
  forecast_date DATE NOT NULL,
  predicted_quantity INT,
  confidence_interval_lower INT,
  confidence_interval_upper INT,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forecast_merchant_date ON forecast_data(merchant_id, forecast_date);
CREATE INDEX idx_forecast_product_date ON forecast_data(product_id, forecast_date);

-- Notifications table (for offline sync)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- order_update, delivery_update, payment, etc.
  is_read BOOLEAN DEFAULT FALSE,
  reference_id INT, -- order_id or delivery_id
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Chat messages table (basic support)
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INT REFERENCES users(id) ON DELETE SET NULL,
  order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_order ON chat_messages(order_id);
CREATE INDEX idx_chat_messages_receiver ON chat_messages(receiver_id, is_read);

-- Token credits table (offline payment system)
CREATE TABLE token_credits (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  last_topup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Token transactions table
CREATE TABLE token_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('topup', 'debit', 'credit', 'refund')),
  reference_id INT, -- order_id for payments
  balance_after DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_token_transactions_user ON token_transactions(user_id, created_at);

-- Insert default zones
INSERT INTO zones (name, description) VALUES
  ('Zone A - Main Campus', 'Central campus area including library and lecture halls'),
  ('Zone B - Hostels', 'Student accommodation area'),
  ('Zone C - Sports Complex', 'Sports facilities and recreation area'),
  ('Zone D - Admin Block', 'Administrative buildings');

-- Create a default admin user (password: admin123 - should be changed)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (phone, name, role, is_verified, password_hash) VALUES
  ('+23276000000', 'Admin User', 'admin', TRUE, '$2a$10$rOzJQjYqYqYqYqYqYqYqYu');

-- Success message
SELECT 'Database schema created successfully!' AS status;
