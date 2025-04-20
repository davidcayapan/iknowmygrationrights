/*
  # Add search and chat functionality

  1. New Tables
    - `user_searches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `query` (text)
      - `created_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `content` (text)
      - `created_at` (timestamp)

  2. Functions
    - `search_documents`: Full-text search across documents
    - `get_document_stats`: Get document processing statistics
    - `get_top_entities`: Get most frequent entities
    - `get_top_topics`: Get most relevant topics

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create user_searches table
CREATE TABLE IF NOT EXISTS user_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  query text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own searches"
  ON user_searches FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert searches"
  ON user_searches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create search_documents function
CREATE OR REPLACE FUNCTION search_documents(search_query text)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  relevance float,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.content,
    ts_rank(
      to_tsvector('english', d.title || ' ' || d.content),
      to_tsquery('english', search_query)
    ) as relevance,
    d.created_at
  FROM documents d
  WHERE 
    to_tsvector('english', d.title || ' ' || d.content) @@ 
    to_tsquery('english', search_query)
  ORDER BY relevance DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_document_stats function
CREATE OR REPLACE FUNCTION get_document_stats()
RETURNS TABLE (
  total_documents bigint,
  processed_documents bigint,
  failed_documents bigint,
  average_processing_time interval
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE status = 'analyzed') as processed_documents,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_documents,
    AVG(processing_completed_at - processing_started_at) as average_processing_time
  FROM documents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_top_entities function
CREATE OR REPLACE FUNCTION get_top_entities(limit_count integer)
RETURNS TABLE (
  name text,
  count bigint,
  type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.name,
    SUM(e.count) as total_count,
    e.type
  FROM document_entities e
  GROUP BY e.name, e.type
  ORDER BY total_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_top_topics function
CREATE OR REPLACE FUNCTION get_top_topics(limit_count integer)
RETURNS TABLE (
  name text,
  document_count bigint,
  average_relevance float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.name,
    COUNT(*) as doc_count,
    AVG(t.relevance) as avg_relevance
  FROM document_topics t
  GROUP BY t.name
  ORDER BY avg_relevance DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;