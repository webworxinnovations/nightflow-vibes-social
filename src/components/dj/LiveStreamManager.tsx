
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OBSIntegration } from "./OBSIntegration";
import { LiveStreamStatus } from "./LiveStreamStatus";
import { CameraPreview } from "./CameraPreview";
import { CameraControls } from "./CameraControls";
import { AutoSwitchSettings } from "./AutoSwitchSettings";
import { BeatDetectionSettings } from "./BeatDetectionSettings";
import { QuickCameraTriggers } from "./QuickCameraTriggers";
import { toast } from "sonner";

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

interface BeatDropSettings {
  enabled: boolean;
  sensitivity: number;
  primaryCamera: string;
  secondaryCamera: string;
  duration: number;
  preDropDelay: number;
}

export const LiveStreamManager = () => {
  const [isLive, setIsLive] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([
    { id: "cam1", name: "DJ Booth", isActive: true, position: "center" },
    { id: "cam2", name: "Crowd Wide", isActive: false, position: "back" },
    { id: "cam3", name: "Dance Floor", isActive: false, position: "floor" },
    { id: "cam4", name: "VIP Section", isActive: false, position: "side" },
  ]);
  
  const [sequences, setSequences] = useState<CameraSequence[]>([
    { cameraId: "cam1", duration: 30, triggerType: 'timer' },
    { cameraId: "cam2", duration: 45, triggerType: 'timer' },
    { cameraId: "cam3", duration: 20, triggerType: 'beat-drop' },
  ]);
  
  const [beatDropSettings, setBeatDropSettings] = useState<BeatDropSettings>({
    enabled: true,
    sensitivity: 75,
    primaryCamera: "cam1",
    secondaryCamera: "cam3",
    duration: 8,
    preDropDelay: 2
  });
  
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [currentCamera, setCurrentCamera] = useState("cam1");
  const [viewers, setViewers] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);
  const [nextBeatDrop, setNextBeatDrop] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
        setViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
        
        // Simulate beat detection
        if (beatDropSettings.enabled && Math.random() < 0.02) { // 2% chance per second
          simulateBeatDrop();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive, beatDropSettings.enabled]);

  const simulateBeatDrop = () => {
    setBeatDetected(true);
    const countdown = beatDropSettings.preDropDelay;
    setNextBeatDrop(countdown);
    
    toast.info(`Beat drop detected! Switching to ${cameras.find(c => c.id === beatDropSettings.primaryCamera)?.name} in ${countdown}s`, {
      duration: countdown * 1000,
    });
    
    // Pre-drop countdown
    const countdownInterval = setInterval(() => {
      setNextBeatDrop(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          triggerBeatDropCamera();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimeout(() => setBeatDetected(false), (countdown + beatDropSettings.duration) * 1000);
  };

  const triggerBeatDropCamera = () => {
    switchCamera(beatDropSettings.primaryCamera);
    
    // Switch to secondary camera after half the duration
    setTimeout(() => {
      if (beatDropSettings.secondaryCamera && beatDropSettings.secondaryCamera !== beatDropSettings.primaryCamera) {
        switchCamera(beatDropSettings.secondaryCamera);
      }
    }, (beatDropSettings.duration / 2) * 1000);
    
    // Return to normal sequence after beat drop duration
    setTimeout(() => {
      if (autoSwitch && sequences.length > 0) {
        const normalSequence = sequences.find(s => s.triggerType === 'timer');
        if (normalSequence) {
          switchCamera(normalSequence.cameraId);
        }
      }
    }, beatDropSettings.duration * 1000);
  };

  const manualBeatDrop = () => {
    if (!isLive) return;
    simulateBeatDrop();
    toast.success("Manual beat drop triggered!");
  };

  const toggleLiveStream = () => {
    setIsLive(!isLive);
    if (!isLive) {
      setViewers(Math.floor(Math.random() * 50) + 10);
      toast.success("Live stream started!");
    } else {
      setStreamDuration(0);
      setViewers(0);
      setBeatDetected(false);
      setNextBeatDrop(null);
      toast.info("Live stream ended");
    }
  };

  const switchCamera = (cameraId: string) => {
    setCurrentCamera(cameraId);
    setCameras(cameras.map(cam => ({
      ...cam,
      isActive: cam.id === cameraId
    })));
    toast.info(`Switched to ${cameras.find(c => c.id === cameraId)?.name}`);
  };

  const updateSequenceDuration = (index: number, duration: number) => {
    const newSequences = [...sequences];
    newSequences[index].duration = duration;
    setSequences(newSequences);
  };

  const updateBeatDropSettings = (newSettings: Partial<BeatDropSettings>) => {
    setBeatDropSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="space-y-6">
      <LiveStreamStatus
        isLive={isLive}
        viewers={viewers}
        streamDuration={streamDuration}
        beatDetected={beatDetected}
        nextBeatDrop={nextBeatDrop}
        onToggleLiveStream={toggleLiveStream}
        onManualBeatDrop={manualBeatDrop}
      />

      {isLive && (
        <CameraPreview
          cameras={cameras}
          beatDetected={beatDetected}
          beatDropSettings={beatDropSettings}
          onSwitchCamera={switchCamera}
        />
      )}

      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="controls">Camera Controls</TabsTrigger>
          <TabsTrigger value="beat-detection">Beat Detection</TabsTrigger>
          <TabsTrigger value="obs-integration">OBS Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CameraControls
              cameras={cameras}
              beatDropSettings={beatDropSettings}
              isLive={isLive}
              onSwitchCamera={switchCamera}
            />

            <AutoSwitchSettings
              autoSwitch={autoSwitch}
              sequences={sequences}
              cameras={cameras}
              onAutoSwitchChange={setAutoSwitch}
              onUpdateSequenceDuration={updateSequenceDuration}
            />
          </div>

          <QuickCameraTriggers
            cameras={cameras}
            isLive={isLive}
            onSwitchCamera={switchCamera}
          />
        </TabsContent>

        <TabsContent value="beat-detection" className="space-y-6">
          <BeatDetectionSettings
            beatDropSettings={beatDropSettings}
            cameras={cameras}
            onBeatDropSettingsChange={updateBeatDropSettings}
          />
        </TabsContent>

        <TabsContent value="obs-integration">
          <OBSIntegration 
            cameras={cameras}
            onCameraSwitch={switchCamera}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
