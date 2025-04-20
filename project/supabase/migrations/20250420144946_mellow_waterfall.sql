/*
  # Document Management System Schema

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `url` (text)
      - `content` (text)
      - `file_path` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `document_insights`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `summary` (text)
      - `sentiment` (numeric)
      - `created_at` (timestamp)
    
    - `document_entities`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text)
      - `count` (integer)
      - `created_at` (timestamp)
    
    - `document_topics`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `name` (text)
      - `relevance` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  content text NOT NULL,
  file_path text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
  ));

CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
  ));

-- Document Insights table
CREATE TABLE IF NOT EXISTS document_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  summary text NOT NULL,
  sentiment numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their document insights"
  ON document_insights
  FOR SELECT
  TO authenticated
  USING (document_id IN (
    SELECT id FROM documents
  ));

-- Document Entities table
CREATE TABLE IF NOT EXISTS document_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their document entities"
  ON document_entities
  FOR SELECT
  TO authenticated
  USING (document_id IN (
    SELECT id FROM documents
  ));

-- Document Topics table
CREATE TABLE IF NOT EXISTS document_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  name text NOT NULL,
  relevance numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their document topics"
  ON document_topics
  FOR SELECT
  TO authenticated
  USING (document_id IN (
    SELECT id FROM documents
  ));