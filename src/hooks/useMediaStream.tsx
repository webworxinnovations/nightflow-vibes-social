
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface MediaDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface UseMediaStreamReturn {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  devices: MediaDevice[];
  hasPermission: boolean;
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
}

export const useMediaStream = (): UseMediaStreamReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const getDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));
      setDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      console.error('Error getting devices:', err);
      return [];
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      
      // Refresh device list after getting permission
      await getDevices();
      
      toast.success('Camera started successfully');
    } catch (err: any) {
      console.error('Error starting camera:', err);
      let errorMessage = 'Failed to start camera';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getDevices]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
      toast.info('Camera stopped');
    }
  }, []);

  const switchCamera = useCallback(async (deviceId: string) => {
    await startCamera(deviceId);
  }, [startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Check for existing permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setHasPermission(permission.state === 'granted');
        
        if (permission.state === 'granted') {
          await getDevices();
        }
      } catch (err) {
        console.error('Error checking permissions:', err);
      }
    };

    checkPermissions();
  }, [getDevices]);

  return {
    stream,
    isLoading,
    error,
    devices,
    hasPermission,
    startCamera,
    stopCamera,
    switchCamera
  };
};
