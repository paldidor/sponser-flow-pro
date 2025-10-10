-- Drop existing function first
DROP FUNCTION IF EXISTS public.rpc_recommend_offers(double precision, double precision, double precision, numeric, numeric, text, text, text, integer);

-- Recreate rpc_recommend_offers with sport, logo, and images
CREATE OR REPLACE FUNCTION public.rpc_recommend_offers(
  p_lat double precision, 
  p_lon double precision, 
  p_radius_km double precision, 
  p_budget_min numeric DEFAULT 0, 
  p_budget_max numeric DEFAULT 999999, 
  p_sport text DEFAULT NULL::text, 
  p_category_slug text DEFAULT NULL::text, 
  p_base_url text DEFAULT 'https://preview--sponser-flow-pro.lovable.app/marketplace'::text, 
  p_limit integer DEFAULT 3
)
RETURNS TABLE(
  team_profile_id uuid, 
  team_name text, 
  distance_km double precision, 
  total_reach integer, 
  sponsorship_offer_id uuid, 
  package_id uuid, 
  package_name text, 
  price numeric, 
  est_cpf numeric, 
  marketplace_url text,
  sport text,
  logo text,
  images text[]
)
LANGUAGE sql
SECURITY DEFINER
AS $function$
with teams as (
  select *
  from rpc_search_teams_by_target(
    p_lat, p_lon, p_radius_km, p_budget_min, p_budget_max, p_sport
  )
),
top_teams as (
  select * from teams limit 10
),
packages as (
  select
    tt.team_profile_id,
    tt.team_name,
    tt.distance_km,
    tt.total_reach,
    sp.sponsorship_offer_id,
    gp.package_id,
    gp.name as package_name,
    gp.price,
    (select r.est_cpf
       from rpc_estimate_roi(tt.team_profile_id, gp.package_id, p_category_slug) r
       limit 1) as est_cpf,
    tp.sport,
    tp.logo,
    tp.images
  from top_teams tt
  cross join lateral rpc_get_team_packages(tt.team_profile_id, p_budget_min, p_budget_max) gp
  join public.sponsorship_packages sp on sp.id = gp.package_id
  join public.team_profiles tp on tp.id = tt.team_profile_id
),
scored as (
  select
    p.*,
    (case when p.est_cpf is not null then 1 else 0 end) as has_cpf
  from packages p
)
select
  team_profile_id,
  team_name,
  distance_km,
  total_reach,
  sponsorship_offer_id,
  package_id,
  package_name,
  price,
  est_cpf,
  rtrim(p_base_url, '/') || '/' || sponsorship_offer_id::text as marketplace_url,
  sport,
  logo,
  images
from scored
order by has_cpf desc, est_cpf asc nulls last, distance_km asc, price asc
limit p_limit;
$function$;