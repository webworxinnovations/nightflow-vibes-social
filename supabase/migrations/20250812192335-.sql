-- Critical Security Fix: Enhance stream credentials protection (Fixed)

-- 1. First, update existing stream keys to match the required format
UPDATE public.stream_credentials 
SET stream_key = 'nf_' || extract(epoch from created_at)::text || '_' || encode(gen_random_bytes(4), 'hex')
WHERE NOT (stream_key ~ '^nf_[0-9]+_[a-z0-9]+$');

-- 2. Add stream key expiry functionality
ALTER TABLE public.stream_credentials ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '24 hours');
ALTER TABLE public.stream_credentials ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone DEFAULT NULL;

-- 3. Update existing credentials to have proper expiry
UPDATE public.stream_credentials 
SET expires_at = created_at + interval '24 hours'
WHERE expires_at IS NULL;

-- 4. Create secure function to validate stream key with enhanced security
CREATE OR REPLACE FUNCTION public.validate_stream_key_secure(stream_key_param text)
RETURNS TABLE(is_valid boolean, stream_id uuid, user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if stream key exists, is not expired, and not revoked
  RETURN QUERY
  SELECT 
    CASE 
      WHEN sc.stream_key IS NOT NULL 
           AND sc.expires_at > now() 
           AND sc.revoked_at IS NULL
           AND s.is_active = true
      THEN true 
      ELSE false 
    END as is_valid,
    s.id as stream_id,
    s.user_id as user_id
  FROM public.stream_credentials sc
  JOIN public.streams s ON s.id = sc.stream_id
  WHERE sc.stream_key = stream_key_param
  LIMIT 1;
  
  -- If no results, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
  END IF;
END;
$$;

-- 5. Create function to revoke stream credentials
CREATE OR REPLACE FUNCTION public.revoke_stream_credentials(stream_key_param text, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  stream_owner_id uuid;
BEGIN
  -- Get the stream owner
  SELECT s.user_id INTO stream_owner_id
  FROM public.stream_credentials sc
  JOIN public.streams s ON s.id = sc.stream_id
  WHERE sc.stream_key = stream_key_param;
  
  -- Check if the requesting user owns the stream
  IF stream_owner_id != user_id_param THEN
    RAISE EXCEPTION 'Access denied: Not stream owner';
  END IF;
  
  -- Revoke the credentials
  UPDATE public.stream_credentials 
  SET revoked_at = now()
  WHERE stream_key = stream_key_param;
  
  -- Deactivate the stream
  UPDATE public.streams
  SET is_active = false, status = 'offline'
  WHERE user_id = user_id_param AND is_active = true;
  
  RETURN true;
END;
$$;

-- 6. Create function to generate secure stream key
CREATE OR REPLACE FUNCTION public.generate_secure_stream_key(user_id_param uuid)
RETURNS TABLE(stream_key text, rtmp_url text, hls_url text, stream_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_stream_key text;
  new_stream_id uuid;
  rtmp_base_url text := 'rtmp://67.205.179.77:1935/live';
  hls_base_url text := 'https://67.205.179.77:3443/live';
BEGIN
  -- Check if user is authenticated
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  -- Generate cryptographically secure stream key
  new_stream_key := 'nf_' || extract(epoch from now())::text || '_' || encode(gen_random_bytes(8), 'hex');
  
  -- First, revoke any existing active streams for this user
  UPDATE public.streams 
  SET is_active = false, status = 'offline'
  WHERE user_id = user_id_param AND is_active = true;
  
  UPDATE public.stream_credentials
  SET revoked_at = now()
  WHERE stream_id IN (
    SELECT id FROM public.streams WHERE user_id = user_id_param
  ) AND revoked_at IS NULL;
  
  -- Create new stream record
  INSERT INTO public.streams (user_id, title, description, status, is_active)
  VALUES (user_id_param, 'Live DJ Stream', 'Live DJ Performance', 'offline', true)
  RETURNING id INTO new_stream_id;
  
  -- Store credentials with expiry
  INSERT INTO public.stream_credentials (stream_id, stream_key, rtmp_url, hls_url, expires_at)
  VALUES (
    new_stream_id, 
    new_stream_key, 
    rtmp_base_url, 
    hls_base_url || '/' || new_stream_key || '/index.m3u8',
    now() + interval '24 hours'
  );
  
  RETURN QUERY SELECT 
    new_stream_key,
    rtmp_base_url as rtmp_url,
    (hls_base_url || '/' || new_stream_key || '/index.m3u8') as hls_url,
    new_stream_id;
END;
$$;

-- 7. Add audit logging for stream credential access
CREATE TABLE IF NOT EXISTS public.stream_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id uuid REFERENCES public.streams(id),
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.stream_audit_log ENABLE ROW LEVEL SECURITY;

-- Only stream owners can view their audit logs
CREATE POLICY "Stream owners can view their audit logs"
ON public.stream_audit_log
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.streams s 
    WHERE s.id = stream_audit_log.stream_id 
    AND s.user_id = auth.uid()
  )
);

-- 8. Add indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_stream_credentials_expires_at ON public.stream_credentials(expires_at);
CREATE INDEX IF NOT EXISTS idx_stream_credentials_revoked_at ON public.stream_credentials(revoked_at);
CREATE INDEX IF NOT EXISTS idx_stream_audit_log_user_id ON public.stream_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_audit_log_created_at ON public.stream_audit_log(created_at);