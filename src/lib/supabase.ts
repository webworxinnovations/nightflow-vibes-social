
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a null client if environment variables are missing
// This prevents the app from crashing before Supabase is connected
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Database types
export interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  bio?: string
  role: 'dj' | 'fan' | 'promoter' | 'venue' | 'sub_promoter'
  website?: string
  instagram?: string
  spotify?: string
  soundcloud?: string
  location?: string
  verified: boolean
  follower_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface Stream {
  id: string
  user_id: string
  stream_key: string
  rtmp_url: string
  hls_url: string
  title?: string
  description?: string
  status: 'offline' | 'live' | 'starting' | 'ending'
  viewer_count: number
  max_viewers: number
  duration: number
  bitrate: number
  resolution: string
  is_active: boolean
  started_at?: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  description?: string
  venue_name?: string
  venue_address?: string
  start_time: string
  end_time: string
  cover_image_url?: string
  ticket_price?: number
  ticket_capacity?: number
  tickets_sold: number
  status: 'draft' | 'published' | 'live' | 'ended' | 'cancelled'
  stream_id?: string
  created_at: string
  updated_at: string
}
