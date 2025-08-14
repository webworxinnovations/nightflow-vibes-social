-- Security Fix #1: Restrict event lineup access to published events only
DROP POLICY IF EXISTS "Event lineups are viewable by everyone" ON event_lineup;
CREATE POLICY "Event lineups viewable for published events" 
ON event_lineup 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_lineup.event_id 
    AND (e.status != 'draft' OR e.organizer_id = auth.uid())
  )
);

-- Security Fix #2: Add RLS policies to public_streams table
ALTER TABLE public_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view live streams only" 
ON public_streams 
FOR SELECT 
USING (status = 'live'::stream_status);

-- Security Fix #3: Make chat_messages.user_id non-nullable and add constraint
ALTER TABLE chat_messages 
ALTER COLUMN user_id SET NOT NULL;

-- Add constraint to ensure user_id matches authenticated user
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_user_id_check 
CHECK (user_id = auth.uid());

-- Security Fix #4: Update database functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy(profile_id uuid)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone, website text, instagram text, spotify text, soundcloud text, location text, streaming_title text, streaming_description text, total_tips_received numeric, last_streamed_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone, website text, instagram text, spotify text, soundcloud text, location text, streaming_title text, streaming_description text, total_tips_received numeric, last_streamed_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_username text)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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
SET search_path TO 'public'
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
SET search_path TO 'public'
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
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.follows f
    WHERE f.follower_id = auth.uid() 
    AND f.following_id = profile_id
  );
$function$;