-- Allow users to view other users' profile names for food sharing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policy to allow viewing profile names for all users
CREATE POLICY "Users can view profile names" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Keep the update policy for own profile only
-- (existing policy already exists: "Users can update their own profile")