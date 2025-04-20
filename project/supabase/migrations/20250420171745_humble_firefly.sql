/*
  # Fix chat_messages RLS policies

  1. Changes
    - Drop existing RLS policies for chat_messages
    - Create new policies with correct syntax and permissions
  
  2. Security
    - Maintain row-level security
    - Allow authenticated users to insert their own messages
    - Allow users to read their own messages
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can read their own chat messages" ON chat_messages;

-- Create new policies with correct syntax
CREATE POLICY "Users can insert chat messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can read their own chat messages"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;