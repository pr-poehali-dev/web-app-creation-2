export type ParagraphType = 'text' | 'choice' | 'item' | 'dialogue';

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
  | 'sandwich' // сэндвич: большой между двумя маленькими
  | 'spotlight' // прожектор: маленький в центре, 4 вокруг
  | 'filmstrip' // кинолента: горизонтальная полоса кадров
  | 'magazine-1' // журнальный 1: круг слева + вертикальная полоса справа
  | 'magazine-2' // журнальный 2: круг по центру + блоки вокруг
  | 'magazine-3' // журнальный 3: круг справа + вертикальные блоки слева
  | 'magazine-4' // журнальный 4: большой круг слева + мелкие блоки
  | 'magazine-5' // журнальный 5: круг в центре + 4 акцента внизу
  | 'magazine-6' // журнальный 6: круг справа вверху + блоки
  | 'magazine-7' // журнальный 7: сетка с текстом слева внизу
  | 'magazine-8' // журнальный 8: круг по центру + текст справа
  | 'magazine-9' // журнальный 9: большой круг по центру + 4 акцента по углам
  | 'diagonal-left' // диагональ слева направо (2 фрейма)
  | 'diagonal-right' // диагональ справа налево (2 фрейма)
  | 'triangle-top' // треугольник сверху (3 фрейма)
  | 'triangle-bottom' // треугольник снизу (3 фрейма)
  | 'triangle-left' // треугольник слева (3 фрейма)
  | 'triangle-right'; // треугольник справа (3 фрейма)

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

export interface ComicFrame {
  id: string;
  type: 'image' | 'background';
  url: string;
  mobileUrl?: string;
  alt?: string;
  paragraphTrigger?: number; // Индекс параграфа в группе (0, 1, 2...), на котором появляется фрейм
  animation?: FrameAnimationType; // Тип анимации появления
  objectPosition?: string; // CSS object-position (например: 'center', 'top', 'left', '50% 30%')
  objectFit?: 'cover' | 'contain' | 'fill'; // CSS object-fit
  shape?: 'square' | 'circle'; // Форма фрейма
  transform?: {
    x: number; // Смещение по X (в процентах, -50 до 50)
    y: number; // Смещение по Y (в процентах, -50 до 50)
    scale: number; // Масштаб (0.5 до 2)
    rotate: number; // Поворот в градусах (0-360)
  };
}

export type PastelColor = 'pink' | 'blue' | 'peach' | 'lavender' | 'mint' | 'yellow' | 'coral' | 'sky';

export interface BaseParagraph {
  id: string;
  type: ParagraphType;
  order?: number;
  requiredPaths?: string[];
}

export interface TextParagraph extends BaseParagraph {
  type: 'text';
  content: string;
}



export interface ChoiceParagraph extends BaseParagraph {
  type: 'choice';
  question: string;
  lockAfterChoice?: boolean; // Блокировать все варианты после первого выбора
  oneTime?: boolean; // Весь выбор одноразовый
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
}



export type Paragraph = 
  | TextParagraph 
  | ChoiceParagraph 
  | ItemParagraph 
  | DialogueParagraph;

export interface Episode {
  id: string;
  title: string;
  shortDescription?: string;
  paragraphs: Paragraph[];
  position: { x: number; y: number };
  backgroundMusic?: string;
  nextEpisodeId?: string;
  nextParagraphIndex?: number;
  requiredPath?: string;
  requiredPaths?: string[];
  unlockedForAll?: boolean;
  timeframes?: ('present' | 'retrospective')[];
  pastelColor?: PastelColor;
  pathNextEpisodes?: { [pathId: string]: string };
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
    audio: { id: string; name: string }[];
  };
  backgroundImages?: {
    episodes?: string;
    profile?: string;
    settings?: string;
  };
}