
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DollarSign, Music } from "lucide-react";
import { useTipping } from "@/hooks/useTipping";

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: string;
  streamerId: string;
}

const PRESET_AMOUNTS = [1, 5, 10, 20, 50];

export const TipDialog = ({ open, onOpenChange, streamId, streamerId }: TipDialogProps) => {
  const [amount, setAmount] = useState<number | string>("");
  const [message, setMessage] = useState("");
  const [songRequest, setSongRequest] = useState("");
  const { sendTip, isLoading } = useTipping();

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount);
  };

  const handleSendTip = async () => {
    const tipAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (!tipAmount || tipAmount <= 0) {
      return;
    }

    const success = await sendTip(
      streamerId,
      streamId,
      tipAmount,
      message || undefined,
      songRequest || undefined
    );

    if (success) {
      setAmount("");
      setMessage("");
      setSongRequest("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Send a Tip
          </DialogTitle>
        </DialogHeader>

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
              onClick={handleSendTip}
              disabled={!amount || isLoading}
              className="flex-1"
            >
              {isLoading ? "Sending..." : `Send $${amount || 0}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
