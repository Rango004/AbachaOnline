-- Migration: Create student_addresses table for delivery address management
-- This table allows students to save multiple delivery addresses

-- Create the student_addresses table
CREATE TABLE IF NOT EXISTS student_addresses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    address_label VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_student_addresses_student_id ON student_addresses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_addresses_location_id ON student_addresses(location_id);
CREATE INDEX IF NOT EXISTS idx_student_addresses_default ON student_addresses(student_id, is_default) WHERE is_default = TRUE;

-- Add comment for documentation
COMMENT ON TABLE student_addresses IS 'Stores delivery addresses for students';
COMMENT ON COLUMN student_addresses.address_label IS 'User-friendly label like Home, Hostel, etc.';
COMMENT ON COLUMN student_addresses.delivery_address IS 'Full delivery address details';
COMMENT ON COLUMN student_addresses.is_default IS 'Whether this is the default delivery address';
