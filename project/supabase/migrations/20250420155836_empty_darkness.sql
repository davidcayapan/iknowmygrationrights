/*
  # Add status column to documents table

  1. Changes
    - Add `status` column to `documents` table with valid states:
      - 'processing': Document is being analyzed
      - 'analyzed': Document analysis is complete
      - 'failed': Document analysis failed
    - Set default value to 'processing'
    - Add check constraint to ensure valid status values

  2. Security
    - No changes to RLS policies needed
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE documents 
    ADD COLUMN status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'analyzed', 'failed'));
  END IF;
END $$;