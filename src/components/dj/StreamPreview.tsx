
import { useRef, useEffect } from "react";
import { Monitor } from "lucide-react";

interface StreamPreviewProps {
  mediaStream: MediaStream | null;
  isStreaming: boolean;
}

export const StreamPreview = ({ mediaStream, isStreaming }: StreamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
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
  );
};
