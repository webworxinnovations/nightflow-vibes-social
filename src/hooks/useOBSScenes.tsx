
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { OBSScene } from '@/types/obs';
import { mapScenes } from '@/utils/obsHelpers';

export const useOBSScenes = (obs: any, isConnected: boolean) => {
  const [scenes, setScenes] = useState<OBSScene[]>([]);
  const [currentScene, setCurrentScene] = useState<string>('');

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

  const refreshScenes = useCallback(async () => {
    if (!isConnected) return;

    try {
      const sceneList = await obs.call('GetSceneList');
      setScenes(mapScenes(sceneList.scenes));
      setCurrentScene(String(sceneList.currentProgramSceneName));
    } catch (error: any) {
      console.error('Failed to refresh scenes:', error);
      toast.error('Failed to refresh OBS scenes');
    }
  }, [obs, isConnected]);

  const setSourceVisibility = useCallback(async (sourceName: string, visible: boolean) => {
    if (!isConnected) {
      toast.error('Not connected to OBS');
      return false;
    }

    try {
      const sceneItems = await obs.call('GetSceneItemList', { sceneName: currentScene });
      const sceneItem = sceneItems.sceneItems.find((item: any) => String(item.sourceName) === sourceName);
      
      if (!sceneItem) {
        toast.error(`Source "${sourceName}" not found in current scene`);
        return false;
      }

      await obs.call('SetSceneItemEnabled', {
        sceneName: currentScene,
        sceneItemId: Number(sceneItem.sceneItemId),
        sceneItemEnabled: visible
      });
      return true;
    } catch (error: any) {
      console.error('Source visibility error:', error);
      toast.error(`Failed to update source visibility: ${error.message}`);
      return false;
    }
  }, [obs, isConnected, currentScene]);

  return {
    scenes,
    currentScene,
    switchScene,
    refreshScenes,
    setSourceVisibility,
    setScenes,
    setCurrentScene
  };
};
