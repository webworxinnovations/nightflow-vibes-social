import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OBSIntegration } from "./OBSIntegration";
import { 
  Video, 
  VideoOff, 
  Play, 
  Pause, 
  Settings,
  Camera,
  Timer,
  Users,
  Monitor,
  Zap,
  Music,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface BeatDropSettings {
  enabled: boolean;
  sensitivity: number;
  primaryCamera: string;
  secondaryCamera: string;
  duration: number;
  preDropDelay: number; // seconds before beat drop to switch
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
                {beatDetected && (
                  <div className="flex items-center gap-1 text-orange-500 animate-pulse">
                    <Volume2 className="h-4 w-4" />
                    Beat Detected
                    {nextBeatDrop && ` (${nextBeatDrop}s)`}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {isLive && (
              <Button 
                onClick={manualBeatDrop}
                variant="outline"
                size="lg"
                className="bg-orange-500/10 border-orange-500 text-orange-500 hover:bg-orange-500/20"
              >
                <Zap className="mr-2 h-4 w-4" />
                Manual Beat Drop
              </Button>
            )}
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
        </div>
      </GlassmorphicCard>

      {/* Multi-Camera Preview */}
      {isLive && (
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
                onClick={() => switchCamera(camera.id)}
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
      )}

      {/* Main Tabs for Stream Management */}
      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="controls">Camera Controls</TabsTrigger>
          <TabsTrigger value="beat-detection">Beat Detection</TabsTrigger>
          <TabsTrigger value="obs-integration">OBS Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="controls" className="space-y-6">
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
                        {(camera.id === beatDropSettings.primaryCamera || camera.id === beatDropSettings.secondaryCamera) && (
                          <p className="text-xs text-orange-500 font-medium">
                            {camera.id === beatDropSettings.primaryCamera ? 'Primary Beat Drop' : 'Secondary Beat Drop'}
                          </p>
                        )}
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
            <h3 className="text-lg font-semibold mb-4">Quick Camera Triggers</h3>
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
              Quick switch cameras during key moments in your set
            </p>
          </GlassmorphicCard>
        </TabsContent>

        <TabsContent value="beat-detection" className="space-y-6">
          {/* Beat Drop Settings */}
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
                  onCheckedChange={(enabled) => setBeatDropSettings(prev => ({ ...prev, enabled }))}
                />
              </div>
              
              {beatDropSettings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Detection Sensitivity: {beatDropSettings.sensitivity}%</Label>
                    <Slider
                      value={[beatDropSettings.sensitivity]}
                      onValueChange={([value]) => setBeatDropSettings(prev => ({ ...prev, sensitivity: value }))}
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
                        onValueChange={(value) => setBeatDropSettings(prev => ({ ...prev, primaryCamera: value }))}
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
                        onValueChange={(value) => setBeatDropSettings(prev => ({ ...prev, secondaryCamera: value }))}
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
                        onValueChange={([value]) => setBeatDropSettings(prev => ({ ...prev, duration: value }))}
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
                        onValueChange={([value]) => setBeatDropSettings(prev => ({ ...prev, preDropDelay: value }))}
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
