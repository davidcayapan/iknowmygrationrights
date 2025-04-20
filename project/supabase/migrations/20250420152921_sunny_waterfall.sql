/*
  # Fix Storage Bucket and Policies

  1. Changes
    - Create storage bucket for documents
    - Set up proper RLS policies for storage access
    
  2. Security
    - Enable RLS on storage bucket
    - Add comprehensive policies for authenticated users
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to download files" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
)
WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
);