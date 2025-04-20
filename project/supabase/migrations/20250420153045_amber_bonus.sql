/*
  # Fix Storage RLS Policy

  1. Changes
    - Updates the RLS policy for storage.objects table to allow authenticated uploads
    - Ensures bucket_id matches 'documents' for uploads
    - Requires authenticated role for uploads

  2. Security
    - Maintains security by only allowing authenticated users to upload
    - Restricts uploads to specific bucket
*/

-- Drop existing policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow authenticated uploads'
  ) THEN
    DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  END IF;
END $$;

-- Create new policy with correct permissions
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND auth.role() = 'authenticated'
);

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;