
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Music } from "lucide-react";

interface Camera {
  id: string;
  name: string;
  isActive: boolean;
  position: string;
}

interface BeatDropSettings {
  enabled: boolean;
  sensitivity: number;
  primaryCamera: string;
  secondaryCamera: string;
  duration: number;
  preDropDelay: number;
}

interface BeatDetectionSettingsProps {
  beatDropSettings: BeatDropSettings;
  cameras: Camera[];
  onBeatDropSettingsChange: (settings: Partial<BeatDropSettings>) => void;
}

export const BeatDetectionSettings = ({
  beatDropSettings,
  cameras,
  onBeatDropSettingsChange
}: BeatDetectionSettingsProps) => {
  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Music className="h-5 w-5" />
        Beat Drop Detection
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="beat-detection">Enable Beat Detection</Label>
          <Switch
            id="beat-detection"
            checked={beatDropSettings.enabled}
            onCheckedChange={(enabled) => onBeatDropSettingsChange({ enabled })}
          />
        </div>
        
        {beatDropSettings.enabled && (
          <>
            <div className="space-y-2">
              <Label>Detection Sensitivity: {beatDropSettings.sensitivity}%</Label>
              <Slider
                value={[beatDropSettings.sensitivity]}
                onValueChange={([value]) => onBeatDropSettingsChange({ sensitivity: value })}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Beat Drop Camera</Label>
                <Select 
                  value={beatDropSettings.primaryCamera} 
                  onValueChange={(value) => onBeatDropSettingsChange({ primaryCamera: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Secondary Camera</Label>
                <Select 
                  value={beatDropSettings.secondaryCamera} 
                  onValueChange={(value) => onBeatDropSettingsChange({ secondaryCamera: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Beat Drop Duration: {beatDropSettings.duration}s</Label>
                <Slider
                  value={[beatDropSettings.duration]}
                  onValueChange={([value]) => onBeatDropSettingsChange({ duration: value })}
                  max={30}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Pre-Drop Delay: {beatDropSettings.preDropDelay}s</Label>
                <Slider
                  value={[beatDropSettings.preDropDelay]}
                  onValueChange={([value]) => onBeatDropSettingsChange({ preDropDelay: value })}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </GlassmorphicCard>
  );
};
