-- Add an INSERT policy for notifications that allows the system to create them
CREATE POLICY "System can create notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);