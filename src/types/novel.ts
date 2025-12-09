export type ParagraphType = 'text' | 'image' | 'choice' | 'item' | 'dialogue' | 'fade';

export interface BaseParagraph {
  id: string;
  type: ParagraphType;
  order?: number;
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
  }[];
}

export interface ItemParagraph extends BaseParagraph {
  type: 'item';
  name: string;
  description: string;
  imageUrl?: string;
}

export interface DialogueParagraph extends BaseParagraph {
  type: 'dialogue';
  characterName: string;
  characterImage?: string;
  text: string;
}

export interface FadeParagraph extends BaseParagraph {
  type: 'fade';
}

export type Paragraph = 
  | TextParagraph 
  | ImageParagraph 
  | ChoiceParagraph 
  | ItemParagraph 
  | DialogueParagraph
  | FadeParagraph;

export interface Episode {
  id: string;
  title: string;
  paragraphs: Paragraph[];
  position: { x: number; y: number };
  backgroundMusic?: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface LibraryCharacter {
  id: string;
  name: string;
  image?: string;
}

export interface LibraryChoice {
  id: string;
  text: string;
  nextEpisodeId?: string;
}

export interface Novel {
  id: string;
  title: string;
  description: string;
  episodes: Episode[];
  currentEpisodeId: string;
  currentParagraphIndex: number;
  library: {
    items: LibraryItem[];
    characters: LibraryCharacter[];
    choices: LibraryChoice[];
  };
}