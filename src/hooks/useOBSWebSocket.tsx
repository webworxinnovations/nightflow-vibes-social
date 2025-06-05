
import { useState, useEffect, useCallback } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import { toast } from 'sonner';

interface OBSConnectionConfig {
  host: string;
  port: string;
  password?: string;
}

interface OBSScene {
  sceneName: string;
  sceneIndex: number;
}

interface OBSSource {
  sourceName: string;
  sourceType: string;
}

export const useOBSWebSocket = () => {
  const [obs] = useState(() => new OBSWebSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scenes, setScenes] = useState<OBSScene[]>([]);
  const [currentScene, setCurrentScene] = useState<string>('');
  const [sources, setSources] = useState<OBSSource[]>([]);

  const connect = useCallback(async (config: OBSConnectionConfig) => {
    setIsConnecting(true);
    
    try {
      const url = `ws://${config.host}:${config.port}`;
      
      await obs.connect(url, config.password);
      
      // Get initial data
      const sceneList = await obs.call('GetSceneList');
      
      setScenes(sceneList.scenes.map((scene: any, index: number) => ({
        sceneName: scene.sceneName,
        sceneIndex: index
      })));
      
      // Note: OBS WebSocket v5 doesn't have GetSourcesList, we'll get sources from scenes
      const allSources: OBSSource[] = [];
      
      // Get sources from each scene
      for (const scene of sceneList.scenes) {
        try {
          const sceneItems = await obs.call('GetSceneItemList', { sceneName: scene.sceneName });
          sceneItems.sceneItems.forEach((item: any) => {
            if (!allSources.find(s => s.sourceName === item.sourceName)) {
              allSources.push({
                sourceName: item.sourceName,
                sourceType: item.sourceKind || 'unknown'
              });
            }
          });
        } catch (error) {
          console.warn(`Failed to get sources for scene ${scene.sceneName}:`, error);
        }
      }
      
      setSources(allSources);
      setCurrentScene(sceneList.currentProgramSceneName);
      setIsConnected(true);
      
      toast.success(`Connected to OBS at ${config.host}:${config.port}`);
    } catch (error: any) {
      console.error('OBS connection error:', error);
      toast.error(`Failed to connect to OBS: ${error.message || 'Unknown error'}`);
      setIsConnected(false);
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
      setScenes([]);
      setSources([]);
      setCurrentScene('');
      toast.info('Disconnected from OBS');
    }
  }, [obs, isConnected]);

  const switchScene = useCallback(async (sceneName: string) => {
    if (!isConnected) {
      toast.error('Not connected to OBS');
      return false;
    }

    try {
      await obs.call('SetCurrentProgramScene', { sceneName });
      setCurrentScene(sceneName);
      toast.success(`Switched to scene: ${sceneName}`);
      return true;
    } catch (error: any) {
      console.error('Scene switch error:', error);
      toast.error(`Failed to switch scene: ${error.message}`);
      return false;
    }
  }, [obs, isConnected]);

  const setSourceVisibility = useCallback(async (sourceName: string, visible: boolean) => {
    if (!isConnected) {
      toast.error('Not connected to OBS');
      return false;
    }

    try {
      // Get the scene item ID first
      const sceneItems = await obs.call('GetSceneItemList', { sceneName: currentScene });
      const sceneItem = sceneItems.sceneItems.find((item: any) => item.sourceName === sourceName);
      
      if (!sceneItem) {
        toast.error(`Source "${sourceName}" not found in current scene`);
        return false;
      }

      await obs.call('SetSceneItemEnabled', {
        sceneName: currentScene,
        sceneItemId: sceneItem.sceneItemId,
        sceneItemEnabled: visible
      });
      return true;
    } catch (error: any) {
      console.error('Source visibility error:', error);
      toast.error(`Failed to update source visibility: ${error.message}`);
      return false;
    }
  }, [obs, isConnected, currentScene]);

  const refreshScenes = useCallback(async () => {
    if (!isConnected) return;

    try {
      const sceneList = await obs.call('GetSceneList');
      setScenes(sceneList.scenes.map((scene: any, index: number) => ({
        sceneName: scene.sceneName,
        sceneIndex: index
      })));
      setCurrentScene(sceneList.currentProgramSceneName);
    } catch (error: any) {
      console.error('Failed to refresh scenes:', error);
      toast.error('Failed to refresh OBS scenes');
    }
  }, [obs, isConnected]);

  // Set up event listeners
  useEffect(() => {
    const handleSceneChanged = (data: any) => {
      setCurrentScene(data.sceneName);
      console.log('OBS scene changed to:', data.sceneName);
    };

    const handleConnectionClosed = () => {
      setIsConnected(false);
      setScenes([]);
      setSources([]);
      setCurrentScene('');
      toast.warning('OBS connection lost');
    };

    obs.on('CurrentProgramSceneChanged', handleSceneChanged);
    obs.on('ConnectionClosed', handleConnectionClosed);

    return () => {
      obs.off('CurrentProgramSceneChanged', handleSceneChanged);
      obs.off('ConnectionClosed', handleConnectionClosed);
    };
  }, [obs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        obs.disconnect().catch(console.error);
      }
    };
  }, [obs, isConnected]);

  return {
    isConnected,
    isConnecting,
    scenes,
    currentScene,
    sources,
    connect,
    disconnect,
    switchScene,
    setSourceVisibility,
    refreshScenes
  };
};
