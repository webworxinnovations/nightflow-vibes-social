
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";

interface Camera {
  id: string;
  name: string;
  isActive: boolean;
  position: string;
}

interface CameraSequence {
  cameraId: string;
  duration: number;
  triggerType: 'manual' | 'timer' | 'beat-drop';
}

interface AutoSwitchSettingsProps {
  autoSwitch: boolean;
  sequences: CameraSequence[];
  cameras: Camera[];
  onAutoSwitchChange: (enabled: boolean) => void;
  onUpdateSequenceDuration: (index: number, duration: number) => void;
}

export const AutoSwitchSettings = ({
  autoSwitch,
  sequences,
  cameras,
  onAutoSwitchChange,
  onUpdateSequenceDuration
}: AutoSwitchSettingsProps) => {
  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Auto-Switch Settings
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-switch">Enable Auto-Switch</Label>
          <Switch
            id="auto-switch"
            checked={autoSwitch}
            onCheckedChange={onAutoSwitchChange}
          />
        </div>
        
        {autoSwitch && (
          <div className="space-y-4">
            <h4 className="font-medium">Camera Sequence</h4>
            {sequences.map((sequence, index) => {
              const camera = cameras.find(c => c.id === sequence.cameraId);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{camera?.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {sequence.duration}s
                    </span>
                  </div>
                  <Slider
                    value={[sequence.duration]}
                    onValueChange={([value]) => onUpdateSequenceDuration(index, value)}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5s</span>
                    <span>120s</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
