-- Create a more specific policy that allows users to update the finished_by field of any post
-- First, drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own food posts" ON public.food_posts;

-- Create a policy that allows users to update their own posts (all fields)
CREATE POLICY "Users can update their own food posts" 
ON public.food_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a new policy that allows any authenticated user to update the finished_by field of any post
CREATE POLICY "Users can mark any post as finished" 
ON public.food_posts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);