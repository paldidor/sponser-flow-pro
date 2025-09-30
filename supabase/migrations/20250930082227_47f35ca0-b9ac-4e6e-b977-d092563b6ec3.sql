-- Create storage bucket for sponsorship PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sponsorship-pdfs',
  'sponsorship-pdfs',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
);

-- RLS policies for sponsorship-pdfs bucket
CREATE POLICY "Users can upload their own PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sponsorship-pdfs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'sponsorship-pdfs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'sponsorship-pdfs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);