
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import type { ChatMessage } from "./useStreamChat";

export const useRealTimeChat = (streamId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    if (streamId) {
      loadMessages();
    }
  }, [streamId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`stream-chat-${streamId}`)
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

  // Subscribe to real-time tips
  useEffect(() => {
    if (!streamId) return;

    const tipsChannel = supabase
      .channel(`stream-tips-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tips',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          const tip = payload.new;
          // Add tip as a special chat message
          const tipMessage: ChatMessage = {
            id: `tip-${tip.id}`,
            stream_id: streamId,
            user_id: tip.tipper_id,
            username: 'Anonymous Tipper',
            message: `💰 Tipped $${tip.amount}${tip.song_request ? ` • ${tip.song_request}` : ''}${tip.message ? `: ${tip.message}` : ''}`,
            is_tip: true,
            tip_amount: tip.amount,
            created_at: tip.created_at
          };
          setMessages(prev => [...prev, tipMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tipsChannel);
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
