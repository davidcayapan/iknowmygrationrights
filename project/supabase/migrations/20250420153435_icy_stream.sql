-- Update the bucket name to 'Documents'
UPDATE storage.buckets 
SET id = 'Documents', name = 'Documents'
WHERE id = 'documents';

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create new policies with correct bucket name
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'Documents'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'Documents'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'Documents'
    AND auth.uid() IS NOT NULL
)
WITH CHECK (
    bucket_id = 'Documents'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'Documents'
    AND auth.uid() IS NOT NULL
);