
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";

export interface SongRequest {
  id: string;
  song_title: string;
  song_artist: string;
  album_art_url?: string;
  message?: string;
  tip_amount: number;
  status: 'pending' | 'accepted' | 'declined';
  fan_id: string;
  dj_id: string;
  event_id?: string;
  created_at: string;
  updated_at: string;
  fan?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export const useSongRequests = (djId?: string) => {
  const { user } = useSupabaseAuth();
  
  return useQuery({
    queryKey: ['song-requests', djId || user?.id],
    queryFn: async (): Promise<SongRequest[]> => {
      const targetDjId = djId || user?.id;
      if (!targetDjId) return [];
      
      const { data, error } = await supabase
        .from('song_requests')
        .select(`
          *,
          fan:profiles!fan_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('dj_id', targetDjId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!(djId || user?.id),
  });
};

export const useCreateSongRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: {
      song_title: string;
      song_artist: string;
      album_art_url?: string;
      message?: string;
      tip_amount: number;
      dj_id: string;
      event_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('song_requests')
        .insert([{
          ...request,
          fan_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      toast.success('Song request sent successfully!');
    },
    onError: (error) => {
      console.error('Error creating song request:', error);
      toast.error('Failed to send song request');
    },
  });
};

export const useUpdateSongRequestStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      requestId,
      status
    }: {
      requestId: string;
      status: 'accepted' | 'declined';
    }) => {
      const { data, error } = await supabase
        .from('song_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['song-requests'] });
      toast.success('Song request updated!');
    },
    onError: (error) => {
      console.error('Error updating song request:', error);
      toast.error('Failed to update song request');
    },
  });
};
