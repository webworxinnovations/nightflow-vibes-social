
import { useState, useEffect, useCallback } from "react";

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

export const useCameraSequence = (
  cameras: Camera[],
  sequences: CameraSequence[],
  autoSwitch: boolean,
  isLive: boolean
) => {
  const [currentCamera, setCurrentCamera] = useState(cameras[0]?.id || "");
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const switchToCamera = useCallback((cameraId: string) => {
    setCurrentCamera(cameraId);
    console.log(`Switched to camera: ${cameras.find(c => c.id === cameraId)?.name}`);
  }, [cameras]);

  useEffect(() => {
    if (!autoSwitch || !isLive || sequences.length === 0) return;

    const currentSequence = sequences[sequenceIndex];
    if (!currentSequence) return;

    setTimeRemaining(currentSequence.duration);
    switchToCamera(currentSequence.cameraId);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          const nextIndex = (sequenceIndex + 1) % sequences.length;
          setSequenceIndex(nextIndex);
          return sequences[nextIndex]?.duration || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoSwitch, isLive, sequenceIndex, sequences, switchToCamera]);

  const triggerBeatDrop = useCallback((cameraId: string, duration: number = 10) => {
    if (!isLive) return;
    
    switchToCamera(cameraId);
    
    // Return to sequence after beat drop
    setTimeout(() => {
      if (autoSwitch && sequences.length > 0) {
        const currentSequence = sequences[sequenceIndex];
        if (currentSequence) {
          switchToCamera(currentSequence.cameraId);
        }
      }
    }, duration * 1000);
  }, [isLive, autoSwitch, sequences, sequenceIndex, switchToCamera]);

  return {
    currentCamera,
    timeRemaining,
    switchToCamera,
    triggerBeatDrop,
  };
};
