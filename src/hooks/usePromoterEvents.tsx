
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
      return data || [];
    },
    enabled: !!user,
  });

  return { 
    promoterEvents, 
    promoterId: user?.id || "", 
    isLoading 
  };
};
