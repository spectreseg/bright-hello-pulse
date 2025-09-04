-- Check if trigger exists and drop it
DROP TRIGGER IF EXISTS create_notification_on_new_post ON public.food_posts;

-- Recreate the trigger to ensure it works
CREATE TRIGGER create_notification_on_new_post
  AFTER INSERT ON public.food_posts
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_notification_for_new_post();