
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerStatesProps {
  isLoading: boolean;
  error: string | null;
  onPlayPause?: () => void;
}

export const VideoPlayerStates = ({ isLoading, error, onPlayPause }: VideoPlayerStatesProps) => {
  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Connecting to stream...</p>
          <p className="text-xs opacity-70 mt-1">Waiting for OBS stream data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm">{error}</p>
          {error.includes('Click to play') && onPlayPause && (
            <Button
              onClick={onPlayPause}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Play className="h-4 w-4 mr-1" />
              Play
            </Button>
          )}
          {error.includes('Stream not ready') && (
            <p className="text-xs opacity-70 mt-2">
              Wait 10-30 seconds after starting OBS stream
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};
