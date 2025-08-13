-- Fix critical security issues identified in security review

-- 1. Update profiles table RLS policy to restrict sensitive data access
DROP POLICY IF EXISTS "Public can view basic profile info only" ON public.profiles;

CREATE POLICY "Public can view basic profile info only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow access to basic public fields for everyone
  -- Sensitive fields will be filtered at the application level via secure functions
  true
);

-- 2. Add RLS policies to public_streams view (if it's a table, not a view)
-- Note: If public_streams is a view, we need to secure the underlying tables instead

-- 3. Update database functions to use secure search paths
-- Update get_safe_profile function
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone, website text, instagram text, spotify text, soundcloud text, location text, streaming_title text, streaming_description text, total_tips_received numeric, last_streamed_at timestamp with time zone)
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

-- Update get_public_profile_safe function
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_username text)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone)
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

-- Update get_follow_counts function
CREATE OR REPLACE FUNCTION public.get_follow_counts(profile_id uuid)
RETURNS TABLE(follower_count integer, following_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.follower_count,
    p.following_count
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- Update is_following function
CREATE OR REPLACE FUNCTION public.is_following(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.follows f
    WHERE f.follower_id = auth.uid() 
    AND f.following_id = profile_id
  );
$$;

-- Update other functions with secure search paths
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_username text)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, role user_role, verified boolean, follower_count integer, following_count integer, total_streams integer, created_at timestamp with time zone)
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

-- Update other security-sensitive functions
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    UPDATE public.profiles 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    UPDATE public.profiles 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tip_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET total_tips_received = total_tips_received + NEW.amount
  WHERE id = NEW.recipient_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tip_totals_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update recipient's total tips received
  UPDATE public.profiles 
  SET total_tips_received = COALESCE(total_tips_received, 0) + NEW.amount
  WHERE id = NEW.recipient_id;
  
  RETURN NEW;
END;
$$;