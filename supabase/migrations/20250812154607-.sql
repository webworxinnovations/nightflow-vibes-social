-- Fix security vulnerability: Remove overly permissive policies that expose sensitive streaming credentials
-- Drop the problematic policies that allow anyone to view all stream data
DROP POLICY IF EXISTS "Anyone can view active streams" ON public.streams;
DROP POLICY IF EXISTS "Live streams are viewable by everyone" ON public.streams;

-- Create a secure policy that only allows stream owners to view their own streams
CREATE POLICY "Users can view their own streams"
ON public.streams
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a public view for non-sensitive stream data that others can safely access
CREATE OR REPLACE VIEW public.public_streams AS
SELECT 
    id,
    user_id,
    status,
    viewer_count,
    max_viewers,
    duration,
    started_at,
    ended_at,
    created_at,
    title,
    description,
    resolution
FROM public.streams
WHERE is_active = true AND status = 'live';

-- Enable RLS on the view (though it's read-only)
ALTER VIEW public.public_streams SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.public_streams TO authenticated, anon;