-- Phase 1: Add status column to sponsorship_packages table

-- 1. Add status column with CHECK constraint
ALTER TABLE sponsorship_packages 
ADD COLUMN status TEXT NOT NULL DEFAULT 'live'
CHECK (status IN ('sold-active', 'live', 'draft', 'inactive'));

-- 2. Backfill existing packages with appropriate statuses
-- Set to 'sold-active' if package has an associated sponsor
UPDATE sponsorship_packages sp
SET status = 'sold-active'
WHERE EXISTS (
  SELECT 1 FROM sponsors s
  WHERE s.package_id = sp.id
);

-- Set to 'draft' if the parent offer is in draft status
UPDATE sponsorship_packages sp
SET status = 'draft'
FROM sponsorship_offers so
WHERE sp.sponsorship_offer_id = so.id
  AND so.status = 'draft'
  AND sp.status != 'sold-active'; -- Don't override sold-active packages

-- All others remain 'live' (already set by DEFAULT)

-- 3. Add index for better query performance
CREATE INDEX idx_sponsorship_packages_status ON sponsorship_packages(status);

-- 4. Add comment for documentation
COMMENT ON COLUMN sponsorship_packages.status IS 'Package status: sold-active (has sponsor), live (available), draft (not published), inactive (manually disabled)';