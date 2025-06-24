import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DollarSign, Music, CreditCard, Search } from "lucide-react";
import { useTipping } from "@/hooks/useTipping";
import { useSongSearch } from "@/hooks/useSongSearch";

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
  const [showSongSearch, setShowSongSearch] = useState(false);
  const { sendTip, isLoading } = useTipping();
  const { searchSongs, searchResults, isSearching } = useSongSearch();

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount);
  };

  const handleSongSearch = async (query: string) => {
    if (query.length > 2) {
      await searchSongs(query);
    }
  };

  const selectSong = (track: any) => {
    const songText = `${track.artists[0]?.name} - ${track.name}`;
    setSongRequest(songText);
    setShowSongSearch(false);
  };

  const handleSendTip = async () => {
    const tipAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (!tipAmount || tipAmount <= 0) {
      return;
    }

    const success = await sendTip(
      tipAmount,
      streamerId,
      message || undefined,
      songRequest || undefined,
      streamId
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
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
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
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  id="song-request"
                  placeholder="Search for a song or type manually"
                  value={songRequest}
                  onChange={(e) => {
                    setSongRequest(e.target.value);
                    handleSongSearch(e.target.value);
                  }}
                  onFocus={() => setShowSongSearch(true)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSongSearch(!showSongSearch)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {showSongSearch && searchResults.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => selectSong(track)}
                    >
                      <div className="flex items-center gap-3">
                        {track.album.images[2] && (
                          <img
                            src={track.album.images[2].url}
                            alt={track.album.name}
                            className="w-10 h-10 rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artists.map(a => a.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  Searching songs...
                </div>
              )}
            </div>
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

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              <span>Payments processed securely</span>
            </div>
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
