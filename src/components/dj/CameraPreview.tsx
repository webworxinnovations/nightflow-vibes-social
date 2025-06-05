
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Monitor } from "lucide-react";

interface Camera {
  id: string;
  name: string;
  isActive: boolean;
  position: string;
}

interface BeatDropSettings {
  primaryCamera: string;
  secondaryCamera: string;
}

interface CameraPreviewProps {
  cameras: Camera[];
  beatDetected: boolean;
  beatDropSettings: BeatDropSettings;
  onSwitchCamera: (cameraId: string) => void;
}

export const CameraPreview = ({
  cameras,
  beatDetected,
  beatDropSettings,
  onSwitchCamera
}: CameraPreviewProps) => {
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
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Monitor className="h-5 w-5" />
        Camera Preview
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <div 
            key={camera.id}
            className={`relative aspect-video rounded-lg border-2 transition-all cursor-pointer ${
              camera.isActive 
                ? 'border-red-500 ring-2 ring-red-500/20' 
                : 'border-border hover:border-primary/50'
            } ${
              beatDetected && (camera.id === beatDropSettings.primaryCamera || camera.id === beatDropSettings.secondaryCamera)
                ? 'ring-4 ring-orange-500/30 animate-pulse'
                : ''
            }`}
            onClick={() => onSwitchCamera(camera.id)}
          >
            {/* Camera Feed Simulation */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-800/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-1">{getCameraEmoji(camera.position)}</div>
                <div className="text-xs font-medium">{camera.name}</div>
              </div>
            </div>
            
            {/* Live Indicator */}
            {camera.isActive && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}
            
            {/* Beat Drop Indicator */}
            {(camera.id === beatDropSettings.primaryCamera || camera.id === beatDropSettings.secondaryCamera) && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                🔥
              </div>
            )}
            
            {/* Camera Name */}
            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              {camera.position}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground mt-3">
        Click on any camera to switch the main live feed. Cameras with 🔥 are set for beat drops.
      </p>
    </GlassmorphicCard>
  );
};
