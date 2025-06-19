
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from "lucide-react";
import Hls from "hls.js";

interface RealVideoPlayerProps {
  hlsUrl: string;
  isLive: boolean;
  onFullscreen?: () => void;
  autoplay?: boolean;
  muted?: boolean;
}

export const RealVideoPlayer = ({ 
  hlsUrl, 
  isLive, 
  onFullscreen,
  autoplay = true,
  muted = false 
}: RealVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    setIsLoading(true);
    setError(null);

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 4 : 30,
        maxBufferLength: isLive ? 10 : 60,
        liveSyncDurationCount: isLive ? 1 : 3,
        liveMaxLatencyDurationCount: isLive ? 5 : 10,
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, starting playback');
        setIsLoading(false);
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Click play to start the stream');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        setIsLoading(false);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - stream may be offline');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              setError('Stream error - please refresh');
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Click play to start the stream');
          });
        }
      });

      video.addEventListener('error', () => {
        setIsLoading(false);
        setError('Stream error - please refresh');
      });
    } else {
      setIsLoading(false);
      setError('HLS not supported in this browser');
    }
  }, [hlsUrl, isLive, autoplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to start playback');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen().catch(err => {
        console.error('Fullscreen failed:', err);
      });
    }
    
    onFullscreen?.();
  };

  if (error) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center relative">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ {error}</div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black relative group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        muted={isMuted}
        playsInline
        controls={false}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading stream...</p>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlay}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            {isLive && (
              <div className="flex items-center gap-2 ml-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">LIVE</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleFullscreen}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
