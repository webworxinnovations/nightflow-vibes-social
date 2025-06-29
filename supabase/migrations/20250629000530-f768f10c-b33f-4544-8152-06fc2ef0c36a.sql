
-- Fix the security warnings by updating functions with proper search_path settings

-- Update the update_tip_totals function with secure search_path
CREATE OR REPLACE FUNCTION public.update_tip_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET total_tips_received = total_tips_received + NEW.amount
  WHERE id = NEW.recipient_id;
  RETURN NEW;
END;
$$;

-- Update the update_tip_totals_trigger function with secure search_path
CREATE OR REPLACE FUNCTION public.update_tip_totals_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update recipient's total tips received
  UPDATE public.profiles 
  SET total_tips_received = COALESCE(total_tips_received, 0) + NEW.amount
  WHERE id = NEW.recipient_id;
  
  RETURN NEW;
END;
$$;

-- Update the update_follower_counts function with secure search_path
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
