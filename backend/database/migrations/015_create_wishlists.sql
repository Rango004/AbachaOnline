-- Create wishlists table for user favorites/wishlist functionality
CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created ON wishlists(created_at DESC);
