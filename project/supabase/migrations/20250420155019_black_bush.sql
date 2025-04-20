/*
  # Fix storage policies for Documents bucket

  1. Changes
    - Drop all existing storage policies to avoid conflicts
    - Create new policies with proper authentication checks
    - Ensure bucket name is correct (Documents)
    - Add folder-level security based on user ID
    - Enable RLS on storage.objects table

  2. Security
    - Users can only access files in their own folder
    - All operations require authentication
    - Bucket is private (not public)
*/

-- First ensure we have the correct bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('Documents', 'Documents', false)
ON CONFLICT (id) DO UPDATE
SET name = 'Documents', public = false;

-- Drop all existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to download their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper folder structure checks
CREATE POLICY "Allow users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to download files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);