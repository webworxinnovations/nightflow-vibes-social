
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";

interface MediaStreamControlsProps {
  isStreaming: boolean;
  cameraEnabled: boolean;
  micEnabled: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
}

export const MediaStreamControls = ({
  isStreaming,
  cameraEnabled,
  micEnabled,
  onToggleCamera,
  onToggleMic
}: MediaStreamControlsProps) => {
  if (!isStreaming) return null;

  return (
    <div className="flex gap-2">
      <Button
        onClick={onToggleCamera}
        variant={cameraEnabled ? "default" : "destructive"}
        size="sm"
      >
        {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>
      <Button
        onClick={onToggleMic}
        variant={micEnabled ? "default" : "destructive"}
        size="sm"
      >
        {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>
    </div>
  );
};
