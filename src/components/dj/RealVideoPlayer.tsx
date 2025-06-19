
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RealVideoPlayerProps {
  hlsUrl: string;
  isLive?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export const RealVideoPlayer = ({ 
  hlsUrl, 
  isLive = false, 
  autoplay = false, 
  muted = true,
  controls = true,
  className = "" 
}: RealVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    setError(null);
    setIsLoading(true);

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    console.log('🎥 Loading HLS stream:', hlsUrl);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 4 : 30,
        maxBufferLength: isLive ? 10 : 30,
        maxMaxBufferLength: isLive ? 15 : 60,
        liveSyncDurationCount: isLive ? 1 : 3,
        liveMaxLatencyDurationCount: isLive ? 3 : 10,
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest loaded successfully');
        setIsLoading(false);
        setError(null);
        
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Click to play - autoplay blocked by browser');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS Error:', data);
        setIsLoading(false);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - stream may be offline');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - trying to recover...');
              try {
                hls.recoverMediaError();
              } catch (err) {
                setError('Failed to recover from media error');
              }
              break;
            default:
              setError('Failed to load stream');
              break;
          }
        }
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('📺 Media attached to video element');
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      console.log('🍎 Using Safari native HLS support');
      video.src = hlsUrl;
      
      video.addEventListener('loadedmetadata', () => {
        console.log('✅ Native HLS loaded successfully');
        setIsLoading(false);
        setError(null);
        
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Click to play - autoplay blocked by browser');
          });
        }
      });

      video.addEventListener('error', (e) => {
        console.error('❌ Native HLS Error:', e);
        setIsLoading(false);
        setError('Failed to load stream');
      });
    } else {
      setError('HLS not supported in this browser');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, autoplay, isLive]);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    // Set initial muted state
    video.muted = isMuted;

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isMuted]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play video');
      });
    } else {
      video.pause();
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  if (!isLive && !hlsUrl) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">📺</div>
            <p className="text-sm opacity-80">Stream offline</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        controls={!controls}
        muted={isMuted}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm">{error}</p>
            {error.includes('Click to play') && (
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Custom Controls */}
      {controls && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlayPause}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Play className={`h-4 w-4 ${isPlaying ? 'hidden' : 'block'}`} />
                <div className={`w-4 h-4 ${isPlaying ? 'block' : 'hidden'}`}>
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-white"></div>
                    <div className="w-1 h-4 bg-white"></div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleMuteToggle}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              {isLive && (
                <span className="text-red-400 text-sm font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  LIVE
                </span>
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
      )}
    </div>
  );
};
