-- Phase 1: Business User Foundation - Database Setup

-- 1. Add 'business' to app_role enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'business' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE app_role ADD VALUE 'business';
  END IF;
END $$;

-- 2. Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  industry text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  website text,
  seed_url text,
  domain text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  current_onboarding_step text NOT NULL DEFAULT 'account_created',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Create index for faster lookups
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);

-- 4. Enable RLS on business_profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for business_profiles
CREATE POLICY "Users can create their own business profile"
  ON public.business_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own business profile"
  ON public.business_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
  ON public.business_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view business profiles"
  ON public.business_profiles
  FOR SELECT
  USING (true);

-- 6. Add trigger for updated_at timestamp
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- 7. CRITICAL: Update handle_new_user() to NOT auto-assign 'team' role
-- Role will be assigned AFTER user type selection in the new flow
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile only (no automatic role assignment)
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  
  -- NOTE: Role will be assigned during user type selection
  -- This prevents auto-assignment of 'team' role to all new users
  
  RETURN NEW;
END;
$$;

-- 8. Update user_roles RLS to allow one-time self-assignment
-- This allows users to set their own role ONCE during onboarding
CREATE POLICY "Users can assign their own role once"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );