-- Create table for storing rider GPS location history
CREATE TABLE IF NOT EXISTS rider_location_history (
  id SERIAL PRIMARY KEY,
  rider_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  altitude DECIMAL(10, 2),
  speed DECIMAL(10, 2),
  heading DECIMAL(10, 2),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_rider_location_history_rider_id ON rider_location_history(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_location_history_order_id ON rider_location_history(order_id);
CREATE INDEX IF NOT EXISTS idx_rider_location_history_rider_timestamp ON rider_location_history(rider_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rider_location_history_order_timestamp ON rider_location_history(order_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rider_location_history_created_at ON rider_location_history(created_at DESC);

-- Create table for storing current rider locations (for quick lookup)
CREATE TABLE IF NOT EXISTS rider_current_location (
  rider_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  altitude DECIMAL(10, 2),
  speed DECIMAL(10, 2),
  heading DECIMAL(10, 2),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Create index for spatial queries
CREATE INDEX IF NOT EXISTS idx_rider_current_location_order ON rider_current_location(order_id);

SELECT 'Rider location history tables created successfully!' AS status;
