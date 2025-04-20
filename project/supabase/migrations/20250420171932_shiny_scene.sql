/*
  # Fix chat messages RLS policies

  1. Changes
    - Drop existing RLS policies for chat_messages table
    - Create new comprehensive RLS policies that properly handle user_id

  2. Security
    - Enable RLS on chat_messages table
    - Add policies for:
      - INSERT: Users can only insert messages with their own user_id
      - SELECT: Users can only read their own messages
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can read their own chat messages" ON chat_messages;

-- Create new policies with proper user_id handling
CREATE POLICY "Enable insert for authenticated users with proper user_id"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Enable select for users based on user_id"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;