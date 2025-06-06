
import { useEffect, useRef } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
  stream: MediaStream | null;
  isActive: boolean;
  name: string;
  position: string;
  onStartCamera?: () => void;
  className?: string;
}

export const CameraFeed = ({
  stream,
  isActive,
  name,
  position,
  onStartCamera,
  className = ""
}: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  const getCameraEmoji = (position: string) => {
    switch (position) {
      case 'center': return '🎧';
      case 'back': return '👥';
      case 'floor': return '💃';
      case 'side': return '🍸';
      default: return '📹';
    }
  };

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden ${className}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-800/20 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-2xl mb-2">{getCameraEmoji(position)}</div>
            <div className="text-xs font-medium mb-2">{name}</div>
            {onStartCamera && (
              <Button
                onClick={onStartCamera}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Start Camera
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Live Indicator */}
      {isActive && stream && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )}
      
      {/* No Camera Indicator */}
      {!stream && (
        <div className="absolute top-2 right-2 bg-gray-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <VideoOff className="h-3 w-3" />
        </div>
      )}
      
      {/* Camera Name */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
        {position}
      </div>
    </div>
  );
};
