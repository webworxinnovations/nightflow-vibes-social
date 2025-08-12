-- Fix security warnings: Set immutable search paths for functions with mutable search paths

-- Fix get_safe_profile function search path
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
SET search_path = ''
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

-- Fix get_public_profile_safe function search path
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_username text)
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
SET search_path = ''
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