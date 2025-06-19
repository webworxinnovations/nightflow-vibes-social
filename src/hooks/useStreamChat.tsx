
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string | null;
  username: string;
  message: string;
  is_tip: boolean;
  tip_amount: number | null;
  created_at: string;
}

export const useStreamChat = (streamId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();

  // Load initial chat messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error loading chat messages:', error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    if (streamId) {
      loadMessages();
    }
  }, [streamId]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`chat-${streamId}`)
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
    if (!user || !streamId || !message.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        stream_id: streamId,
        user_id: user.id,
        username: user.user_metadata?.username || 'Anonymous',
        message: message.trim(),
        is_tip: false
      });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
};
