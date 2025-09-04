-- Fix conflicting RLS policies for food_posts table updates
-- Drop all existing update policies to start fresh
DROP POLICY IF EXISTS "Users can update their own food posts" ON public.food_posts;
DROP POLICY IF EXISTS "Users can update going_by field of any post" ON public.food_posts;
DROP POLICY IF EXISTS "Users can mark any post as finished" ON public.food_posts;

-- Create a single, comprehensive update policy that allows:
-- 1. Users to update all fields of their own posts
-- 2. Any authenticated user to update going_by field of any post
-- 3. Users to update expires_at field of their own posts (for marking as finished)
CREATE POLICY "Comprehensive update policy for food posts" 
ON public.food_posts 
FOR UPDATE 
USING (
  -- User owns the post (can update any field)
  auth.uid() = user_id
  OR
  -- Any authenticated user can update going_by field
  auth.uid() IS NOT NULL
)
WITH CHECK (
  -- User owns the post (can update any field)
  auth.uid() = user_id
  OR
  -- Any authenticated user can update going_by field
  auth.uid() IS NOT NULL
);
