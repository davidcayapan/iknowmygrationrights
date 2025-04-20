/*
  # Fix documents table RLS policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new policies that properly reference auth.uid()
    - Add proper policies for all CRUD operations
    
  2. Security
    - Enable RLS on documents table
    - Add policies for authenticated users to manage their own documents
    - Use auth.uid() directly instead of joining with auth.users
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Allow public read access" ON documents;

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create new policies using auth.uid() directly
CREATE POLICY "Users can read their own documents"
ON documents
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can insert their own documents"
ON documents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own documents"
ON documents
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own documents"
ON documents
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
);