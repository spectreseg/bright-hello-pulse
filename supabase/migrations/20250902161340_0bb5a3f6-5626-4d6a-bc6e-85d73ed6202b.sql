-- Fix security warnings
-- Fix function search path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update notification function search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;