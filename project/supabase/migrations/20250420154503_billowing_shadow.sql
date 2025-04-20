/*
  # Add storage policies for Documents bucket

  1. Security
    - Enable storage policies for Documents bucket
    - Add policies for authenticated users to:
      - Upload files to Documents bucket
      - Download files from Documents bucket
      - Update their own files
      - Delete their own files
*/

-- Create storage policies for the Documents bucket
BEGIN;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Documents' AND
  auth.role() = 'authenticated'
);

-- Policy to allow users to download their own files
CREATE POLICY "Allow users to download their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'Documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

COMMIT;