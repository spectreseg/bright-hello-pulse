-- Fix the security warning by setting search_path properly
CREATE OR REPLACE FUNCTION public.create_notification_for_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all users except the post creator
  INSERT INTO public.notifications (user_id, title, message, type, food_post_id)
  SELECT 
    p.user_id,
    'New Food Available!',
    'Someone shared "' || NEW.title || '" near ' || NEW.location,
    'new_listing',
    NEW.id
  FROM public.profiles p
  WHERE p.user_id != NEW.user_id; -- Exclude the creator
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop and recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS create_notification_on_new_post ON public.food_posts;

CREATE TRIGGER create_notification_on_new_post
  AFTER INSERT ON public.food_posts
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_notification_for_new_post();