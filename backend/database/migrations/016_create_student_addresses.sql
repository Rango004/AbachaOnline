-- Create student_addresses table for managing saved delivery addresses
CREATE TABLE IF NOT EXISTS student_addresses (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id INTEGER REFERENCES locations(id),
  address_label VARCHAR(100),           -- e.g., "My Room", "Friend's Dorm"
  delivery_address TEXT,                -- Full delivery address
  notes TEXT,                           -- Special delivery instructions
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, location_id, delivery_address)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_addresses_student ON student_addresses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_addresses_default ON student_addresses(student_id, is_default);
