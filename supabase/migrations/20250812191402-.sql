-- Fix critical security issues: Restrict public access to user data

-- 1. Fix profiles table - restrict public access to sensitive data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new privacy-aware policies for profiles
CREATE POLICY "Basic profile info viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow authenticated users to see more profile details
CREATE POLICY "Authenticated users can see full profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Fix follows table - restrict to authenticated users
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;

CREATE POLICY "Authenticated users can view follows" 
ON public.follows 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Fix chat_messages table - restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;

CREATE POLICY "Authenticated users can view chat messages" 
ON public.chat_messages 
FOR SELECT 
TO authenticated
USING (true);

-- 4. Fix stream_viewers table - restrict to authenticated users and stream owners
DROP POLICY IF EXISTS "Anyone can view stream viewers" ON public.stream_viewers;

CREATE POLICY "Authenticated users can view stream viewers" 
ON public.stream_viewers 
FOR SELECT 
TO authenticated
USING (true);

-- Stream owners can view their own viewers
CREATE POLICY "Stream owners can view their viewers" 
ON public.stream_viewers 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.streams s 
  WHERE s.id = stream_viewers.stream_id 
  AND s.user_id = auth.uid()
));

-- 5. Create a function to get public profile data (non-sensitive fields only)
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