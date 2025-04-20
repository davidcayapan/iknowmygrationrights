/*
  # Fix Storage RLS Policies

  1. Changes
    - Create storage bucket for documents if it doesn't exist
    - Update RLS policies for the documents bucket to allow authenticated users to upload files
    
  2. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to upload and read documents
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload files 1" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to download files 1" ON storage.objects;

-- Create new policies with both USING and WITH CHECK expressions
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to download files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
);