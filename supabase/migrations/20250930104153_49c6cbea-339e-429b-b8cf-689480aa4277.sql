-- Create RLS policies for sponsorship-pdfs storage bucket

-- Allow authenticated users to upload files to sponsorship-pdfs bucket
CREATE POLICY "Authenticated users can upload sponsorship PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sponsorship-pdfs'
);

-- Allow public access to read files from sponsorship-pdfs bucket (since bucket is public)
CREATE POLICY "Anyone can view sponsorship PDFs"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'sponsorship-pdfs'
);

-- Allow authenticated users to update their own uploaded files
CREATE POLICY "Authenticated users can update their sponsorship PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'sponsorship-pdfs' AND
  owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'sponsorship-pdfs'
);

-- Allow authenticated users to delete their own uploaded files
CREATE POLICY "Authenticated users can delete their sponsorship PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'sponsorship-pdfs' AND
  owner = auth.uid()
);