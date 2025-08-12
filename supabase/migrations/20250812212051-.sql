-- Phase 1: Critical Authentication & Infrastructure Fixes

-- Fix function search paths to be immutable and secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'fan'::user_role)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Add comprehensive audit logging for security events
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  payment_intent_id text,
  action text NOT NULL,
  amount numeric,
  recipient_id uuid,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert audit logs
CREATE POLICY "Service role can insert payment audit logs" ON public.payment_audit_log
FOR INSERT WITH CHECK (false);

-- Users can view their own payment audit logs
CREATE POLICY "Users can view their payment audit logs" ON public.payment_audit_log
FOR SELECT USING (auth.uid() = user_id);

-- Add rate limiting table for authentication
CREATE TABLE IF NOT EXISTS public.auth_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  action text NOT NULL, -- 'login', 'signup', 'password_reset'
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

ALTER TABLE public.auth_rate_limit ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limiting
CREATE POLICY "Service role manages rate limiting" ON public.auth_rate_limit
FOR ALL USING (false);

-- Add payment status tracking
ALTER TABLE public.tips ADD COLUMN IF NOT EXISTS payment_verified boolean DEFAULT false;
ALTER TABLE public.tips ADD COLUMN IF NOT EXISTS verification_date timestamp with time zone;
ALTER TABLE public.tips ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Add audit logging function for payments
CREATE OR REPLACE FUNCTION public.log_payment_event(
  p_user_id uuid,
  p_payment_intent_id text,
  p_action text,
  p_amount numeric DEFAULT NULL,
  p_recipient_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT false,
  p_error_message text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.payment_audit_log (
    user_id, payment_intent_id, action, amount, recipient_id, 
    ip_address, user_agent, success, error_message
  ) VALUES (
    p_user_id, p_payment_intent_id, p_action, p_amount, p_recipient_id,
    p_ip_address, p_user_agent, p_success, p_error_message
  );
END;
$function$;