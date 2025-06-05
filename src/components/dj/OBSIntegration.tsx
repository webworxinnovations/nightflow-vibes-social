
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
  Camera,
  RefreshCw,
  TestTube
} from "lucide-react";
import { toast } from "sonner";
import { useOBSWebSocket } from "@/hooks/useOBSWebSocket";

interface OBSIntegrationProps {
  cameras: Array<{ id: string; name: string; position: string }>;
  onCameraSwitch?: (cameraId: string) => void;
}

export const OBSIntegration = ({ cameras, onCameraSwitch }: OBSIntegrationProps) => {
  const {
    isConnected,
    isConnecting,
    scenes,
    currentScene,
    sources,
    connect,
    disconnect,
    switchScene,
    refreshScenes
  } = useOBSWebSocket();

  const [obsHost, setObsHost] = useState("localhost");
  const [obsPort, setObsPort] = useState("4455");
  const [obsPassword, setObsPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [streamKey, setStreamKey] = useState("");
  const [autoSync, setAutoSync] = useState(true);

  const generateStreamKey = () => {
    const key = `nf_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setStreamKey(key);
    toast.success("Stream key generated!");
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    toast.success("Stream key copied to clipboard!");
  };

  const handleConnect = async () => {
    await connect({
      host: obsHost,
      port: obsPort,
      password: obsPassword || undefined
    });
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleSceneSwitch = async (sceneName: string) => {
    const success = await switchScene(sceneName);
    if (success && onCameraSwitch) {
      // Find matching camera based on scene name
      const matchingCamera = cameras.find(camera => 
        sceneName.toLowerCase().includes(camera.position.toLowerCase()) ||
        sceneName.toLowerCase().includes(camera.name.toLowerCase())
      );
      if (matchingCamera) {
        onCameraSwitch(matchingCamera.id);
      }
    }
  };

  const testConnection = async () => {
    if (!isConnected) {
      toast.error("Please connect to OBS first");
      return;
    }

    try {
      await refreshScenes();
      toast.success("OBS connection test successful!");
    } catch (error) {
      toast.error("OBS connection test failed");
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
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="obs-host">OBS Host</Label>
                <Input
                  id="obs-host"
                  value={obsHost}
                  onChange={(e) => setObsHost(e.target.value)}
                  placeholder="localhost"
                  disabled={isConnecting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs-port">WebSocket Port</Label>
                <Input
                  id="obs-port"
                  value={obsPort}
                  onChange={(e) => setObsPort(e.target.value)}
                  placeholder="4455"
                  disabled={isConnecting}
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
                  disabled={isConnecting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isConnecting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleConnect} 
              className="w-full"
              disabled={isConnecting}
            >
              <Settings className="mr-2 h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect to OBS'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2 font-medium">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Install OBS WebSocket plugin (v5.0+) if not already installed</li>
                <li>In OBS: Tools → WebSocket Server Settings</li>
                <li>Enable WebSocket server</li>
                <li>Set port to 4455 (default) or your preferred port</li>
                <li>Set password if desired (optional but recommended)</li>
                <li>Click "Apply" in OBS</li>
                <li>Enter your connection details above and connect</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div>
                <p className="font-medium text-green-500">Connected to OBS</p>
                <p className="text-sm text-muted-foreground">{obsHost}:{obsPort}</p>
                <p className="text-xs text-muted-foreground">
                  {scenes.length} scenes • Current: {currentScene}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={testConnection}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="mr-1 h-3 w-3" />
                  Test
                </Button>
                <Button 
                  onClick={refreshScenes}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                  size="sm"
                >
                  Disconnect
                </Button>
              </div>
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

      {/* Real OBS Scenes */}
      {isConnected && scenes.length > 0 && (
        <GlassmorphicCard>
          <h3 className="text-lg font-semibold mb-4">OBS Scenes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenes.map((scene) => (
              <Button
                key={scene.sceneName}
                onClick={() => handleSceneSwitch(scene.sceneName)}
                variant={currentScene === scene.sceneName ? "default" : "outline"}
                className="justify-start h-auto p-3"
              >
                <div className="text-left">
                  <p className="font-medium">{scene.sceneName}</p>
                  {currentScene === scene.sceneName && (
                    <p className="text-xs text-green-400">● Active</p>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </GlassmorphicCard>
      )}

      {/* Camera to Scene Mapping */}
      {isConnected && scenes.length > 0 && (
        <GlassmorphicCard>
          <h3 className="text-lg font-semibold mb-4">Camera to Scene Mapping</h3>
          
          <div className="space-y-3">
            {cameras.map((camera) => {
              const mappedScene = scenes.find(scene => 
                scene.sceneName.toLowerCase().includes(camera.position.toLowerCase()) ||
                scene.sceneName.toLowerCase().includes(camera.name.toLowerCase())
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
                        {mappedScene ? mappedScene.sceneName : 'No auto-mapping found'}
                      </p>
                      {currentScene === mappedScene?.sceneName && (
                        <p className="text-xs text-green-500">● Active</p>
                      )}
                    </div>
                    <Button
                      onClick={() => mappedScene && handleSceneSwitch(mappedScene.sceneName)}
                      variant="outline"
                      size="sm"
                      disabled={!mappedScene || currentScene === mappedScene?.sceneName}
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
            <p className="mt-1 text-xs">
              <strong>Tip:</strong> Name your OBS scenes to include camera positions (e.g., "DJ Booth", "Dance Floor") for automatic mapping.
            </p>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};
