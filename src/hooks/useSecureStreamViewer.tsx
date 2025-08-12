import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useSecureStreamViewer = (streamId: string) => {
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (!streamId || !user) return;

    let viewerRecordId: string | null = null;

    const joinStream = async () => {
      try {
        // Add viewer record (RLS ensures only authenticated users can join)
        const { data, error } = await supabase
          .from('stream_viewers')
          .insert({
            stream_id: streamId,
            viewer_id: user.id
          })
          .select('id')
          .single();

        if (!error && data) {
          viewerRecordId = data.id;
        }
      } catch (error) {
        console.error('Error joining stream:', error);
      }
    };

    const leaveStream = async () => {
      if (viewerRecordId) {
        try {
          // Update viewer record to mark as left (RLS ensures only own record can be updated)
          await supabase
            .from('stream_viewers')
            .update({ left_at: new Date().toISOString() })
            .eq('id', viewerRecordId);
        } catch (error) {
          console.error('Error leaving stream:', error);
        }
      }
    };

    joinStream();

    // Clean up on unmount
    return () => {
      leaveStream();
    };
  }, [streamId, user]);
};