
export interface OBSConnectionConfig {
  host: string;
  port: string;
  password?: string;
}

export interface OBSScene {
  sceneName: string;
  sceneIndex: number;
}

export interface OBSSource {
  sourceName: string;
  sourceType: string;
}
