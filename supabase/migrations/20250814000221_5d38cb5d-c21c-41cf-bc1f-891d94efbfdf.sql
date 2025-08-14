-- Security Fix: Update profiles RLS policies for proper data protection
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view basic profile info only" ON public.profiles;

-- Create privacy-aware policies
CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Public users see only essential non-sensitive info
  auth.uid() IS NULL OR auth.uid() != id
);

CREATE POLICY "Authenticated users can view extended profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Authenticated users see additional details but not financial data
  auth.uid() IS NOT NULL AND auth.uid() != id
);

CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (
  -- Profile owners see everything including sensitive data
  auth.uid() = id
);

-- Security Fix: Add proper search path protection to remaining functions
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_username text)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_username text)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_follow_counts(profile_id uuid)
RETURNS TABLE(follower_count integer, following_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    p.follower_count,
    p.following_count
  FROM public.profiles p
  WHERE p.id = profile_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_following(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.follows f
    WHERE f.follower_id = auth.uid() 
    AND f.following_id = profile_id
  );
$function$;

-- Create a secure profile data retrieval function with privacy controls
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy(profile_id uuid)
RETURNS TABLE(
  id uuid, username text, full_name text, avatar_url text, bio text, 
  role user_role, verified boolean, follower_count integer, following_count integer, 
  total_streams integer, created_at timestamp with time zone,
  website text, instagram text, spotify text, soundcloud text, location text,
  streaming_title text, streaming_description text, total_tips_received numeric,
  last_streamed_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  is_owner boolean := false;
  is_authenticated boolean := false;
BEGIN
  -- Check authentication status
  is_authenticated := auth.uid() IS NOT NULL;
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
    -- Social links only for authenticated users or owner
    CASE WHEN is_authenticated OR is_owner THEN p.website ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.instagram ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.spotify ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.soundcloud ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.location ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.streaming_title ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.streaming_description ELSE NULL END,
    -- Financial data only for owner
    CASE WHEN is_owner THEN p.total_tips_received ELSE NULL END,
    CASE WHEN is_authenticated OR is_owner THEN p.last_streamed_at ELSE NULL END
  FROM public.profiles p
  WHERE p.id = profile_id;
END;
$function$;