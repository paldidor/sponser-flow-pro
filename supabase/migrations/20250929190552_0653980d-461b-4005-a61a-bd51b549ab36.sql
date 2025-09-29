-- Enable realtime for team_profiles table
ALTER TABLE public.team_profiles REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_profiles;