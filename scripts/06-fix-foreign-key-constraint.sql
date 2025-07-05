-- First, let's check if we have any orphaned posts or missing profiles
-- and clean up the data

-- Drop existing foreign key constraint temporarily
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS post_author_id_fkey;

-- Recreate the profiles table with proper structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create or replace the function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create profiles for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert profiles for existing users who don't have profiles yet
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'avatar_url', '')
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Now recreate the foreign key constraint
ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update posts table policies to ensure they work correctly
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "Published posts are viewable by everyone" ON public.posts
  FOR SELECT USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
