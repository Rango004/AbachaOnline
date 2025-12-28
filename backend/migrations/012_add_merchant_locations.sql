-- Add latitude and longitude to users table for merchant locations
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Update existing merchants with GPS coordinates
UPDATE users SET latitude = 8.112588462993951, longitude = -12.071490289428217 WHERE phone = '+23276888001';
UPDATE users SET latitude = 8.112529915814225, longitude = -12.071713327930109 WHERE phone = '+23233300451';

-- Insert new merchants with GPS coordinates
INSERT INTO users (phone, name, role, is_verified, latitude, longitude)
VALUES 
  ('+23276111001', 'Merchant Position 1', 'merchant', true, 8.112588462993951, -12.071490289428217),
  ('+23276111002', 'Merchant Position 2', 'merchant', true, 8.112529915814225, -12.071713327930109),
  ('+23276111003', 'Merchant Position 3', 'merchant', true, 8.1112385301209, -12.071723466045977),
  ('+23276111004', 'Merchant Position 4', 'merchant', true, 8.11017965767057, -12.071843433726219),
  ('+23276111005', 'Merchant Position 5', 'merchant', true, 8.109751424098596, -12.07201916103501),
  ('+23276111006', 'Merchant Position 6', 'merchant', true, 8.110039143574811, -12.073049869307178)
ON CONFLICT (phone) DO NOTHING;
