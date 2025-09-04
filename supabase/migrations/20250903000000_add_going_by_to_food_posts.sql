-- Add going_by column to track users who indicated they're going to pick up food
ALTER TABLE public.food_posts 
ADD COLUMN going_by uuid[] DEFAULT '{}';

-- Add index for better performance on going_by queries
CREATE INDEX idx_food_posts_going_by ON public.food_posts USING GIN(going_by);

-- Update RLS policies to allow users to update going_by field
DROP POLICY IF EXISTS "Users can update going_by field of any post" ON public.food_posts;
CREATE POLICY "Users can update going_by field of any post" ON public.food_posts
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
