
import { useState } from "react";
import { LiveStreamGrid } from "@/components/live/LiveStreamGrid";
import { StreamViewer } from "@/components/live/StreamViewer";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Badge } from "@/components/ui/badge";
import { Radio, Users } from "lucide-react";
import type { LiveStream } from "@/hooks/useLiveStreams";

export const LiveStreams = () => {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleWatchStream = (stream: LiveStream) => {
    setSelectedStream(stream);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedStream(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Radio className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Live Streams</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover amazing DJ performances happening right now. 
          Support your favorite artists with tips and song requests!
        </p>
      </div>

      {/* Live Indicator */}
      <div className="flex justify-center">
        <Badge variant="destructive" className="flex items-center gap-2 px-4 py-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <Radio className="h-4 w-4" />
          LIVE NOW
        </Badge>
      </div>

      {/* Streams Grid */}
      <GlassmorphicCard>
        <LiveStreamGrid onWatchStream={handleWatchStream} />
      </GlassmorphicCard>

      {/* Stream Viewer Dialog */}
      <StreamViewer
        stream={selectedStream}
        open={viewerOpen}
        onClose={handleCloseViewer}
      />

      {/* How it Works */}
      <GlassmorphicCard>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">How Live Streaming Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Watch Live</h3>
              <p className="text-sm text-muted-foreground">
                Click on any live stream to watch DJs perform in real-time
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Radio className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Chat & Interact</h3>
              <p className="text-sm text-muted-foreground">
                Join the live chat to connect with other fans and the DJ
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Support with Tips</h3>
              <p className="text-sm text-muted-foreground">
                Send tips with song requests to support your favorite DJs
              </p>
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};
