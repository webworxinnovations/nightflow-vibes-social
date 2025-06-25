
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Camera, Mic, Square, Circle } from "lucide-react";
import { toast } from "sonner";

interface BrowserStreamingSetupProps {
  streamKey: string;
  onStreamStatusChange?: (isLive: boolean) => void;
}

export const BrowserStreamingSetup = ({ streamKey, onStreamStatusChange }: BrowserStreamingSetupProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startBrowserStream = async () => {
    try {
      console.log('🌐 Starting browser-based streaming...');
      
      // Get user media (camera + microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      setMediaStream(stream);
      
      // Show preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Setup MediaRecorder to send chunks to server
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await sendStreamChunk(event.data);
        }
      };

      recorder.start(5000); // Send chunks every 5 seconds
      setMediaRecorder(recorder);
      setIsStreaming(true);
      onStreamStatusChange?.(true);
      
      toast.success('🔴 Browser streaming started!');
      
    } catch (error) {
      console.error('Browser streaming error:', error);
      toast.error('Failed to start browser streaming: ' + (error as Error).message);
    }
  };

  const stopBrowserStream = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    onStreamStatusChange?.(false);
    toast.info('Browser streaming stopped');
  };

  const sendStreamChunk = async (chunk: Blob) => {
    try {
      const formData = new FormData();
      formData.append('segment', chunk);
      
      const response = await fetch(
        `https://nightflow-vibes-social-production.up.railway.app/api/stream/browser/${streamKey}`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (response.ok) {
        console.log('📡 Stream chunk sent successfully');
      } else {
        console.error('Failed to send stream chunk:', response.status);
      }
    } catch (error) {
      console.error('Error sending stream chunk:', error);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isStreaming) {
        stopBrowserStream();
      }
    };
  }, []);

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Browser Streaming</h3>
          <p className="text-muted-foreground text-sm">
            Stream directly from your browser - no OBS required!
          </p>
          <Badge variant="outline" className="mt-2">
            Railway Compatible ✅
          </Badge>
        </div>

        {/* Video Preview */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!mediaStream && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Camera preview will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isStreaming ? (
            <Button onClick={startBrowserStream} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
              <Circle className="h-4 w-4" />
              Start Browser Stream
            </Button>
          ) : (
            <Button onClick={stopBrowserStream} variant="outline" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Stop Stream
            </Button>
          )}
        </div>

        {/* Status */}
        {isStreaming && (
          <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="font-medium">LIVE - Broadcasting from Browser</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Railway Solution</h4>
              <p className="text-sm text-blue-300">
                Since Railway doesn't support RTMP on port 1935, this browser streaming method 
                uses HTTP and works perfectly within Railway's constraints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
