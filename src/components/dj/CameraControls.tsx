
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Camera } from "lucide-react";

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

interface CameraControlsProps {
  cameras: Camera[];
  beatDropSettings: BeatDropSettings;
  isLive: boolean;
  onSwitchCamera: (cameraId: string) => void;
}

export const CameraControls = ({
  cameras,
  beatDropSettings,
  isLive,
  onSwitchCamera
}: CameraControlsProps) => {
  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5" />
        Camera Controls
      </h3>
      
      <div className="space-y-4">
        {cameras.map((camera) => (
          <div 
            key={camera.id}
            className={`p-3 rounded-lg border-2 transition-colors ${
              camera.isActive 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{camera.name}</span>
                <p className="text-sm text-muted-foreground">{camera.position}</p>
                {(camera.id === beatDropSettings.primaryCamera || camera.id === beatDropSettings.secondaryCamera) && (
                  <p className="text-xs text-orange-500 font-medium">
                    {camera.id === beatDropSettings.primaryCamera ? 'Primary Beat Drop' : 'Secondary Beat Drop'}
                  </p>
                )}
              </div>
              <Button
                variant={camera.isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onSwitchCamera(camera.id)}
                disabled={!isLive}
              >
                {camera.isActive ? 'Active' : 'Switch'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassmorphicCard>
  );
};
