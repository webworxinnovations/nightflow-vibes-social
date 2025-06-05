
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";

interface Camera {
  id: string;
  name: string;
  isActive: boolean;
  position: string;
}

interface QuickCameraTriggersProps {
  cameras: Camera[];
  isLive: boolean;
  onSwitchCamera: (cameraId: string) => void;
}

export const QuickCameraTriggers = ({
  cameras,
  isLive,
  onSwitchCamera
}: QuickCameraTriggersProps) => {
  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4">Quick Camera Triggers</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cameras.map((camera) => (
          <Button
            key={camera.id}
            variant="outline"
            size="sm"
            onClick={() => onSwitchCamera(camera.id)}
            disabled={!isLive}
            className="h-12"
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground">{camera.position}</div>
              <div className="font-medium">{camera.name}</div>
            </div>
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Quick switch cameras during key moments in your set
      </p>
    </GlassmorphicCard>
  );
};
