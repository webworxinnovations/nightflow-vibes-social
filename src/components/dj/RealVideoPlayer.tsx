
import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import { VideoPlayerControls } from './VideoPlayerControls';
import { VideoPlayerStates } from './VideoPlayerStates';
import { VideoPlayerOffline } from './VideoPlayerOffline';

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
  const {
    videoRef,
    isPlaying,
    isMuted,
    error,
    isLoading,
    handlePlayPause,
    handleMuteToggle,
    handleFullscreen
  } = useHlsPlayer({ hlsUrl, isLive, autoplay, muted });

  if (!isLive && !hlsUrl) {
    return <VideoPlayerOffline className={className} />;
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

      <VideoPlayerStates 
        isLoading={isLoading}
        error={error}
        onPlayPause={handlePlayPause}
      />

      {controls && !isLoading && !error && (
        <VideoPlayerControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          isLive={isLive}
          onPlayPause={handlePlayPause}
          onMuteToggle={handleMuteToggle}
          onFullscreen={handleFullscreen}
        />
      )}
    </div>
  );
};
