-- First, add an INSERT policy for notifications that allows the system to create them
CREATE POLICY "System can create notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create the missing trigger to call the notification function when a new post is created
CREATE TRIGGER create_notification_on_new_post
  AFTER INSERT ON public.food_posts
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_notification_for_new_post();

-- Also create a trigger to call the auto-expire function when finished_by is updated
CREATE TRIGGER check_and_expire_on_finished_update
  BEFORE UPDATE ON public.food_posts
  FOR EACH ROW 
  WHEN (OLD.finished_by IS DISTINCT FROM NEW.finished_by)
  EXECUTE FUNCTION public.check_and_expire_post();