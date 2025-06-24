
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DollarSign, Music, CreditCard } from "lucide-react";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";

interface EnhancedTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: string;
  streamerId: string;
}

const PRESET_AMOUNTS = [1, 5, 10, 20, 50];

export const EnhancedTipDialog = ({ open, onOpenChange, streamId, streamerId }: EnhancedTipDialogProps) => {
  const [amount, setAmount] = useState<number | string>("");
  const [message, setMessage] = useState("");
  const [songRequest, setSongRequest] = useState("");
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const { createPaymentIntent, confirmPayment, isProcessing } = usePaymentProcessing();

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount);
  };

  const handleProceedToPayment = async () => {
    const tipAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (!tipAmount || tipAmount <= 0) {
      return;
    }

    const paymentIntent = await createPaymentIntent(
      tipAmount,
      streamerId,
      streamId,
      message || undefined,
      songRequest || undefined
    );

    if (paymentIntent) {
      setStep('payment');
    }
  };

  const handleConfirmPayment = async () => {
    // In a real implementation, this would integrate with Stripe Elements
    // For now, we'll simulate payment confirmation
    const success = await confirmPayment('mock_payment_intent_id');
    
    if (success) {
      setAmount("");
      setMessage("");
      setSongRequest("");
      setStep('amount');
      onOpenChange(false);
    }
  };

  const resetDialog = () => {
    setStep('amount');
    setAmount("");
    setMessage("");
    setSongRequest("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetDialog(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {step === 'amount' ? 'Send a Tip' : 'Payment Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'amount' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <div className="mt-1">
                <div className="flex gap-2 mb-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetAmount(preset)}
                      className="flex-1"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="song-request" className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                Song Request (optional)
              </Label>
              <Input
                id="song-request"
                placeholder="Artist - Song Name"
                value={songRequest}
                onChange={(e) => setSongRequest(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Say something nice..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedToPayment}
                disabled={!amount || isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : `Continue with $${amount || 0}`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Tip Amount:</span>
                <span className="font-semibold">${amount}</span>
              </div>
              {songRequest && (
                <div className="flex justify-between items-center mb-2">
                  <span>Song Request:</span>
                  <span className="text-sm">{songRequest}</span>
                </div>
              )}
              {message && (
                <div className="mb-2">
                  <span>Message:</span>
                  <p className="text-sm mt-1">{message}</p>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Payment Method</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Secure payment processing powered by Stripe
              </p>
              {/* In a real implementation, Stripe Elements would go here */}
              <div className="p-3 border rounded bg-gray-50 text-center text-sm">
                Payment integration ready - Stripe Elements would be embedded here
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('amount')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : `Pay $${amount}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
