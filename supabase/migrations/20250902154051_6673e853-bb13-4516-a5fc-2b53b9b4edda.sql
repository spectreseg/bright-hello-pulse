-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'new_listing',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  food_post_id UUID REFERENCES public.food_posts(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to create notifications for new food posts
CREATE OR REPLACE FUNCTION public.create_notification_for_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notifications for all users except the post author
  INSERT INTO public.notifications (user_id, type, title, message, food_post_id)
  SELECT 
    p.user_id,
    'new_listing',
    'New Food Available!',
    'Someone shared ' || NEW.title || ' in ' || NEW.location,
    NEW.id
  FROM public.profiles p
  WHERE p.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
CREATE TRIGGER create_notification_on_new_post
  AFTER INSERT ON public.food_posts
  FOR EACH ROW EXECUTE FUNCTION public.create_notification_for_new_post();