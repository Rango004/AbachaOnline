/**
 * Database Migration Runner
 * Runs all migrations automatically on startup
 */
const { pool } = require('./database');
const fs = require('fs');
const path = require('path');

// Migration SQL - Combined from all migration files
const migrations = [
  {
    name: '001_initial_schema',
    sql: `
-- Users table (students, merchants, riders, admins)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'merchant', 'rider', 'admin')),
  zone_id INT,
  location_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  verification_code VARCHAR(6),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Zones table
CREATE TABLE IF NOT EXISTS zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coordinates JSON,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Locations/Dormitories table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'dormitory',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  zone_id INT REFERENCES zones(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
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

CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id) ON DELETE SET NULL,
  merchant_id INT REFERENCES users(id) ON DELETE SET NULL,
  rider_id INT REFERENCES users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  delivery_address TEXT,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  delivery_notes TEXT,
  pickup_code VARCHAR(6),
  delivery_code VARCHAR(6),
  estimated_delivery TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Token credits table
CREATE TABLE IF NOT EXISTS token_credits (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  last_topup_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('topup', 'debit', 'credit', 'refund')),
  reference_id INT,
  balance_after DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  reference_id INT,
  reference_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES users(id) ON DELETE CASCADE,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, merchant_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id INT REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INT REFERENCES users(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);

-- Chatbot sessions table
CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  customer_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chatbot messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
  sender VARCHAR(50) NOT NULL,
  message_text TEXT NOT NULL,
  intent VARCHAR(100),
  confidence DECIMAL(5,4),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chatbot FAQs table
CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  keywords TEXT[],
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery routes table
CREATE TABLE IF NOT EXISTS delivery_routes (
  id SERIAL PRIMARY KEY,
  rider_id INT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_distance_m DECIMAL(10,2),
  total_duration_s INT,
  optimization_method VARCHAR(50),
  route_geometry JSONB,
  waypoints JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Route orders junction table
CREATE TABLE IF NOT EXISTS route_orders (
  id SERIAL PRIMARY KEY,
  route_id INT REFERENCES delivery_routes(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  sequence_number INT,
  estimated_arrival TIMESTAMP,
  actual_arrival TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending'
);

-- Sales predictions table
CREATE TABLE IF NOT EXISTS sales_predictions (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_quantity DECIMAL(10,2),
  confidence_lower DECIMAL(10,2),
  confidence_upper DECIMAL(10,2),
  model_type VARCHAR(50),
  features_used JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Merchant settings table
CREATE TABLE IF NOT EXISTS merchant_settings (
  id SERIAL PRIMARY KEY,
  merchant_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255),
  store_description TEXT,
  store_image_url VARCHAR(500),
  business_hours JSONB,
  delivery_radius_km DECIMAL(5,2) DEFAULT 5,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Escrow table
CREATE TABLE IF NOT EXISTS escrow (
  id SERIAL PRIMARY KEY,
  order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'held',
  held_at TIMESTAMP DEFAULT NOW(),
  released_at TIMESTAMP,
  notes TEXT
);

-- Refund requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  processed_by INT REFERENCES users(id),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default zones if not exists
INSERT INTO zones (name, description)
SELECT 'Zone A - Main Campus', 'Central campus area'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE name = 'Zone A - Main Campus');

INSERT INTO zones (name, description)
SELECT 'Zone B - Hostels', 'Student accommodation area'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE name = 'Zone B - Hostels');

-- Insert default locations if not exists
INSERT INTO locations (name, type, latitude, longitude)
SELECT 'Main Campus', 'campus', 8.4847, -13.2343
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Main Campus');
    `
  }
];

/**
 * Run all migrations
 */
async function runMigrations() {
  console.log('[Migrations] Starting database migrations...');

  try {
    for (const migration of migrations) {
      console.log(`[Migrations] Running: ${migration.name}`);
      await pool.query(migration.sql);
      console.log(`[Migrations] Completed: ${migration.name}`);
    }

    console.log('[Migrations] All migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('[Migrations] Migration failed:', error.message);
    // Don't throw - let the app continue even if some tables exist
    return false;
  }
}

module.exports = { runMigrations };
