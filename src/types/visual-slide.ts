// Типи для візуального редактора слайдів

export type SlideObjectType = 'image' | 'text' | 'shape' | 'smart';

export type ShapeType = 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'star' 
  | 'arrow' 
  | 'line'
  | 'polygon';

export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'rotate'
  | 'bounce'
  | 'shake'
  | 'flip';

export interface Position {
  x: number; // у пікселях або відсотках
  y: number;
}

export interface Size {
  width: number; // у пікселях або відсотках
  height: number;
}

export interface Transform {
  rotation: number; // у градусах 0-360
  scaleX: number; // масштаб по X (0.1 - 5)
  scaleY: number; // масштаб по Y (0.1 - 5)
  opacity: number; // прозорість 0-1
}

export interface Animation {
  type: AnimationType;
  duration: number; // в мілісекундах
  delay: number; // затримка перед початком
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Базовий об'єкт на слайді
export interface BaseSlideObject {
  id: string;
  type: SlideObjectType;
  position: Position;
  size: Size;
  transform: Transform;
  animation?: Animation;
  zIndex: number; // порядок шарів
  locked?: boolean; // заблокувати від редагування
  visible?: boolean; // показувати чи ні
}

// Зображення на слайді
export interface ImageObject extends BaseSlideObject {
  type: 'image';
  url: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius?: number; // радіус скруглення в px
  filter?: string; // CSS filters (blur, brightness, etc)
}

// Текстовий блок на слайді
export interface TextObject extends BaseSlideObject {
  type: 'text';
  content: string;
  fontSize: number; // в px
  fontFamily?: string;
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color: string; // hex або rgba
  backgroundColor?: string;
  padding?: number; // внутрішній відступ
  borderRadius?: number;
}

// Фігура на слайді
export interface ShapeObject extends BaseSlideObject {
  type: 'shape';
  shapeType: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

// Розумний об'єкт (з шаблонами)
export interface SmartObject extends BaseSlideObject {
  type: 'smart';
  templateId: string; // ID шаблону (quote, stat, card, etc)
  data: Record<string, any>; // дані для шаблону
}

export type SlideObject = ImageObject | TextObject | ShapeObject | SmartObject;

// Візуальний слайд
export interface VisualSlide {
  id: string;
  paragraphId: string; // звʼязок з текстовим параграфом
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  objects: SlideObject[]; // всі об'єкти на слайді
  transition?: {
    type: AnimationType;
    duration: number;
  };
}

// Візуальний епізод (колекція слайдів)
export interface VisualEpisode {
  id: string;
  episodeId: string; // звʼязок з текстовим епізодом
  slides: VisualSlide[];
}

// Повна візуальна історія
export interface VisualStory {
  id: string;
  novelId: string; // звʼязок з Novel
  episodes: VisualEpisode[];
  version: number; // версія для синхронізації
  lastSyncedAt?: string; // дата останньої синхронізації
}
