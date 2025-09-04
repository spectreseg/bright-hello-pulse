-- Add finished_by column to track users who marked posts as finished
ALTER TABLE public.food_posts 
ADD COLUMN finished_by uuid[] DEFAULT '{}';

-- Add index for better performance on finished_by queries
CREATE INDEX idx_food_posts_finished_by ON public.food_posts USING GIN(finished_by);

-- Create function to automatically expire posts when 3 users mark as finished
CREATE OR REPLACE FUNCTION public.check_and_expire_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If 3 or more users have marked this post as finished, expire it
  IF array_length(NEW.finished_by, 1) >= 3 THEN
    NEW.expires_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run the function when finished_by is updated
CREATE TRIGGER auto_expire_on_finished
  BEFORE UPDATE OF finished_by ON public.food_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_expire_post();