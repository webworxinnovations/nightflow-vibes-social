
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
  // Add compatibility properties for existing components
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
  price?: number;
  capacity?: number;
  attendees?: number;
  image?: string;
  // Add missing properties that components expect
  lineup?: any[];
  ticketsSold?: number;
  maxCapacity?: number;
  promoter?: string;
  isLive?: boolean;
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
      
      // Transform data to include compatibility properties
      return (data || []).map(event => ({
        ...event,
        // Add compatibility mappings
        date: event.start_time ? new Date(event.start_time).toISOString().split('T')[0] : undefined,
        time: event.start_time ? new Date(event.start_time).toLocaleTimeString() : undefined,
        venue: event.venue_name,
        address: event.venue_address,
        price: event.ticket_price,
        capacity: event.ticket_capacity,
        attendees: event.tickets_sold,
        image: event.cover_image_url,
        // Add missing properties for component compatibility
        lineup: [],
        ticketsSold: event.tickets_sold,
        maxCapacity: event.ticket_capacity,
        promoter: event.organizer?.username || event.organizer?.full_name,
        isLive: event.status === 'live'
      }));
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
      
      // Transform data to include compatibility properties
      return (data || []).map(event => ({
        ...event,
        // Add compatibility mappings
        date: event.start_time ? new Date(event.start_time).toISOString().split('T')[0] : undefined,
        time: event.start_time ? new Date(event.start_time).toLocaleTimeString() : undefined,
        venue: event.venue_name,
        address: event.venue_address,
        price: event.ticket_price,
        capacity: event.ticket_capacity,
        attendees: event.tickets_sold,
        image: event.cover_image_url,
        // Add missing properties for component compatibility
        lineup: [],
        ticketsSold: event.tickets_sold,
        maxCapacity: event.ticket_capacity,
        promoter: event.organizer?.username || event.organizer?.full_name,
        isLive: event.status === 'live'
      }));
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
      
      if (!data) return null;
      
      // Transform data to include compatibility properties
      return {
        ...data,
        // Add compatibility mappings
        date: data.start_time ? new Date(data.start_time).toISOString().split('T')[0] : undefined,
        time: data.start_time ? new Date(data.start_time).toLocaleTimeString() : undefined,
        venue: data.venue_name,
        address: data.venue_address,
        price: data.ticket_price,
        capacity: data.ticket_capacity,
        attendees: data.tickets_sold,
        image: data.cover_image_url,
        // Add missing properties for component compatibility
        lineup: [],
        ticketsSold: data.tickets_sold,
        maxCapacity: data.ticket_capacity,
        promoter: data.organizer?.username || data.organizer?.full_name,
        isLive: data.status === 'live'
      };
    },
    enabled: !!eventId,
  });
};
