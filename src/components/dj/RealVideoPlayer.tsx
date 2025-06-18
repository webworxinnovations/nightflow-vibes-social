
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Maximize, Play, Pause, Monitor } from 'lucide-react';

interface RealVideoPlayerProps {
  hlsUrl: string;
  isLive: boolean;
  onFullscreen?: () => void;
}

export const RealVideoPlayer = ({ hlsUrl, isLive, onFullscreen }: RealVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl || !isLive) return;

    setHasError(false);
    setIsLoading(true);

    // Configure video for live streaming
    video.muted = isMuted;
    video.volume = volume;

    // Try to load HLS stream
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
    } else {
      // For other browsers, we'd ideally use HLS.js
      // For now, try direct loading and show helpful error
      video.src = hlsUrl;
    }

    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
      // Auto-play for live streams
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.warn('Autoplay failed:', error);
        setIsPlaying(false);
      });
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.error('Video playback error for HLS stream:', hlsUrl);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [hlsUrl, isLive, isMuted, volume]);

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

  if (!isLive) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse" />
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="h-10 w-10 text-slate-400" />
          </div>
          <h4 className="text-xl font-medium mb-2">Stream Offline</h4>
          <p className="text-sm text-gray-400 max-w-md">
            This DJ is not currently streaming. Check back later or follow them for notifications when they go live!
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-900/20 to-slate-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="h-10 w-10 text-red-400" />
          </div>
          <h4 className="text-xl font-medium mb-2 text-red-400">Stream Error</h4>
          <p className="text-sm text-gray-400 max-w-md mb-4">
            Unable to load the live stream. This might be due to network issues or the stream ending.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="flex items-center gap-3 text-white">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading stream...</span>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
        controls={false}
      />
      
      {/* Controls overlay - shows on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Button
              onClick={togglePlay}
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 backdrop-blur-sm"
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
                className="w-20 h-1 bg-white/30 rounded appearance-none slider accent-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {onFullscreen && (
              <Button
                onClick={onFullscreen}
                variant="secondary"
                size="sm"
                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full text-white text-sm font-bold flex items-center gap-2 shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        LIVE
      </div>

      {/* Stream quality indicator */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
        HD
      </div>
    </div>
  );
};
