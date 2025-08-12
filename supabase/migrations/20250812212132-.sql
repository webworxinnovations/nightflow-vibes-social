-- Fix remaining security warnings

-- Update all functions to have immutable search paths
CREATE OR REPLACE FUNCTION public.get_stream_credentials(stream_id_param uuid)
RETURNS TABLE(stream_key text, rtmp_url text, hls_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

CREATE OR REPLACE FUNCTION public.validate_stream_key_secure(stream_key_param text)
RETURNS TABLE(is_valid boolean, stream_id uuid, user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.revoke_stream_credentials(stream_key_param text, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_secure_stream_key(user_id_param uuid)
RETURNS TABLE(stream_key text, rtmp_url text, hls_url text, stream_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_tip_totals_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update recipient's total tips received
  UPDATE public.profiles 
  SET total_tips_received = COALESCE(total_tips_received, 0) + NEW.amount
  WHERE id = NEW.recipient_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_tip_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET total_tips_received = total_tips_received + NEW.amount
  WHERE id = NEW.recipient_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;