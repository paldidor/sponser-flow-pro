-- Make the sponsorship-pdfs bucket public for Make.com access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'sponsorship-pdfs';

-- Add pdf_public_url field to sponsorship_offers for easy access
ALTER TABLE sponsorship_offers 
ADD COLUMN IF NOT EXISTS pdf_public_url text;

-- Add analysis_status field to track Make.com processing
ALTER TABLE sponsorship_offers 
ADD COLUMN IF NOT EXISTS analysis_status text DEFAULT 'pending';

-- Add comment for clarity
COMMENT ON COLUMN sponsorship_offers.pdf_public_url IS 'Public URL for the uploaded PDF file, accessible by Make.com for analysis';
COMMENT ON COLUMN sponsorship_offers.analysis_status IS 'Status of PDF analysis: pending, processing, completed, failed';