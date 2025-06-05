
import { useState, useEffect } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Users,
  Volume2,
  VolumeX,
  Maximize
} from "lucide-react";
import { toast } from "sonner";

interface LiveStreamViewerProps {
  djName: string;
  eventName: string;
  isLive: boolean;
}

export const LiveStreamViewer = ({ djName, eventName, isLive }: LiveStreamViewerProps) => {
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<string[]>([
    "Amazing set! 🔥",
    "This beat is incredible!",
    "Love the energy tonight!",
    "Can't stop dancing! 💃",
  ]);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 5) - 2));
        if (Math.random() < 0.3) {
          setLikes(prev => prev + Math.floor(Math.random() * 3) + 1);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      toast.success("Liked! ❤️");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Stream link copied!");
  };

  if (!isLive) {
    return (
      <GlassmorphicCard className="aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📹</div>
          <h3 className="text-lg font-semibold">Stream Offline</h3>
          <p className="text-muted-foreground">{djName} is not currently live</p>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassmorphicCard className="relative overflow-hidden">
        {/* Live Stream Video Area */}
        <div className="aspect-video bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative">
          {/* Live Badge */}
          <Badge className="absolute top-4 left-4 bg-red-500 text-white">
            🔴 LIVE
          </Badge>
          
          {/* Viewer Count */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-white text-sm">
            <Users className="h-4 w-4" />
            {viewers}
          </div>
          
          {/* Stream Controls */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant="secondary"
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
            >
              <Maximize className="h-4 w-4 text-white" />
            </Button>
          </div>
          
          {/* Simulated Camera Feed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎧</div>
              <h2 className="text-2xl font-bold">{djName}</h2>
              <p className="text-lg opacity-80">{eventName}</p>
            </div>
          </div>
        </div>
        
        {/* Stream Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{djName} - Live Set</h3>
              <p className="text-sm text-muted-foreground">{eventName}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={hasLiked ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`h-4 w-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                {likes}
              </Button>
              
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </GlassmorphicCard>
      
      {/* Live Chat */}
      <GlassmorphicCard>
        <h4 className="font-semibold mb-3">Live Chat</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} className="text-sm p-2 bg-muted/50 rounded">
              <span className="font-medium text-primary">Fan{index + 1}:</span> {message}
            </div>
          ))}
        </div>
      </GlassmorphicCard>
    </div>
  );
};
