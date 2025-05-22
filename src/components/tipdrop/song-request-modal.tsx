
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Search, Music } from "lucide-react";
import { songs, Song, User } from "@/lib/mock-data";

interface SongRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  dj: User;
}

export function SongRequestModal({ isOpen, onClose, dj }: SongRequestModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [tipAmount, setTipAmount] = useState(10);
  const [message, setMessage] = useState("");
  
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setStep(2);
  };
  
  const handleSelectTip = (amount: number) => {
    setTipAmount(amount);
    setStep(3);
  };
  
  const handleSubmit = () => {
    // In a real app, this would send the request to the backend
    console.log({
      song: selectedSong,
      dj,
      tipAmount,
      message
    });
    
    // Reset and close
    setStep(1);
    setSelectedSong(null);
    setTipAmount(10);
    setMessage("");
    onClose();
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center text-2xl">TipDrop</DialogTitle>
          <DialogDescription className="text-center">
            Request a song from {dj.name} and support them with a tip.
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="mt-4">
            <div className="mb-4 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={dj.avatar} alt={dj.name} />
                <AvatarFallback>{dj.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{dj.name}</h3>
                <p className="text-sm text-muted-foreground">@{dj.username}</p>
              </div>
            </div>
            
            <Label htmlFor="song-search">Search for a song</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="song-search"
                placeholder="Song name or artist..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {filteredSongs.length > 0 ? (
                filteredSongs.map(song => (
                  <GlassmorphicCard 
                    key={song.id}
                    className="p-2 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={song.albumArt}
                        alt={song.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                  </GlassmorphicCard>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Music className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No songs found. Try a different search term.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {step === 2 && selectedSong && (
          <div className="mt-4">
            <div className="mb-6">
              <Label>Selected Song</Label>
              <GlassmorphicCard className="mt-2 p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSong.albumArt}
                    alt={selectedSong.title}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium">{selectedSong.title}</p>
                    <p className="text-muted-foreground">{selectedSong.artist}</p>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
            
            <Label>Select Tip Amount</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map(amount => (
                <Button
                  key={amount}
                  variant={tipAmount === amount ? "default" : "outline"}
                  className={tipAmount === amount ? "" : "border-white/10"}
                  onClick={() => handleSelectTip(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            
            <div className="mt-4">
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="custom-amount"
                  type="number"
                  min="1"
                  className="pl-7"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && selectedSong && (
          <div className="mt-4">
            <div className="mb-4 space-y-2">
              <Label htmlFor="message">Add a message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Any special requests or message for the DJ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-24 resize-none"
              />
            </div>
            
            <GlassmorphicCard className="mt-4">
              <h3 className="text-lg font-medium">Request Summary</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Song:</span>
                  <span>{selectedSong.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Artist:</span>
                  <span>{selectedSong.artist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tip Amount:</span>
                  <span className="text-primary">${tipAmount}</span>
                </div>
              </div>
            </GlassmorphicCard>
          </div>
        )}
        
        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          
          {step === 3 && (
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
              Send Request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
