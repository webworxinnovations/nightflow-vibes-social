
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Wifi, 
  WifiOff,
  Copy,
  Eye,
  EyeOff,
  Monitor,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface OBSScene {
  name: string;
  id: string;
  sources: string[];
}

interface OBSIntegrationProps {
  cameras: Array<{ id: string; name: string; position: string }>;
  onCameraSwitch?: (cameraId: string) => void;
}

export const OBSIntegration = ({ cameras, onCameraSwitch }: OBSIntegrationProps) => {
  const [obsConnected, setObsConnected] = useState(false);
  const [obsHost, setObsHost] = useState("localhost");
  const [obsPort, setObsPort] = useState("4455");
  const [obsPassword, setObsPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [streamKey, setStreamKey] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  
  // Mock OBS scenes - in real implementation, these would come from OBS WebSocket
  const [obsScenes] = useState<OBSScene[]>([
    { name: "DJ Booth", id: "scene1", sources: ["Camera 1", "Audio"] },
    { name: "Crowd View", id: "scene2", sources: ["Camera 2", "Audio"] },
    { name: "Dance Floor", id: "scene3", sources: ["Camera 3", "Audio"] },
    { name: "VIP Section", id: "scene4", sources: ["Camera 4", "Audio"] },
  ]);

  const generateStreamKey = () => {
    const key = `nf_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setStreamKey(key);
    toast.success("Stream key generated!");
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    toast.success("Stream key copied to clipboard!");
  };

  const connectToOBS = async () => {
    // In a real implementation, this would connect to OBS WebSocket
    try {
      toast.info("Connecting to OBS...");
      
      // Simulate connection delay
      setTimeout(() => {
        setObsConnected(true);
        toast.success(`Connected to OBS at ${obsHost}:${obsPort}`);
      }, 2000);
    } catch (error) {
      toast.error("Failed to connect to OBS. Check your connection settings.");
    }
  };

  const disconnectFromOBS = () => {
    setObsConnected(false);
    toast.info("Disconnected from OBS");
  };

  const switchOBSScene = (sceneId: string) => {
    if (!obsConnected) {
      toast.error("Not connected to OBS");
      return;
    }
    
    const scene = obsScenes.find(s => s.id === sceneId);
    if (scene) {
      toast.success(`Switched to OBS scene: ${scene.name}`);
      // In real implementation, send command to OBS WebSocket
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            OBS Studio Integration
          </h3>
          <div className={`flex items-center gap-2 ${obsConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
            {obsConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm">
              {obsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {!obsConnected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="obs-host">OBS Host</Label>
                <Input
                  id="obs-host"
                  value={obsHost}
                  onChange={(e) => setObsHost(e.target.value)}
                  placeholder="localhost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs-port">WebSocket Port</Label>
                <Input
                  id="obs-port"
                  value={obsPort}
                  onChange={(e) => setObsPort(e.target.value)}
                  placeholder="4455"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="obs-password">WebSocket Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="obs-password"
                  type={showPassword ? "text" : "password"}
                  value={obsPassword}
                  onChange={(e) => setObsPassword(e.target.value)}
                  placeholder="Enter OBS WebSocket password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={connectToOBS} className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Connect to OBS
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">To connect:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Install OBS WebSocket plugin (v5.0+)</li>
                <li>Enable WebSocket server in OBS Tools → WebSocket Server Settings</li>
                <li>Enter your connection details above</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div>
                <p className="font-medium text-green-500">Connected to OBS</p>
                <p className="text-sm text-muted-foreground">{obsHost}:{obsPort}</p>
              </div>
              <Button 
                onClick={disconnectFromOBS}
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-sync">Auto-sync camera switches with OBS</Label>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
          </div>
        )}
      </GlassmorphicCard>

      {/* Stream Key Management */}
      <GlassmorphicCard>
        <h3 className="text-lg font-semibold mb-4">Stream Key Management</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Night Flow Stream Key</Label>
            <div className="flex gap-2">
              <Input
                value={streamKey}
                readOnly
                placeholder="Click 'Generate' to create a stream key"
                className="font-mono text-sm"
              />
              <Button
                onClick={copyStreamKey}
                variant="outline"
                size="sm"
                disabled={!streamKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={generateStreamKey}
            variant="outline"
            className="w-full"
          >
            Generate New Stream Key
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">To use with OBS:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Copy the stream key above</li>
              <li>In OBS, go to Settings → Stream</li>
              <li>Set Service to "Custom..."</li>
              <li>Set Server to: <code className="bg-muted px-1 rounded">rtmp://stream.nightflow.app/live</code></li>
              <li>Paste the stream key</li>
            </ol>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Scene Mapping */}
      {obsConnected && (
        <GlassmorphicCard>
          <h3 className="text-lg font-semibold mb-4">Camera to Scene Mapping</h3>
          
          <div className="space-y-3">
            {cameras.map((camera) => {
              const mappedScene = obsScenes.find(scene => 
                scene.name.toLowerCase().includes(camera.position.toLowerCase()) ||
                scene.name.toLowerCase().includes(camera.name.toLowerCase())
              );
              
              return (
                <div 
                  key={camera.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{camera.name}</p>
                      <p className="text-sm text-muted-foreground">{camera.position}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">→</span>
                    <div className="text-right">
                      <p className="font-medium">
                        {mappedScene ? mappedScene.name : 'No mapping'}
                      </p>
                      {mappedScene && (
                        <p className="text-xs text-muted-foreground">
                          {mappedScene.sources.length} sources
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => mappedScene && switchOBSScene(mappedScene.id)}
                      variant="outline"
                      size="sm"
                      disabled={!mappedScene}
                    >
                      Switch
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Camera switches in Night Flow will automatically trigger the corresponding OBS scene when auto-sync is enabled.</p>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};
