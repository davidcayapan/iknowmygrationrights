/*
  # Fix storage RLS policy for Documents bucket

  1. Changes
    - Drop existing storage RLS policy if it exists
    - Create new storage RLS policy for Documents bucket
    - Ensure bucket exists with correct capitalization
  
  2. Security
    - Enable RLS on storage.objects table
    - Add policy for authenticated users to upload to Documents bucket
*/

-- First ensure the bucket exists with correct capitalization
INSERT INTO storage.buckets (id, name)
VALUES ('Documents', 'Documents')
ON CONFLICT (id) DO NOTHING;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Create new policy with correct bucket name and authentication check
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Documents' 
  AND auth.role() = 'authenticated'
);

-- Ensure read access is also granted
DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;

CREATE POLICY "Allow authenticated downloads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Documents'
  AND auth.role() = 'authenticated'
);