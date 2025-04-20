/*
  # Add RLS policy for auth.users table

  1. Changes
    - Add RLS policy to allow authenticated users to read their own data from the auth.users table
    
  2. Security
    - Enable RLS on auth.users table if not already enabled
    - Add policy for authenticated users to read their own data
    - This is needed because the documents table's policies reference the auth.users table
*/

-- Enable RLS on auth.users table if not already enabled
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Add policy to allow authenticated users to read their own data
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'auth'
    AND tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON auth.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;