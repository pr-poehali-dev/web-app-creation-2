export type ParagraphType = 'text' | 'image' | 'choice' | 'item' | 'dialogue' | 'background';

export interface BaseParagraph {
  id: string;
  type: ParagraphType;
  order?: number;
  mergedWith?: string; // ID следующего параграфа для объединения
}

export interface TextParagraph extends BaseParagraph {
  type: 'text';
  content: string;
}

export interface ImageParagraph extends BaseParagraph {
  type: 'image';
  url: string;
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
}

export interface BackgroundParagraph extends BaseParagraph {
  type: 'background';
  url: string;
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
  unlockedForAll?: boolean;
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