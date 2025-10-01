-- Create sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  package_id uuid REFERENCES public.sponsorship_packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  bio text,
  website text,
  social_links jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create creative_assets table
CREATE TABLE IF NOT EXISTS public.creative_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  asset_name text NOT NULL,
  asset_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Create policies for sponsors
CREATE POLICY "Users can view their own sponsors" 
ON public.sponsors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sponsors" 
ON public.sponsors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sponsors" 
ON public.sponsors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sponsors" 
ON public.sponsors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on creative_assets
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for creative_assets
CREATE POLICY "Users can view assets of their sponsors" 
ON public.creative_assets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.sponsors 
  WHERE sponsors.id = creative_assets.sponsor_id 
  AND sponsors.user_id = auth.uid()
));

CREATE POLICY "Users can create assets for their sponsors" 
ON public.creative_assets 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.sponsors 
  WHERE sponsors.id = creative_assets.sponsor_id 
  AND sponsors.user_id = auth.uid()
));

CREATE POLICY "Users can update assets of their sponsors" 
ON public.creative_assets 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.sponsors 
  WHERE sponsors.id = creative_assets.sponsor_id 
  AND sponsors.user_id = auth.uid()
));

CREATE POLICY "Users can delete assets of their sponsors" 
ON public.creative_assets 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.sponsors 
  WHERE sponsors.id = creative_assets.sponsor_id 
  AND sponsors.user_id = auth.uid()
));

-- Add trigger for updated_at on sponsors
CREATE TRIGGER update_sponsors_updated_at
BEFORE UPDATE ON public.sponsors
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create indexes for performance
CREATE INDEX idx_sponsors_user_id ON public.sponsors(user_id);
CREATE INDEX idx_sponsors_package_id ON public.sponsors(package_id);
CREATE INDEX idx_creative_assets_sponsor_id ON public.creative_assets(sponsor_id);