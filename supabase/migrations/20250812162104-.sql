-- Fix streaming credentials security by separating sensitive data from public data

-- Create a secure credentials table that only stores sensitive streaming data
CREATE TABLE IF NOT EXISTS public.stream_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL UNIQUE REFERENCES public.streams(id) ON DELETE CASCADE,
  stream_key TEXT NOT NULL,
  rtmp_url TEXT NOT NULL,
  hls_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on stream_credentials
ALTER TABLE public.stream_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy so only stream owners can access their credentials
CREATE POLICY "Stream owners can access their credentials" 
ON public.stream_credentials 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.streams s 
    WHERE s.id = stream_credentials.stream_id 
    AND s.user_id = auth.uid()
  )
);

-- Migrate existing credentials to the new table
INSERT INTO public.stream_credentials (stream_id, stream_key, rtmp_url, hls_url, created_at, updated_at)
SELECT id, stream_key, rtmp_url, hls_url, created_at, updated_at
FROM public.streams 
WHERE stream_key IS NOT NULL 
AND rtmp_url IS NOT NULL 
AND hls_url IS NOT NULL
ON CONFLICT (stream_id) DO NOTHING;

-- Remove sensitive columns from streams table
ALTER TABLE public.streams DROP COLUMN IF EXISTS stream_key;
ALTER TABLE public.streams DROP COLUMN IF EXISTS rtmp_url;
ALTER TABLE public.streams DROP COLUMN IF EXISTS hls_url;

-- Update public viewing policies
DROP POLICY IF EXISTS "Users can view their own streams" ON public.streams;
DROP POLICY IF EXISTS "Public can view live streams metadata" ON public.streams;

-- Allow users to view their own streams completely
CREATE POLICY "Users can view their own streams" 
ON public.streams 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow public to view only non-sensitive live stream info
CREATE POLICY "Public can view live streams" 
ON public.streams 
FOR SELECT 
USING (is_active = true AND status = 'live');

-- Create a function to get stream credentials securely
CREATE OR REPLACE FUNCTION public.get_stream_credentials(stream_id_param UUID)
RETURNS TABLE(
  stream_key TEXT,
  rtmp_url TEXT,
  hls_url TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user owns this stream
  IF NOT EXISTS (
    SELECT 1 FROM public.streams s 
    WHERE s.id = stream_id_param 
    AND s.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Not stream owner';
  END IF;

  -- Return credentials only for stream owner
  RETURN QUERY
  SELECT sc.stream_key, sc.rtmp_url, sc.hls_url
  FROM public.stream_credentials sc
  WHERE sc.stream_id = stream_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fix financial data access - restrict sub-promoter access to detailed financial info
DROP POLICY IF EXISTS "Ticket sales viewable by involved parties" ON public.ticket_sales;

CREATE POLICY "Buyers can view their ticket purchases" 
ON public.ticket_sales 
FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Event organizers can view all sales for their events" 
ON public.ticket_sales 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.events e 
  WHERE e.id = ticket_sales.event_id 
  AND e.organizer_id = auth.uid()
));

CREATE POLICY "Sub-promoters can view their commission data only" 
ON public.ticket_sales 
FOR SELECT 
USING (auth.uid() = sub_promoter_id);

-- Improve tip privacy - separate viewing policies
DROP POLICY IF EXISTS "Users can view tips they sent or received" ON public.tips;

CREATE POLICY "Users can view tips they sent" 
ON public.tips 
FOR SELECT 
USING (auth.uid() = tipper_id);

CREATE POLICY "Users can view tips they received" 
ON public.tips 
FOR SELECT 
USING (auth.uid() = recipient_id);

-- Fix the security definer view issue by removing public_streams view if it exists
DROP VIEW IF EXISTS public.public_streams;

-- Create a safe public view for live streams without sensitive data
CREATE VIEW public.public_streams AS
SELECT 
  s.id,
  s.user_id,
  s.status,
  s.viewer_count,
  s.max_viewers,
  s.duration,
  s.started_at,
  s.created_at,
  s.title,
  s.description,
  s.resolution,
  p.username,
  p.avatar_url,
  p.full_name
FROM public.streams s
JOIN public.profiles p ON s.user_id = p.id
WHERE s.is_active = true AND s.status = 'live';

-- Enable RLS on the view
ALTER VIEW public.public_streams SET (security_invoker = on);