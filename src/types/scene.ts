export type EasingFunction = 
  | 'linear'
  | 'ease-in' | 'ease-out' | 'ease-in-out'
  | 'cubic-bezier'
  | 'bounce' | 'elastic' | 'back'
  | 'steps';

export type TriggerType = 
  | 'onLoad'
  | 'onClick' 
  | 'afterAnimation'
  | 'atTime'
  | 'onChoice';

export type LayerType = 
  | 'background' 
  | 'image' 
  | 'video' 
  | 'text' 
  | 'sprite'
  | 'shape';

export type TransformProperty = 
  | 'x' | 'y' | 'scale' | 'scaleX' | 'scaleY'
  | 'rotation' | 'opacity' | 'blur'
  | 'width' | 'height';

export interface Keyframe {
  id: string;
  time: number;
  property: TransformProperty;
  value: number | string;
  easing: EasingFunction;
  easingParams?: number[];
}

export interface Animation {
  id: string;
  layerId: string;
  name: string;
  keyframes: Keyframe[];
  duration: number;
  delay?: number;
  loop?: boolean;
  trigger: TriggerType;
  triggerParams?: {
    targetLayerId?: string;
    time?: number;
    choiceId?: string;
  };
}

export interface AudioTimecode {
  time: number;
  text?: string;
  layerId?: string;
  action?: 'highlight' | 'show' | 'hide' | 'animate';
}

export interface AudioTrack {
  id: string;
  url: string;
  name: string;
  volume: number;
  loop: boolean;
  timecodes: AudioTimecode[];
  crossfadeIn?: number;
  crossfadeOut?: number;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  order: number;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  scale: number;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  backgroundColor?: string;
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  blur?: number;
}

export interface Choice {
  id: string;
  text: string;
  targetSceneId?: string;
  condition?: string;
  variables?: { [key: string]: any };
}

export interface Scene {
  id: string;
  name: string;
  duration: number;
  layers: Layer[];
  animations: Animation[];
  audioTracks: AudioTrack[];
  choices: Choice[];
  variables: { [key: string]: any };
  transitions?: {
    in?: string;
    out?: string;
  };
  notes?: string;
}

export interface SceneProject {
  id: string;
  name: string;
  scenes: Scene[];
  globalVariables: { [key: string]: any };
  currentSceneId: string;
  settings: {
    width: number;
    height: number;
    backgroundColor: string;
    defaultFontFamily: string;
    accessibility: {
      enableKeyboardNav: boolean;
      enableAriaLabels: boolean;
    };
  };
}
