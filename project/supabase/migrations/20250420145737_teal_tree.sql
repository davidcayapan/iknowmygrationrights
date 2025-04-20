/*
  # Add Storage Policies for Documents Bucket

  1. Storage Policies
    - Enable authenticated users to upload files to the documents bucket
    - Enable authenticated users to read their own files
    - Enable authenticated users to update their own files
    - Enable authenticated users to delete their own files

  2. Security
    - Policies ensure users can only access their own files
    - All operations require authentication
*/

-- Create storage policies for the documents bucket
BEGIN;

-- Policy to enable file uploads for authenticated users
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Policy to enable file reads for authenticated users
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Policy to enable file updates for authenticated users
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Policy to enable file deletions for authenticated users
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

COMMIT;