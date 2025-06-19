
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  X, 
  Users, 
  Timer, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  MessageCircle,
  DollarSign
} from "lucide-react";
import { RealVideoPlayer } from "@/components/dj/RealVideoPlayer";
import { StreamChat } from "./StreamChat";
import { TipDialog } from "./TipDialog";
import type { LiveStream } from "@/hooks/useLiveStreams";

interface StreamViewerProps {
  stream: LiveStream | null;
  open: boolean;
  onClose: () => void;
}

export const StreamViewer = ({ stream, open, onClose }: StreamViewerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);

  useEffect(() => {
    if (!stream?.started_at) return;

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - new Date(stream.started_at!).getTime()) / 60000);
      setStreamDuration(duration);
    }, 60000);

    // Initial calculation
    const duration = Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 60000);
    setStreamDuration(duration);

    return () => clearInterval(interval);
  }, [stream?.started_at]);

  if (!stream) return null;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <div className="flex h-full">
            {/* Main Video Area */}
            <div className={`flex flex-col ${showChat ? 'flex-1' : 'w-full'}`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={stream.streamer.avatar_url || undefined}
                      alt={stream.streamer.username}
                    />
                    <AvatarFallback>
                      {stream.streamer.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{stream.streamer.username}</h2>
                    <p className="text-sm text-muted-foreground">
                      {stream.streamer.streaming_title || stream.title || "Live Stream"}
                    </p>
                  </div>
                  <Badge variant="destructive" className="flex items-center gap-1 ml-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {stream.viewer_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {formatDuration(streamDuration)}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTipDialog(true)}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Video Player */}
              <div className="flex-1 bg-black relative">
                <RealVideoPlayer
                  hlsUrl={stream.hls_url}
                  isLive={stream.status === 'live'}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Stream Info Overlay */}
                {stream.streamer.streaming_description && (
                  <div className="absolute bottom-4 right-4 max-w-md">
                    <div className="bg-black/70 text-white p-3 rounded-lg">
                      <p className="text-sm">{stream.streamer.streaming_description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Sidebar */}
            {showChat && (
              <div className="w-80 border-l">
                <StreamChat 
                  streamId={stream.id} 
                  streamerId={stream.streamer.id}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TipDialog
        open={showTipDialog}
        onOpenChange={setShowTipDialog}
        streamId={stream.id}
        streamerId={stream.streamer.id}
      />
    </>
  );
};
