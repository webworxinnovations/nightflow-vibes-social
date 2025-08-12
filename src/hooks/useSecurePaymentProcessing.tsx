import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { validatePaymentAmount, sanitizeString } from '@/utils/inputValidation';
import { toast } from 'sonner';

interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  clientSecret: string;
  isDevelopment?: boolean;
}

export const useSecurePaymentProcessing = () => {
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
      throw new Error('User not authenticated');
    }

    // Client-side validation
    if (!validatePaymentAmount(amount)) {
      throw new Error('Invalid payment amount. Must be between $1 and $1000.');
    }

    if (recipientId === user.id) {
      throw new Error('You cannot tip yourself.');
    }

    setIsProcessing(true);
    
    try {
      // Sanitize inputs
      const sanitizedMessage = message ? sanitizeString(message, 200) : '';
      const sanitizedSongRequest = songRequest ? sanitizeString(songRequest, 100) : '';

      const { data, error } = await supabase.functions.invoke('create-secure-payment-intent', {
        body: {
          amount: amount * 100, // Convert to cents
          recipientId,
          streamId,
          message: sanitizedMessage,
          songRequest: sanitizedSongRequest
        }
      });

      if (error) {
        console.error('Payment intent creation error:', error);
        throw new Error(error.message || 'Failed to create payment intent');
      }

      if (data.isDevelopment) {
        toast.warning('Running in development mode - no real payment processed');
      }

      console.log('Payment intent created:', data.paymentIntentId);
      return {
        id: data.paymentIntentId,
        amount: data.amount,
        status: 'requires_confirmation',
        clientSecret: data.clientSecret,
        isDevelopment: data.isDevelopment
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsProcessing(true);

    try {
      // In development mode with mock payments, auto-confirm
      if (paymentIntentId.startsWith('pi_mock_')) {
        console.log('🧪 Development mode: Auto-confirming mock payment');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the tip status to completed
        const { error } = await supabase
          .from('tips')
          .update({ 
            status: 'completed',
            payment_verified: true,
            verification_date: new Date().toISOString()
          })
          .eq('payment_intent_id', paymentIntentId);

        if (error) {
          console.error('Failed to update tip status:', error);
          return false;
        }

        console.log('✅ Mock payment confirmed successfully');
        return true;
      }

      // For real Stripe payments, call confirm payment function
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { paymentIntentId }
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        return false;
      }

      console.log('✅ Payment confirmed successfully');
      return data.success;
    } catch (error) {
      console.error('Error confirming payment:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createPaymentIntent,
    confirmPayment,
    isProcessing
  };
};