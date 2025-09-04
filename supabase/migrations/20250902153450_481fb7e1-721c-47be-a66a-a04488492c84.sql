-- Create food posts table
CREATE TABLE public.food_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  servings TEXT,
  image_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.food_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all food posts" 
ON public.food_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own food posts" 
ON public.food_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food posts" 
ON public.food_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food posts" 
ON public.food_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_food_posts_updated_at
BEFORE UPDATE ON public.food_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_food_posts_user_id ON public.food_posts(user_id);
CREATE INDEX idx_food_posts_expires_at ON public.food_posts(expires_at);
CREATE INDEX idx_food_posts_created_at ON public.food_posts(created_at DESC);