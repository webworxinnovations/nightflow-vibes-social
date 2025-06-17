
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Event } from "./useEvents";

export const usePromoterEvents = () => {
  const { user } = useSupabaseAuth();
  
  const { data: promoterEvents = [], isLoading } = useQuery({
    queryKey: ['promoter-events', user?.id],
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

  return { 
    promoterEvents, 
    promoterId: user?.id || "", 
    isLoading 
  };
};
