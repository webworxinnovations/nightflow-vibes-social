
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { CameraFeed } from "./CameraFeed";
import { useMediaStream } from "@/hooks/useMediaStream";
import { Monitor, Camera, Settings } from "lucide-react";
import { toast } from "sonner";

interface Camera {
  id: string;
  name: string;
  isActive: boolean;
  position: string;
  deviceId?: string;
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
  const { stream, devices, hasPermission, startCamera, stopCamera, switchCamera } = useMediaStream();
  const [activeCameraDevice, setActiveCameraDevice] = useState<string | null>(null);
  const [showCameraSettings, setShowCameraSettings] = useState(false);

  const handleStartCamera = async (camera: Camera) => {
    try {
      const deviceId = camera.deviceId || devices[0]?.deviceId;
      if (deviceId) {
        await startCamera(deviceId);
        setActiveCameraDevice(deviceId);
        onSwitchCamera(camera.id);
        toast.success(`Started camera: ${camera.name}`);
      } else {
        await startCamera(); // Use default camera
        setActiveCameraDevice('default');
        onSwitchCamera(camera.id);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const handleSwitchCamera = async (camera: Camera) => {
    if (activeCameraDevice && stream) {
      onSwitchCamera(camera.id);
      
      // If switching to a different device, start that camera
      if (camera.deviceId && camera.deviceId !== activeCameraDevice) {
        await switchCamera(camera.deviceId);
        setActiveCameraDevice(camera.deviceId);
      }
    } else {
      // Start camera if none is active
      await handleStartCamera(camera);
    }
  };

  const assignCameraDevice = (cameraId: string, deviceId: string) => {
    // This would update the camera configuration
    // For now, we'll just show a toast
    const camera = cameras.find(c => c.id === cameraId);
    const device = devices.find(d => d.deviceId === deviceId);
    if (camera && device) {
      toast.success(`Assigned ${device.label} to ${camera.name}`);
    }
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Camera Preview
        </h3>
        
        <div className="flex items-center gap-2">
          {devices.length > 0 && (
            <Button
              onClick={() => setShowCameraSettings(!showCameraSettings)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          
          {stream && (
            <Button
              onClick={stopCamera}
              variant="outline"
              size="sm"
            >
              Stop Camera
            </Button>
          )}
        </div>
      </div>

      {/* Camera Device Settings */}
      {showCameraSettings && devices.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Available Cameras:</h4>
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.deviceId} className="flex items-center justify-between text-sm">
                <span>{device.label}</span>
                <Button
                  onClick={() => switchCamera(device.deviceId)}
                  variant={activeCameraDevice === device.deviceId ? "default" : "outline"}
                  size="sm"
                >
                  {activeCameraDevice === device.deviceId ? 'Active' : 'Use'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Request */}
      {!hasPermission && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Camera className="h-4 w-4" />
            <span>Camera access required for live preview</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className={`border-2 transition-all cursor-pointer rounded-lg ${
              camera.isActive 
                ? 'border-red-500 ring-2 ring-red-500/20' 
                : 'border-border hover:border-primary/50'
            } ${
              beatDetected && (camera.id === beatDropSettings.primaryCamera || camera.id === beatDropSettings.secondaryCamera)
                ? 'ring-4 ring-orange-500/30 animate-pulse'
                : ''
            }`}
            onClick={() => handleSwitchCamera(camera)}
          >
            <CameraFeed
              stream={camera.isActive && stream ? stream : null}
              isActive={camera.isActive}
              name={camera.name}
              position={camera.position}
              onStartCamera={!stream ? () => handleStartCamera(camera) : undefined}
            />
            
            {/* Beat Drop Indicator */}
            {(camera.id === beatDropSettings.primaryCamera || camera.id === beatDropSettings.secondaryCamera) && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                🔥
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground mt-3">
        Click on any camera to switch the main live feed. {!stream && 'Click "Start Camera" to begin live preview.'}
      </p>
    </GlassmorphicCard>
  );
};
