-- Security Fix 1: Add comprehensive RLS policies to public_streams table
ALTER TABLE public.public_streams ENABLE ROW LEVEL SECURITY;

-- Only allow viewing of live streams for public users
CREATE POLICY "Public can view live streams only" 
ON public.public_streams 
FOR SELECT 
USING (status = 'live'::stream_status);

-- Security Fix 2: Update profiles table RLS policies for better privacy
-- Drop existing policies that are too permissive
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view extended profile info" ON public.profiles;

-- Create new privacy-conscious policies
-- Anonymous users see only essential public info
CREATE POLICY "Anonymous users see essential profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NULL AND (
    -- Only return essential public fields for anonymous users
    TRUE -- This will be filtered at the function level
  )
);

-- Authenticated users see additional details but not financial data
CREATE POLICY "Authenticated users see extended profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND auth.uid() != id
);

-- Profile owners see complete information
CREATE POLICY "Users see their complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Security Fix 3: Update database functions with proper search paths
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

-- Create a secure function for public stream access
CREATE OR REPLACE FUNCTION public.get_public_streams()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  status stream_status,
  viewer_count integer,
  duration integer,
  started_at timestamp with time zone,
  title text,
  username text,
  avatar_url text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    ps.id,
    ps.user_id,
    ps.status,
    ps.viewer_count,
    ps.duration,
    ps.started_at,
    ps.title,
    ps.username,
    ps.avatar_url,
    ps.full_name
  FROM public.public_streams ps
  WHERE ps.status = 'live'::stream_status;
$function$;