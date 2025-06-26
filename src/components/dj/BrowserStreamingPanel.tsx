
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Wifi } from "lucide-react";
import { toast } from "sonner";
import { MediaStreamControls } from "./MediaStreamControls";
import { StreamPreview } from "./StreamPreview";
import { StreamingStatus } from "./StreamingStatus";
import { NetworkCompatibilityCard } from "./NetworkCompatibilityCard";

interface BrowserStreamingPanelProps {
  streamKey: string;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
}

export const BrowserStreamingPanel = ({ 
  streamKey, 
  onStreamStart, 
  onStreamStop 
}: BrowserStreamingPanelProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const startBrowserStream = async () => {
    try {
      toast.info('🎥 Starting browser stream - requesting camera/mic access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setMediaStream(stream);
      setIsStreaming(true);
      onStreamStart?.();
      
      toast.success('🔴 Browser stream started! No network restrictions!');
      
    } catch (error) {
      console.error('Failed to start browser stream:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const stopBrowserStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    setIsStreaming(false);
    onStreamStop?.();
    toast.info('Stream stopped');
  };

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !cameraEnabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Browser Streaming (No Network Issues!)
          </h3>
          
          <StreamingStatus isStreaming={isStreaming} />
        </div>

        <NetworkCompatibilityCard />

        <StreamPreview mediaStream={mediaStream} isStreaming={isStreaming} />

        <div className="flex items-center justify-between">
          <MediaStreamControls
            isStreaming={isStreaming}
            cameraEnabled={cameraEnabled}
            micEnabled={micEnabled}
            onToggleCamera={toggleCamera}
            onToggleMic={toggleMic}
          />

          <div className="flex gap-2">
            {!isStreaming ? (
              <Button 
                onClick={startBrowserStream}
                className="bg-red-600 hover:bg-red-700"
              >
                🔴 Start Stream
              </Button>
            ) : (
              <Button 
                onClick={stopBrowserStream}
                variant="destructive"
              >
                Stop Stream
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-slate-500/10 rounded">
          <p><strong>Stream Key:</strong> {streamKey}</p>
          <p><strong>Method:</strong> Browser WebRTC → DigitalOcean (bypasses all network restrictions)</p>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
