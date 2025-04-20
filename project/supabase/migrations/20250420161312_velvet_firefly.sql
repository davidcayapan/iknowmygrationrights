/*
  # Improve document processing status tracking

  1. Changes
    - Add trigger to update document status
    - Add timestamp tracking for processing
    - Add error message column for failed processing
    
  2. Security
    - No changes to existing RLS policies
*/

-- Add processing metadata columns
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
ADD COLUMN IF NOT EXISTS processing_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS error_message text;

-- Create function to update processing timestamps
CREATE OR REPLACE FUNCTION update_document_processing_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'processing' AND OLD.status != 'processing' THEN
    NEW.processing_started_at = now();
    NEW.processing_completed_at = NULL;
    NEW.error_message = NULL;
  ELSIF NEW.status = 'analyzed' AND OLD.status != 'analyzed' THEN
    NEW.processing_completed_at = now();
    NEW.error_message = NULL;
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    NEW.processing_completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS document_processing_status_trigger ON documents;
CREATE TRIGGER document_processing_status_trigger
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_processing_status();