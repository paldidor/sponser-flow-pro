-- Create a new storage bucket for team photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-photos',
  'team-photos',
  true,
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS policies for team-photos bucket
CREATE POLICY "Users can upload their team photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all team photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-photos');

CREATE POLICY "Users can update their own team photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own team photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add images column to team_profiles table
ALTER TABLE team_profiles
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN team_profiles.images IS 'Array of Supabase Storage URLs for team photos (max 6)';