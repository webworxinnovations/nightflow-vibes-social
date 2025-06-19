
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";

export const useTipping = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseAuth();

  const sendTip = async (
    recipientId: string,
    streamId: string | null,
    amount: number,
    message?: string,
    songRequest?: string
  ) => {
    if (!user) {
      toast.error("Please log in to send tips");
      return false;
    }

    if (amount <= 0) {
      toast.error("Tip amount must be greater than 0");
      return false;
    }

    setIsLoading(true);

    try {
      // Insert tip record
      const { error: tipError } = await supabase
        .from('tips')
        .insert({
          tipper_id: user.id,
          recipient_id: recipientId,
          stream_id: streamId,
          amount,
          message,
          song_request: songRequest
        });

      if (tipError) throw tipError;

      // If there's a stream and message, also send it to chat
      if (streamId && message) {
        const { error: chatError } = await supabase
          .from('chat_messages')
          .insert({
            stream_id: streamId,
            user_id: user.id,
            username: user.user_metadata?.username || 'Anonymous',
            message: `💰 Tipped $${amount}${songRequest ? ` • ${songRequest}` : ''}: ${message}`,
            is_tip: true,
            tip_amount: amount
          });

        if (chatError) {
          console.warn('Failed to send tip to chat:', chatError);
        }
      }

      toast.success(`Sent $${amount} tip successfully! 🎉`);
      return true;
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error("Failed to send tip. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTip,
    isLoading
  };
};
