-- Add latitude and longitude columns to food_posts table
ALTER TABLE food_posts 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add some sample food posts with real coordinates
INSERT INTO food_posts (
  title, 
  description, 
  location, 
  latitude, 
  longitude, 
  servings, 
  user_id, 
  expires_at
) VALUES 
  ('Pizza Party Leftovers', 'Lots of pizza from our dorm party!', 'Humphreys Hall', 35.2045, -85.9215, '8-10', 'eb9a08c8-2749-49f7-8434-ea7361137f56', NOW() + INTERVAL '2 hours'),
  ('Fresh Sandwiches', 'Made too many sandwiches for lunch', 'Benedict Hall', 35.2040, -85.9220, '4-6', 'eb9a08c8-2749-49f7-8434-ea7361137f56', NOW() + INTERVAL '3 hours'),
  ('Homemade Cookies', 'Baked fresh chocolate chip cookies', 'Smith Hall', 35.2048, -85.9212, '12-15', 'eb9a08c8-2749-49f7-8434-ea7361137f56', NOW() + INTERVAL '1 day'),
  ('Fruit Salad', 'Healthy fruit salad with berries', 'Cleveland Hall', 35.2035, -85.9225, '6-8', 'eb9a08c8-2749-49f7-8434-ea7361137f56', NOW() + INTERVAL '4 hours'),
  ('Pasta Bowl', 'Leftover pasta from dinner', 'Cannon Hall', 35.2050, -85.9210, '3-4', 'eb9a08c8-2749-49f7-8434-ea7361137f56', NOW() + INTERVAL '6 hours');
