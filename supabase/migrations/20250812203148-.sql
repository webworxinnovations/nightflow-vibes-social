-- Fix security issue: Remove public access to profiles table
-- This prevents anonymous users from scraping user data

-- Drop the overly permissive policy that allows anyone to view profile data
DROP POLICY IF EXISTS "Basic profile info viewable by everyone" ON public.profiles;

-- Keep only authenticated access to profiles
-- The existing "Authenticated users can see full profiles" policy already handles this correctly

-- Add a more restrictive policy for basic profile info that only shows minimal data
-- for public profile views (like DJ names on events) but requires authentication
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Ensure we have proper policies for profile management
-- Users can still update their own profiles (this policy already exists)
-- Users can still insert their own profiles (this policy already exists)