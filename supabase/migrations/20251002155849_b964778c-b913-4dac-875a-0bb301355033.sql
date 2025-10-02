-- Enable public read access to published sponsorship offers for marketplace
-- This allows anyone (authenticated or not) to view intentionally published offers

-- Policy 1: Allow anyone to view published sponsorship offers
CREATE POLICY "Anyone can view published sponsorship offers"
ON public.sponsorship_offers
FOR SELECT
USING (status = 'published');

-- Policy 2: Allow anyone to view team profiles that have published offers
CREATE POLICY "Anyone can view team profiles with published offers"
ON public.team_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sponsorship_offers
    WHERE sponsorship_offers.team_profile_id = team_profiles.id
    AND sponsorship_offers.status = 'published'
  )
);

-- Policy 3: Allow anyone to view packages of published offers
CREATE POLICY "Anyone can view packages of published offers"
ON public.sponsorship_packages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sponsorship_offers
    WHERE sponsorship_offers.id = sponsorship_packages.sponsorship_offer_id
    AND sponsorship_offers.status = 'published'
  )
);