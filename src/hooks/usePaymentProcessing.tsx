
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";

interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
}

export const usePaymentProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useSupabaseAuth();

  const createPaymentIntent = async (
    amount: number,
    recipientId: string,
    streamId?: string,
    message?: string,
    songRequest?: string
  ): Promise<PaymentIntent | null> => {
    if (!user) {
      toast.error("Please log in to send tips");
      return null;
    }

    setIsProcessing(true);

    try {
      // Call edge function to create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          recipientId,
          streamId,
          message,
          songRequest,
          tipperId: user.id
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error("Failed to process payment. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { paymentIntentId }
      });

      if (error) throw error;

      toast.success("Payment successful! 🎉");
      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error("Payment confirmation failed.");
      return false;
    }
  };

  return {
    createPaymentIntent,
    confirmPayment,
    isProcessing
  };
};
