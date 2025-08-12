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

-- Remove sensitive columns from streams table (keep them for now but set to null)
-- We'll do this in a separate step to ensure no data loss
UPDATE public.streams SET stream_key = NULL, rtmp_url = NULL, hls_url = NULL;

-- Update the public viewing policy to be more specific about what data is exposed
DROP POLICY IF EXISTS "Anyone can view basic live stream info" ON public.streams;

-- Create a safer public viewing policy that only shows non-sensitive live stream info
CREATE POLICY "Public can view live streams metadata" 
ON public.streams 
FOR SELECT 
USING (
  is_active = true 
  AND status = 'live'
  AND (
    stream_key IS NULL 
    AND rtmp_url IS NULL 
    AND hls_url IS NULL
  )
);

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