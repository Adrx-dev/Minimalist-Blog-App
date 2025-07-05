-- Add image support to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Create a table for storing image metadata
CREATE TABLE IF NOT EXISTS public.post_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on post_images
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Create policies for post_images
CREATE POLICY "Images are viewable by everyone" ON public.post_images
  FOR SELECT USING (true);

CREATE POLICY "Users can insert images for their own posts" ON public.post_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_images.post_id 
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images for their own posts" ON public.post_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_images.post_id 
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for their own posts" ON public.post_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = post_images.post_id 
      AND posts.author_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS post_images_post_id_idx ON public.post_images(post_id);
CREATE INDEX IF NOT EXISTS post_images_position_idx ON public.post_images(position);
