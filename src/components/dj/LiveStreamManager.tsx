
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Video, 
  VideoOff, 
  Play, 
  Pause, 
  Settings,
  Camera,
  Timer,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface Camera {
  id: string;
  name: string;
  isActive: boolean;
  position: string;
}

interface CameraSequence {
  cameraId: string;
  duration: number; // in seconds
  triggerType: 'manual' | 'timer' | 'beat-drop';
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
  
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [currentCamera, setCurrentCamera] = useState("cam1");
  const [viewers, setViewers] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
        setViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const toggleLiveStream = () => {
    setIsLive(!isLive);
    if (!isLive) {
      setViewers(Math.floor(Math.random() * 50) + 10);
      toast.success("Live stream started!");
    } else {
      setStreamDuration(0);
      setViewers(0);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Live Stream Status */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isLive ? 'text-red-500' : 'text-muted-foreground'}`}>
              {isLive ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              <span className="text-lg font-semibold">
                {isLive ? 'LIVE' : 'Offline'}
              </span>
            </div>
            {isLive && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {viewers} viewers
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {formatTime(streamDuration)}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={toggleLiveStream}
            variant={isLive ? "destructive" : "default"}
            size="lg"
          >
            {isLive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                End Stream
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Go Live
              </>
            )}
          </Button>
        </div>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Controls */}
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
                  </div>
                  <Button
                    variant={camera.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchCamera(camera.id)}
                    disabled={!isLive}
                  >
                    {camera.isActive ? 'Active' : 'Switch'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassmorphicCard>

        {/* Auto-Switch Settings */}
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
                onCheckedChange={setAutoSwitch}
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
                        onValueChange={([value]) => updateSequenceDuration(index, value)}
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
      </div>

      {/* Beat Drop Triggers */}
      <GlassmorphicCard>
        <h3 className="text-lg font-semibold mb-4">Beat Drop Camera Triggers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cameras.map((camera) => (
            <Button
              key={camera.id}
              variant="outline"
              size="sm"
              onClick={() => switchCamera(camera.id)}
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
          Quick switch cameras during beat drops or key moments in your set
        </p>
      </GlassmorphicCard>
    </div>
  );
};
