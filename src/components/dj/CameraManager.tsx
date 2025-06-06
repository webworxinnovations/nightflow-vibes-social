
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaStream } from "@/hooks/useMediaStream";
import { Camera, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Camera {
  id: string;
  name: string;
  position: string;
  deviceId?: string;
}

interface CameraManagerProps {
  cameras: Camera[];
  onUpdateCamera: (cameraId: string, deviceId: string) => void;
}

export const CameraManager = ({ cameras, onUpdateCamera }: CameraManagerProps) => {
  const { devices, hasPermission, startCamera } = useMediaStream();
  const [testingCamera, setTestingCamera] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    try {
      await startCamera();
      toast.success("Camera permission granted!");
    } catch (error) {
      toast.error("Failed to get camera permission");
    }
  };

  const handleTestCamera = async (deviceId: string) => {
    setTestingCamera(deviceId);
    try {
      await startCamera(deviceId);
      toast.success("Camera test successful!");
    } catch (error) {
      toast.error("Failed to test camera");
    } finally {
      setTimeout(() => setTestingCamera(null), 2000);
    }
  };

  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Camera Management
      </h3>

      {!hasPermission ? (
        <div className="text-center py-6">
          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">Camera Access Required</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Grant camera permission to manage video devices
          </p>
          <Button onClick={handleRequestPermission}>
            <Camera className="mr-2 h-4 w-4" />
            Grant Camera Access
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Available Devices</h4>
            <span className="text-sm text-muted-foreground">
              {devices.length} camera(s) found
            </span>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No cameras detected</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cameras.map((camera) => (
                <div key={camera.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{camera.name}</p>
                    <p className="text-sm text-muted-foreground">{camera.position}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={camera.deviceId || ""}
                      onValueChange={(deviceId) => onUpdateCamera(camera.id, deviceId)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {camera.deviceId && (
                      <Button
                        onClick={() => handleTestCamera(camera.deviceId!)}
                        variant="outline"
                        size="sm"
                        disabled={testingCamera === camera.deviceId}
                      >
                        {testingCamera === camera.deviceId ? 'Testing...' : 'Test'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Tip:</strong> Assign different cameras to different positions for automatic switching.
              Multiple USB cameras or network cameras can be used for professional setups.
            </p>
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
};
