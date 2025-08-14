-- Complete Security Fixes: Financial Data Protection and Audit Log Security

-- Security Fix 4: Secure tips table - restrict financial data access
DROP POLICY IF EXISTS "Users can view tips they received" ON public.tips;
DROP POLICY IF EXISTS "Users can view tips they sent" ON public.tips;

-- Only allow users to see tips they sent or received, no cross-user financial data access
CREATE POLICY "Users can view their sent tips only"
ON public.tips
FOR SELECT
USING (auth.uid() = tipper_id);

CREATE POLICY "Users can view their received tips only"
ON public.tips
FOR SELECT
USING (auth.uid() = recipient_id);

-- Ensure tip amounts are only visible to involved parties
CREATE POLICY "Users can insert their own tips"
ON public.tips
FOR INSERT
WITH CHECK (auth.uid() = tipper_id);

-- Security Fix 5: Secure ticket_sales table - restrict financial access
DROP POLICY IF EXISTS "Buyers can view their ticket purchases" ON public.ticket_sales;
DROP POLICY IF EXISTS "Event organizers can view all sales for their events" ON public.ticket_sales;
DROP POLICY IF EXISTS "Sub-promoters can view their commission data only" ON public.ticket_sales;

-- Buyers can only see their own purchases (no financial data leakage)
CREATE POLICY "Buyers see their purchases only"
ON public.ticket_sales
FOR SELECT
USING (auth.uid() = buyer_id);

-- Event organizers can see sales for their events (business need)
CREATE POLICY "Event organizers see their event sales"
ON public.ticket_sales
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = ticket_sales.event_id 
    AND e.organizer_id = auth.uid()
  )
);

-- Sub-promoters can only see their own commission data
CREATE POLICY "Sub-promoters see their commission data"
ON public.ticket_sales
FOR SELECT
USING (auth.uid() = sub_promoter_id);

-- Security Fix 6: Secure audit logs - administrative access only
DROP POLICY IF EXISTS "security_audit_log_admin_only" ON public.security_audit_log;
DROP POLICY IF EXISTS "Service role can insert payment audit logs" ON public.payment_audit_log;
DROP POLICY IF EXISTS "Users can view their payment audit logs" ON public.payment_audit_log;

-- Security audit logs - only accessible by service role and specific admin functions
CREATE POLICY "Security audit logs restricted access"
ON public.security_audit_log
FOR ALL
USING (
  -- Only allow access through service role or specific admin users
  current_setting('role') = 'service_role' OR
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
);

-- Payment audit logs - users can only see their own audit entries
CREATE POLICY "Users see their payment audit logs only"
ON public.payment_audit_log
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert audit logs (for system logging)
CREATE POLICY "Service role inserts audit logs"
ON public.payment_audit_log
FOR INSERT
WITH CHECK (current_setting('role') = 'service_role');

-- Security Fix 7: Secure stream_credentials table - strengthen access control
DROP POLICY IF EXISTS "Stream owners can access their credentials" ON public.stream_credentials;

-- Only stream owners can access their credentials with additional security checks
CREATE POLICY "Stream owners access credentials securely"
ON public.stream_credentials
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.streams s 
    WHERE s.id = stream_credentials.stream_id 
    AND s.user_id = auth.uid()
    AND s.is_active = true
  )
  AND revoked_at IS NULL
  AND expires_at > now()
);

-- Security Fix 8: Add additional security constraints
-- Ensure stream keys cannot be accessed if expired or revoked
CREATE OR REPLACE FUNCTION public.validate_stream_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent access to expired or revoked credentials
  IF NEW.revoked_at IS NOT NULL OR NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Stream credentials are invalid or expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for stream credential validation
DROP TRIGGER IF EXISTS validate_stream_credentials ON public.stream_credentials;
CREATE TRIGGER validate_stream_credentials
  BEFORE SELECT ON public.stream_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_stream_access();

-- Security Fix 9: Add rate limiting trigger for tip creation
CREATE OR REPLACE FUNCTION public.check_tip_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_tips_count INTEGER;
BEGIN
  -- Check if user has sent more than 10 tips in the last hour
  SELECT COUNT(*)
  INTO recent_tips_count
  FROM public.tips
  WHERE tipper_id = NEW.tipper_id
  AND created_at > now() - INTERVAL '1 hour';
  
  IF recent_tips_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many tips sent in the last hour';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS tip_rate_limit_check ON public.tips;
CREATE TRIGGER tip_rate_limit_check
  BEFORE INSERT ON public.tips
  FOR EACH ROW
  EXECUTE FUNCTION public.check_tip_rate_limit();