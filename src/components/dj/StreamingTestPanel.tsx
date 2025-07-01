
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { SimpleOBSSetup } from "./SimpleOBSSetup";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { HttpAccessHelper } from "./HttpAccessHelper";
import { useStreamKey } from "@/hooks/useStreamKey";
import { Monitor, Play } from "lucide-react";

export const StreamingTestPanel = () => {
  const [showSetup, setShowSetup] = useState(false);
  const { streamData, isLive } = useStreamKey();

  return (
    <div className="space-y-6">
      {/* HTTP Access Helper */}
      <HttpAccessHelper />

      <GlassmorphicCard>
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Monitor className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-400 mb-4">
              OBS Streaming Setup
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Connect your OBS to NightFlow via your droplet server
            </p>
          </div>
          
          {!showSetup ? (
            <div className="text-center">
              <Button
                onClick={() => setShowSetup(true)}
                className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Setup OBS Streaming
              </Button>
            </div>
          ) : (
            <SimpleOBSSetup />
          )}
        </div>
      </GlassmorphicCard>

      {/* Your Live Stream */}
      {streamData?.hlsUrl && (
        <GlassmorphicCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">📺 Your Live Stream</h3>
              {isLive && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">LIVE</span>
                </div>
              )}
            </div>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <RealVideoPlayer 
                hlsUrl={streamData.hlsUrl}
                isLive={isLive}
                autoplay={true}
                muted={false}
              />
            </div>
            
            <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                {isLive 
                  ? "🔴 Your stream is live on NightFlow!"
                  : "⚫ Start streaming from OBS to see it here"
                }
              </p>
            </div>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};
