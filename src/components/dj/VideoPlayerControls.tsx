
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isLive?: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onFullscreen: () => void;
}

export const VideoPlayerControls = ({
  isPlaying,
  isMuted,
  isLive = false,
  onPlayPause,
  onMuteToggle,
  onFullscreen
}: VideoPlayerControlsProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={onPlayPause}
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
            onClick={onMuteToggle}
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
          onClick={onFullscreen}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
