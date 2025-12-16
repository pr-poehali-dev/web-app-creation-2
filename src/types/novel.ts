export type ParagraphType = 'text' | 'image' | 'choice' | 'item' | 'dialogue' | 'background';

export type MergeLayoutType = 
  | 'single' // 1 фрейм на весь экран
  | 'horizontal-2' // 2 фрейма в ряд
  | 'horizontal-3' // 3 блока в ряд
  | 'horizontal-2-1' // 2 больших + 1 маленький справа
  | 'horizontal-1-2' // 1 маленький слева + 2 больших
  | 'grid-2x2' // сетка 2x2
  | 'mosaic-left' // мозаика с акцентом слева
  | 'mosaic-right' // мозаика с акцентом справа
  | 'vertical-left-3' // 1 большой слева + 3 справа вертикально
  | 'vertical-right-3' // 3 слева вертикально + 1 большой справа
  | 'center-large' // 1 большой в центре + 4 по углам
  | 'grid-3x3' // сетка 3x3
  | 'asymmetric-1' // асимметричная раскладка 1
  | 'asymmetric-2' // асимметричная раскладка 2
  | 'l-shape'; // L-образная раскладка

export interface ComicFrame {
  id: string;
  type: 'image' | 'background';
  url: string;
  mobileUrl?: string;
  alt?: string;
  textTrigger?: string; // Текст, при котором показывается этот фрейм
}

export interface BaseParagraph {
  id: string;
  type: ParagraphType;
  order?: number;
  comicFrames?: ComicFrame[]; // Фреймы комикса для текстового параграфа
  frameLayout?: MergeLayoutType; // Раскладка фреймов
  timeframes?: ('present' | 'retrospective')[];
  requiredPaths?: string[];
}

export interface TextParagraph extends BaseParagraph {
  type: 'text';
  content: string;
  subParagraphs?: string[]; // Подпараграфы внутри текста
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
  subParagraphs?: string[]; // Подпараграфы внутри диалога
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