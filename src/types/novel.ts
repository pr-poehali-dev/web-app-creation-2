export type ParagraphType = 'text' | 'image' | 'choice' | 'item' | 'dialogue' | 'background';

export type MergeLayoutType = 
  | 'single' // 1 фрейм на весь экран
  | 'horizontal-2' // 2 фрейма в ряд
  | 'horizontal-3' // 3 блока в ряд
  | 'horizontal-4' // 4 блока в ряд
  | 'vertical-2' // 2 горизонтальных фрейма друг под другом
  | 'vertical-3' // 3 горизонтальных фрейма друг под другом
  | 'vertical-4' // 4 горизонтальных фрейма друг под другом
  | 'horizontal-2-1' // 2 больших + 1 маленький справа
  | 'horizontal-1-2' // 1 маленький слева + 2 больших
  | 'grid-2x2' // сетка 2x2
  | 'grid-3x3' // сетка 3x3
  | 'grid-2x3' // сетка 2x3 (6 фреймов)
  | 'mosaic-left' // мозаика с акцентом слева
  | 'mosaic-right' // мозаика с акцентом справа
  | 'vertical-left-3' // 1 большой слева + 3 справа вертикально
  | 'vertical-right-3' // 3 слева вертикально + 1 большой справа
  | 'center-large' // 1 большой в центре + 4 по углам
  | 'asymmetric-1' // асимметричная раскладка 1
  | 'asymmetric-2' // асимметричная раскладка 2
  | 'asymmetric-3' // асимметричная раскладка 3
  | 'l-shape' // L-образная раскладка
  | 'pyramid' // пирамида: 1 вверху, 2 внизу
  | 'inverted-pyramid' // перевернутая пирамида: 2 вверху, 1 внизу
  | 'sandwich' // сэндвич: большой между двумя маленькими
  | 'spotlight' // прожектор: маленький в центре, 4 вокруг
  | 'filmstrip' // кинолента: горизонтальная полоса кадров
  | 'diamond-grid' // ромбы: 9 ромбов расположенных в форме ромба
  | 'triangle-flow' // треугольники: 6 треугольников в художественной композиции
  | 'diamond-cascade' // каскад ромбов: 7 ромбов по диагонали
  | 'rotated-squares'; // квадраты 45°: 5 квадратов повернутых на 45 градусов

export type FrameAnimationType = 
  | 'fade' // Плавное появление
  | 'slide-up' // Снизу вверх
  | 'slide-down' // Сверху вниз
  | 'slide-left' // Справа налево
  | 'slide-right' // Слева направо
  | 'zoom' // Увеличение
  | 'zoom-out' // Уменьшение (от большого к нормальному)
  | 'flip' // Переворот
  | 'flip-x' // Переворот по горизонтали
  | 'rotate-in' // Вращение с появлением
  | 'bounce' // Прыжок
  | 'shake' // Тряска
  | 'blur-in' // Размытие → четкость
  | 'split-v' // Разделение вертикальное
  | 'split-h' // Разделение горизонтальное
  | 'glitch' // Глитч-эффект
  | 'wave' // Волна
  | 'none'; // Без анимации

export interface SubParagraph {
  id: string;
  text: string;
}

export interface ComicFrame {
  id: string;
  type: 'image' | 'background';
  url: string;
  mobileUrl?: string;
  alt?: string;
  subParagraphTrigger?: string; // ID подпараграфа, при котором показывается этот фрейм
  animation?: FrameAnimationType; // Тип анимации появления
}

export interface BaseParagraph {
  id: string;
  type: ParagraphType;
  order?: number;
  comicFrames?: ComicFrame[]; // Фреймы комикса для текстового параграфа
  frameLayout?: MergeLayoutType; // Раскладка фреймов
  frameAnimation?: FrameAnimationType; // Общая анимация для всех фреймов
  timeframes?: ('present' | 'retrospective')[];
  requiredPaths?: string[];
}

export interface TextParagraph extends BaseParagraph {
  type: 'text';
  content: string;
  subParagraphs?: SubParagraph[]; // Подпараграфы внутри текста
}

export interface ImageParagraph extends BaseParagraph {
  type: 'image';
  url: string;
  mobileUrl?: string;
  alt?: string;
}

export interface ChoiceParagraph extends BaseParagraph {
  type: 'choice';
  question: string;
  options: {
    id: string;
    text: string;
    nextEpisodeId?: string;
    nextParagraphIndex?: number;
    requiredPath?: string;
    activatesPath?: string;
    oneTime?: boolean;
  }[];
}

export interface ItemParagraph extends BaseParagraph {
  type: 'item';
  name: string;
  description: string;
  imageUrl?: string;
  itemType?: 'collectible' | 'story';
  action?: 'gain' | 'lose';
}

export interface DialogueParagraph extends BaseParagraph {
  type: 'dialogue';
  characterName: string;
  characterImage?: string;
  text: string;
  subParagraphs?: SubParagraph[]; // Подпараграфы внутри диалога
}

export interface BackgroundParagraph extends BaseParagraph {
  type: 'background';
  url: string;
  mobileUrl?: string;
  alt?: string;
}

export type Paragraph = 
  | TextParagraph 
  | ImageParagraph 
  | ChoiceParagraph 
  | ItemParagraph 
  | DialogueParagraph
  | BackgroundParagraph;

export interface Episode {
  id: string;
  title: string;
  paragraphs: Paragraph[];
  position: { x: number; y: number };
  backgroundMusic?: string;
  nextEpisodeId?: string;
  nextParagraphIndex?: number;
  requiredPath?: string;
  requiredPaths?: string[];
  unlockedForAll?: boolean;
  timeframes?: ('present' | 'retrospective')[];
}

export interface LibraryItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  itemType?: 'collectible' | 'story';
  position?: { x: number; y: number };
}

export interface LibraryCharacter {
  id: string;
  name: string;
  defaultImage?: string;
  images: { id: string; url: string; name?: string }[];
  description?: string;
  isStoryCharacter?: boolean;
}

export interface LibraryChoice {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    nextEpisodeId?: string;
    nextParagraphIndex?: number;
  }[];
  position?: { x: number; y: number };
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

export interface HomePage {
  greeting: string;
  greetingImage?: string;
  news: NewsItem[];
}

export interface Path {
  id: string;
  name: string;
  description?: string;
  color?: string;
  position?: { x: number; y: number };
}

export interface Novel {
  id?: string;
  title: string;
  description?: string;
  episodes: Episode[];
  currentEpisodeId?: string;
  currentParagraphIndex?: number;
  library: {
    items: LibraryItem[];
    characters: LibraryCharacter[];
    choices: LibraryChoice[];
  };
  paths?: Path[];
  homePage?: HomePage;
  fileStorage?: {
    images: { id: string; name: string; url: string }[];
    audio: { id: string; name: string; url: string }[];
  };
}