
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export interface Event {
  id: string;
  title: string;
  description?: string;
  venue_name?: string;
  venue_address?: string;
  start_time: string;
  end_time: string;
  cover_image_url?: string;
  ticket_price?: number;
  ticket_capacity?: number;
  tickets_sold: number;
  status: 'draft' | 'published' | 'live' | 'ended' | 'cancelled';
  organizer_id: string;
  stream_id?: string;
  created_at: string;
  updated_at: string;
  organizer?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!organizer_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useUserEvents = () => {
  const { user } = useSupabaseAuth();
  
  return useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async (): Promise<Event[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!organizer_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('organizer_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<Event | null> => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!organizer_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};
