
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface ChatMessage {
  id: string;
  message: string;
  username: string;
  user_id?: string;
  is_tip?: boolean;
  tip_amount?: number;
  created_at: string;
}

export const useRealTimeChat = (streamId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useSupabaseAuth();

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!streamId) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('stream_id', streamId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [streamId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`chat:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const sendMessage = async (message: string) => {
    if (!user || !profile || !message.trim()) return false;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          username: profile.username,
          message: message.trim(),
          is_tip: false
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  return {
    messages,
    sendMessage,
    isLoading
  };
};
