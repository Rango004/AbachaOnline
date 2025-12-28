-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_merchant ON reviews(merchant_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);

-- Add search indexes to products
CREATE INDEX idx_products_name_search ON products USING GIN(to_tsvector('english', name));
CREATE INDEX idx_products_description_search ON products USING GIN(to_tsvector('english', description));
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_merchant_active ON products(merchant_id, is_active);

-- Add rating column to products for caching
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
