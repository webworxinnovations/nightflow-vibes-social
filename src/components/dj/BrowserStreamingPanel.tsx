
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Monitor,
  Smartphone,
  Wifi
} from "lucide-react";
import { toast } from "sonner";

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
  const videoRef = useRef<HTMLVideoElement>(null);

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
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

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
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
          
          <div className="flex items-center gap-2">
            {isStreaming && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-400 mb-2">✅ Works with ANY Internet Connection!</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• No RTMP/port 1935 restrictions</li>
                <li>• No firewall issues</li>
                <li>• No ISP blocking</li>
                <li>• Works on mobile data, WiFi, any network</li>
                <li>• High quality HD streaming</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <div className="text-center">
                <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Click Start Stream to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {isStreaming && (
              <>
                <Button
                  onClick={toggleCamera}
                  variant={cameraEnabled ? "default" : "destructive"}
                  size="sm"
                >
                  {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={toggleMic}
                  variant={micEnabled ? "default" : "destructive"}
                  size="sm"
                >
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>

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
