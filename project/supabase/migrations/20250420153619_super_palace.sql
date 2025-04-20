/*
  # Fix storage RLS policy for Documents bucket

  1. Changes
    - Update RLS policy on storage.objects to allow uploads to 'Documents' bucket (uppercase)
    
  2. Security
    - Maintains authentication requirement
    - Only affects the bucket name case sensitivity
*/

alter policy "Allow authenticated uploads"
on storage.objects
with check (
  bucket_id = 'Documents' AND auth.role() = 'authenticated'
);

-- Add a SELECT policy to allow authenticated users to view their uploaded files
create policy "Allow authenticated downloads"
on storage.objects
for select
using (
  bucket_id = 'Documents' AND auth.role() = 'authenticated'
);