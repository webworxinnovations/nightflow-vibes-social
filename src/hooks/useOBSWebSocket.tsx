
import { useState, useEffect, useCallback } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import { toast } from 'sonner';
import { OBSConnectionConfig, OBSSource } from '@/types/obs';
import { useOBSConnection } from './useOBSConnection';
import { useOBSScenes } from './useOBSScenes';
import { extractSourcesFromScenes, mapScenes } from '@/utils/obsHelpers';

export const useOBSWebSocket = () => {
  const [obs] = useState(() => new OBSWebSocket());
  const [sources, setSources] = useState<OBSSource[]>([]);

  const connection = useOBSConnection(obs);
  const sceneManager = useOBSScenes(obs, connection.isConnected);

  const connect = useCallback(async (config: OBSConnectionConfig) => {
    const success = await connection.connect(config);
    
    if (success) {
      try {
        // Get initial data
        const sceneList = await obs.call('GetSceneList');
        
        const mappedScenes = mapScenes(sceneList.scenes);
        sceneManager.setScenes(mappedScenes);
        
        // Extract sources from scenes
        const extractedSources = await extractSourcesFromScenes(obs, sceneList.scenes);
        setSources(extractedSources);
        
        sceneManager.setCurrentScene(String(sceneList.currentProgramSceneName));
      } catch (error: any) {
        console.error('Failed to get initial OBS data:', error);
        toast.error('Connected to OBS but failed to load scenes');
      }
    }
  }, [connection.connect, obs, sceneManager]);

  const disconnect = useCallback(async () => {
    await connection.disconnect();
    sceneManager.setScenes([]);
    setSources([]);
    sceneManager.setCurrentScene('');
  }, [connection.disconnect, sceneManager]);

  // Set up event listeners
  useEffect(() => {
    const handleSceneChanged = (data: any) => {
      sceneManager.setCurrentScene(String(data.sceneName));
      console.log('OBS scene changed to:', String(data.sceneName));
    };

    const handleConnectionClosed = () => {
      connection.setIsConnected(false);
      sceneManager.setScenes([]);
      setSources([]);
      sceneManager.setCurrentScene('');
      toast.warning('OBS connection lost');
    };

    obs.on('CurrentProgramSceneChanged', handleSceneChanged);
    obs.on('ConnectionClosed', handleConnectionClosed);

    return () => {
      obs.off('CurrentProgramSceneChanged', handleSceneChanged);
      obs.off('ConnectionClosed', handleConnectionClosed);
    };
  }, [obs, connection.setIsConnected, sceneManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connection.isConnected) {
        obs.disconnect().catch(console.error);
      }
    };
  }, [obs, connection.isConnected]);

  return {
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    scenes: sceneManager.scenes,
    currentScene: sceneManager.currentScene,
    sources,
    connect,
    disconnect,
    switchScene: sceneManager.switchScene,
    setSourceVisibility: sceneManager.setSourceVisibility,
    refreshScenes: sceneManager.refreshScenes
  };
};
