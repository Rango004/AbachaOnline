-- Create dormitories/locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  type VARCHAR(50) DEFAULT 'dormitory',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert dormitories
INSERT INTO locations (name, latitude, longitude, type) VALUES
  ('Quad 1', 8.113908281469802, -12.070880312893761, 'dormitory'),
  ('Quad 2', 8.113896572072976, -12.0704528224318, 'dormitory'),
  ('Winters', 8.114058830832478, -12.071221629393865, 'dormitory'),
  ('Winters Extension', 8.114441895053666, -12.071517324377435, 'dormitory'),
  ('Tourist', 8.114139123802234, -12.070174024271818, 'dormitory'),
  ('TK Jamaica', 8.113864789429387, -12.068274817567337, 'dormitory'),
  ('TK Asia', 8.114119050560674, -12.068589099092732, 'dormitory'),
  ('TK Africa', 8.114025375425758, -12.06921090340104, 'dormitory'),
  ('TK Europe', 8.114318110149878, -12.068631341233242, 'dormitory'),
  ('TK America', 8.11419432520684, -12.069406906933006, 'dormitory'),
  ('Library', 8.114925324944728, -12.068198781700564, 'building'),
  ('ICT Center', 8.11502234540249, -12.0680112265967, 'building'),
  ('Post Grad Dorm', 8.116375133314063, -12.067541098756049, 'dormitory'),
  ('Heavens (Florence Carew) 1', 8.116928692885956, -12.067421619943097, 'dormitory'),
  ('Heavens 2', 8.117432573363988, -12.067392945027844, 'dormitory'),
  ('Faculty Building', 8.117002027642718, -12.0688959885024, 'building'),
  ('Matturi Block C', 8.118326782258364, -12.069335670592197, 'dormitory'),
  ('Matturi Block B', 8.118366997954404, -12.06998563533795, 'dormitory'),
  ('Matturi Block D', 8.118333879155633, -12.070685781204881, 'dormitory'),
  ('Matturi Block H', 8.118807004732965, -12.069263983329956, 'dormitory'),
  ('Matturi Block A', 8.118795176600436, -12.070033426889268, 'dormitory'),
  ('Matturi Block E', 8.118823564117891, -12.070704897821463, 'dormitory'),
  ('Matturi Block F', 8.119218623527598, -12.069366735109615, 'dormitory')
ON CONFLICT (name) DO NOTHING;

-- Add location_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_id INT REFERENCES locations(id);
