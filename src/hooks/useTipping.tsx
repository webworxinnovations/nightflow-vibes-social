
import { useState } from 'react';
import { usePaymentProcessing } from './usePaymentProcessing';
import { toast } from 'sonner';

export const useTipping = () => {
  const [isTipping, setIsTipping] = useState(false);
  const { createPaymentIntent, confirmPayment, isProcessing } = usePaymentProcessing();

  const sendTip = async (
    amount: number,
    recipientId: string,
    message?: string,
    songRequest?: string,
    streamId?: string
  ) => {
    setIsTipping(true);
    
    try {
      const paymentIntent = await createPaymentIntent(
        amount,
        recipientId,
        streamId,
        message,
        songRequest
      );

      if (paymentIntent) {
        // In a real implementation, you'd integrate with Stripe Elements here
        // For now, we'll simulate a successful payment
        const success = await confirmPayment(paymentIntent.id);
        
        if (success) {
          toast.success('Tip sent successfully! 🎉');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      toast.error('Failed to send tip. Please try again.');
      return false;
    } finally {
      setIsTipping(false);
    }
  };

  return {
    sendTip,
    isTipping: isTipping || isProcessing,
    isLoading: isTipping || isProcessing
  };
};
