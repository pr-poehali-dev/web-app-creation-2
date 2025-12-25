export type ObjectType = 
  | 'text' 
  | 'shape' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'table' 
  | 'chart' 
  | 'group'
  | 'embed';

export type ShapeType = 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'arrow' 
  | 'star' 
  | 'polygon'
  | 'custom';

export type AnimationType = 
  | 'entrance' 
  | 'exit' 
  | 'emphasis' 
  | 'motion';

export type AnimationEffect = 
  | 'fade' 
  | 'slide' 
  | 'zoom' 
  | 'rotate' 
  | 'bounce' 
  | 'flip'
  | 'wipe'
  | 'dissolve'
  | 'grow'
  | 'shrink'
  | 'path';

export type EasingFunction = 
  | 'linear' 
  | 'easeIn' 
  | 'easeOut' 
  | 'easeInOut'
  | 'spring'
  | 'bounce'
  | 'elastic';

export type TriggerType = 
  | 'click' 
  | 'timer' 
  | 'previous' 
  | 'hover'
  | 'variable';

export type TransitionEffect = 
  | 'fade' 
  | 'slide-left' 
  | 'slide-right' 
  | 'slide-up' 
  | 'slide-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip'
  | 'dissolve'
  | 'wipe';

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  listStyle?: 'none' | 'bullet' | 'number';
}

export interface ShapeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  gradient?: {
    type: 'linear' | 'radial';
    stops: Array<{ offset: number; color: string }>;
    angle?: number;
  };
}

export interface AnimationKeyframe {
  time: number;
  properties: Partial<Transform & { opacity: number }>;
  easing: EasingFunction;
}

export interface Animation {
  id: string;
  type: AnimationType;
  effect: AnimationEffect;
  duration: number;
  delay: number;
  easing: EasingFunction;
  trigger: TriggerType;
  triggerValue?: string | number;
  loop: boolean;
  loopCount?: number;
  keyframes?: AnimationKeyframe[];
  path?: string;
}

export interface BaseObject {
  id: string;
  type: ObjectType;
  name: string;
  transform: Transform;
  locked: boolean;
  hidden: boolean;
  opacity: number;
  zIndex: number;
  animations: Animation[];
}

export interface TextObject extends BaseObject {
  type: 'text';
  content: string;
  style: TextStyle;
}

export interface ShapeObject extends BaseObject {
  type: 'shape';
  shapeType: ShapeType;
  style: ShapeStyle;
  points?: Array<{ x: number; y: number }>;
  path?: string;
}

export interface ImageObject extends BaseObject {
  type: 'image';
  url: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
  mask?: string;
}

export interface VideoObject extends BaseObject {
  type: 'video';
  url: string;
  poster?: string;
  autoplay: boolean;
  loop: boolean;
  controls: boolean;
  muted: boolean;
  startTime: number;
  endTime?: number;
}

export interface AudioObject extends BaseObject {
  type: 'audio';
  url: string;
  autoplay: boolean;
  loop: boolean;
  volume: number;
}

export interface TableObject extends BaseObject {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][];
  style: {
    headerBg: string;
    cellBg: string;
    borderColor: string;
    textStyle: TextStyle;
  };
}

export interface ChartObject extends BaseObject {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data: Array<{ label: string; value: number }>;
  colors: string[];
}

export interface GroupObject extends BaseObject {
  type: 'group';
  children: SlideObject[];
}

export interface EmbedObject extends BaseObject {
  type: 'embed';
  embedCode: string;
  url?: string;
}

export type SlideObject = 
  | TextObject 
  | ShapeObject 
  | ImageObject 
  | VideoObject 
  | AudioObject
  | TableObject
  | ChartObject
  | GroupObject
  | EmbedObject;

export interface Slide {
  id: string;
  name: string;
  objects: SlideObject[];
  background: {
    type: 'color' | 'gradient' | 'image' | 'video';
    value: string;
    gradient?: {
      type: 'linear' | 'radial';
      stops: Array<{ offset: number; color: string }>;
      angle?: number;
    };
  };
  transition: {
    effect: TransitionEffect;
    duration: number;
  };
  audio?: {
    url: string;
    volume: number;
    loop: boolean;
  };
  notes: string;
  duration?: number;
}

export interface Theme {
  id: string;
  name: string;
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layouts: Layout[];
}

export interface Layout {
  id: string;
  name: string;
  thumbnail: string;
  objects: Partial<SlideObject>[];
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  slides: Slide[];
  theme: Theme;
  settings: {
    width: number;
    height: number;
    aspectRatio: '16:9' | '4:3' | '16:10';
    autoAdvance: boolean;
    autoAdvanceDelay: number;
  };
  variables: Record<string, string | number | boolean>;
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

export interface EditorState {
  presentation: Presentation;
  currentSlideIndex: number;
  selectedObjectIds: string[];
  clipboard: SlideObject[];
  history: Presentation[];
  historyIndex: number;
  mode: 'editor' | 'presenter' | 'sorter' | 'notes';
  zoom: number;
  grid: {
    enabled: boolean;
    size: number;
    snap: boolean;
  };
  guides: Array<{ type: 'horizontal' | 'vertical'; position: number }>;
}
