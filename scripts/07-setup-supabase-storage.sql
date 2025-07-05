-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for blog images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'blog-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'blog-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
