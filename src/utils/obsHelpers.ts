
import { OBSSource } from '@/types/obs';

export const extractSourcesFromScenes = async (obs: any, scenes: any[]): Promise<OBSSource[]> => {
  const allSources: OBSSource[] = [];
  
  for (const scene of scenes) {
    try {
      const sceneItems = await obs.call('GetSceneItemList', { sceneName: String(scene.sceneName) });
      sceneItems.sceneItems.forEach((item: any) => {
        if (!allSources.find(s => s.sourceName === String(item.sourceName))) {
          allSources.push({
            sourceName: String(item.sourceName),
            sourceType: String(item.sourceKind || 'unknown')
          });
        }
      });
    } catch (error) {
      console.warn(`Failed to get sources for scene ${String(scene.sceneName)}:`, error);
    }
  }
  
  return allSources;
};

export const mapScenes = (scenes: any[]): any[] => {
  return scenes.map((scene: any, index: number) => ({
    sceneName: String(scene.sceneName),
    sceneIndex: index
  }));
};
