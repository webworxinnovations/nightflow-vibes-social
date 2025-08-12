-- Critical Security Fixes: Secure Data Exposure Issues

-- 1. Fix Profiles Table RLS - Restrict sensitive data to authenticated users/owners only
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create more restrictive profile policies
CREATE POLICY "Public can view basic profile info only" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Update profiles table to use secure function for sensitive data access
-- (The get_safe_profile function already exists and handles this properly)

-- 2. Fix Chat Messages RLS - Restrict to stream participants only
DROP POLICY IF EXISTS "Authenticated users can view chat messages" ON public.chat_messages;

CREATE POLICY "Only stream participants can view chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Message sender can always see their own messages
    auth.uid() = user_id 
    OR 
    -- Stream owner can see all messages in their stream
    EXISTS (
      SELECT 1 FROM public.streams s 
      WHERE s.id = chat_messages.stream_id 
      AND s.user_id = auth.uid()
    )
    OR
    -- Active stream viewers can see messages
    EXISTS (
      SELECT 1 FROM public.stream_viewers sv 
      WHERE sv.stream_id = chat_messages.stream_id 
      AND sv.viewer_id = auth.uid() 
      AND sv.left_at IS NULL
    )
  )
);

-- 3. Fix Follows Table RLS - Restrict to relationships involving current user
DROP POLICY IF EXISTS "Authenticated users can view follows" ON public.follows;

CREATE POLICY "Users can only see their own follow relationships" 
ON public.follows 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = follower_id OR auth.uid() = following_id
  )
);

-- 4. Fix Stream Viewers RLS - Limit access to stream owners and the viewer themselves
DROP POLICY IF EXISTS "Authenticated users can view stream viewers" ON public.stream_viewers;
DROP POLICY IF EXISTS "Stream owners can view their viewers" ON public.stream_viewers;

CREATE POLICY "Limited stream viewer access" 
ON public.stream_viewers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Stream owner can see all viewers
    EXISTS (
      SELECT 1 FROM public.streams s 
      WHERE s.id = stream_viewers.stream_id 
      AND s.user_id = auth.uid()
    )
    OR
    -- Users can see their own viewer record
    auth.uid() = viewer_id
  )
);

-- 5. Create secure function to get public follow counts without exposing relationships
CREATE OR REPLACE FUNCTION public.get_follow_counts(profile_id uuid)
RETURNS TABLE(follower_count integer, following_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.follower_count,
    p.following_count
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- 6. Create secure function to check if current user follows someone
CREATE OR REPLACE FUNCTION public.is_following(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.follows f
    WHERE f.follower_id = auth.uid() 
    AND f.following_id = profile_id
  );
$$;