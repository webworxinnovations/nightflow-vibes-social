
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

// Use the integrated Supabase client
export { supabase }

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabase)
}

// Re-export types from the main Supabase integration
export type { Database } from '@/integrations/supabase/types'
export * from '@/integrations/supabase/types'

// Add the missing Profile and Stream types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Stream = Database['public']['Tables']['streams']['Row']
