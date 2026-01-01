-- Migration: Add rating columns to products table
-- Enables filtering and sorting by product ratings

-- Add avg_rating column for average product rating
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0.00;

-- Add review_count column for number of reviews
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create index for rating-based queries
CREATE INDEX IF NOT EXISTS idx_products_avg_rating ON products(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_review_count ON products(review_count DESC);

-- Add comments for documentation
COMMENT ON COLUMN products.avg_rating IS 'Average product rating (0-5 scale)';
COMMENT ON COLUMN products.review_count IS 'Total number of reviews for this product';
