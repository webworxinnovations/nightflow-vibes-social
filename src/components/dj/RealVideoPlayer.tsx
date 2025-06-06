
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Maximize, Play, Pause } from 'lucide-react';

interface RealVideoPlayerProps {
  hlsUrl: string;
  isLive: boolean;
  onFullscreen?: () => void;
}

export const RealVideoPlayer = ({ hlsUrl, isLive, onFullscreen }: RealVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl || !isLive) return;

    setHasError(false);

    // Try to load HLS stream
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
    } else {
      // For other browsers, we'd need HLS.js
      // For now, we'll show a placeholder
      console.log('HLS.js would be needed for this browser');
      setHasError(true);
    }

    const handleLoadedData = () => {
      setIsPlaying(true);
      video.play().catch(console.error);
    };

    const handleError = () => {
      setHasError(true);
      console.error('Video playback error');
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [hlsUrl, isLive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  if (!isLive || hasError) {
    return (
      <div className="w-full h-full bg-black rounded-lg flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-medium mb-2">
            {hasError ? 'Stream Error' : 'Stream Offline'}
          </h4>
          <p className="text-sm text-gray-400">
            {hasError 
              ? 'Unable to load stream. Please check your connection.' 
              : 'Start streaming from OBS to go live'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Button
            onClick={togglePlay}
            variant="secondary"
            size="sm"
            className="bg-black/50 hover:bg-black/70"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={toggleMute}
            variant="secondary"
            size="sm"
            className="bg-black/50 hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/30 rounded appearance-none slider"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {onFullscreen && (
            <Button
              onClick={onFullscreen}
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 bg-red-500 px-2 py-1 rounded text-white text-sm font-bold flex items-center gap-1">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        LIVE
      </div>
    </div>
  );
};
