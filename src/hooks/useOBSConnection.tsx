
import { useState, useCallback } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import { toast } from 'sonner';
import { OBSConnectionConfig } from '@/types/obs';

export const useOBSConnection = (obs: OBSWebSocket) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async (config: OBSConnectionConfig) => {
    setIsConnecting(true);
    
    try {
      const url = `ws://${config.host}:${config.port}`;
      await obs.connect(url, config.password);
      setIsConnected(true);
      toast.success(`Connected to OBS at ${config.host}:${config.port}`);
      return true;
    } catch (error: any) {
      console.error('OBS connection error:', error);
      toast.error(`Failed to connect to OBS: ${error.message || 'Unknown error'}`);
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [obs]);

  const disconnect = useCallback(async () => {
    try {
      if (isConnected) {
        await obs.disconnect();
      }
    } catch (error) {
      console.error('OBS disconnect error:', error);
    } finally {
      setIsConnected(false);
      toast.info('Disconnected from OBS');
    }
  }, [obs, isConnected]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    setIsConnected
  };
};
