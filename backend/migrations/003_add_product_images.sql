-- Add images column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- Update existing products with empty array if null
UPDATE products SET images = '[]' WHERE images IS NULL;
