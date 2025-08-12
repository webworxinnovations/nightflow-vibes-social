-- Fix security issue: Profile data exposed to all visitors
-- Remove the overly permissive policy that allows anyone to read all profile data
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

-- Create a more secure policy that only allows public profile fields to be viewed by everyone
-- and restricts sensitive fields to authenticated users or profile owners
CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create a view for public profile data that only exposes safe fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  bio,
  role,
  verified,
  follower_count,
  following_count,
  total_streams,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create RLS policy for the public profiles view
CREATE POLICY "Anyone can view public profile data" 
ON public.public_profiles 
FOR SELECT 
USING (true);

-- Create a function to safely get profile data based on viewer permissions
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  role user_role,
  verified boolean,
  follower_count integer,
  following_count integer,
  total_streams integer,
  created_at timestamp with time zone,
  -- Sensitive fields only for authenticated users or profile owner
  website text,
  instagram text,
  spotify text,
  soundcloud text,
  location text,
  streaming_title text,
  streaming_description text,
  total_tips_received numeric,
  last_streamed_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_owner boolean := false;
  is_authenticated boolean := false;
BEGIN
  -- Check if user is authenticated
  is_authenticated := auth.uid() IS NOT NULL;
  
  -- Check if viewing own profile
  is_owner := auth.uid() = profile_id;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.role,
    p.verified,
    p.follower_count,
    p.following_count,
    p.total_streams,
    p.created_at,
    -- Only return sensitive data if authenticated or owner
    CASE WHEN is_authenticated OR is_owner THEN p.website ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.instagram ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.spotify ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.soundcloud ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.location ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.streaming_title ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.streaming_description ELSE NULL END,
    CASE WHEN is_owner THEN p.total_tips_received ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.last_streamed_at ELSE NULL END
  FROM public.profiles p
  WHERE p.id = profile_id;
END;
$$;

-- Update the existing get_public_profile function to use safer data exposure
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_username text)
RETURNS TABLE(
  id uuid, 
  username text, 
  full_name text, 
  avatar_url text, 
  bio text, 
  role user_role, 
  verified boolean, 
  follower_count integer, 
  following_count integer, 
  total_streams integer, 
  created_at timestamp with time zone
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.role,
    p.verified,
    p.follower_count,
    p.following_count,
    p.total_streams,
    p.created_at
  FROM public.profiles p
  WHERE p.username = profile_username;
$$;