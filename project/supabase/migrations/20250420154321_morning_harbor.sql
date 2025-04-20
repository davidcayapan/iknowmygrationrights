/*
  # Fix storage bucket and policies

  1. Changes
    - Ensure storage bucket exists with correct case ('Documents')
    - Drop and recreate storage policies with correct bucket name
    - Add comprehensive RLS policies for all operations

  2. Security
    - Enable RLS on storage.objects
    - Add policies for authenticated users only
    - Restrict operations to specific bucket
*/

-- First ensure we have the correct bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('Documents', 'Documents', false)
ON CONFLICT (id) DO UPDATE
SET name = 'Documents';

-- Drop all existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated downloads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'Documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.role() = 'authenticated'
);