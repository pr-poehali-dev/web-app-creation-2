export interface UserSettings {
  textSpeed: number;
  musicVolume: number;
  soundEffects: boolean;
  autoPlay: boolean;
  textSize: 'small' | 'medium' | 'large';
  theme: 'dark' | 'light';
  fontFamily: 'merriweather' | 'montserrat' | 'georgia' | 'arial' | 'playfair' | 'lora' | 'roboto' | 'opensans' | 'ptsans' | 'Inter';
  uiFontFamily: 'system' | 'montserrat' | 'roboto' | 'opensans' | 'ptsans' | 'Inter' | 'playfair' | 'lora';
}

export interface Bookmark {
  id: string;
  episodeId: string;
  paragraphIndex: number;
  comment: string;
  createdAt: string;
}

export interface CollectedItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  episodeId: string;
  itemType: 'collectible' | 'story';
}

export interface MetCharacter {
  id: string;
  name: string;
  image?: string;
  episodeId: string;
  firstMetAt: string;
  comment?: string;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  createdAt: string;
  completedEpisodes: string[];
  bookmarks: Bookmark[];
  collectedItems: CollectedItem[];
  storyItems: string[];
  metCharacters: MetCharacter[];
  currentEpisodeId: string;
  currentParagraphIndex: number;
  currentSubParagraphIndex?: number;
  readParagraphs: string[];
  usedChoices: string[];
  activePaths: string[];
  pathChoices: { [pathId: string]: string[] };
}

export interface ReadProgress {
  episodeId: string;
  paragraphIndex: number;
  timestamp: number;
  readPercentage: number;
}

export const defaultSettings: UserSettings = {
  textSpeed: 50,
  musicVolume: 70,
  soundEffects: true,
  autoPlay: false,
  textSize: 'medium',
  theme: 'dark',
  fontFamily: 'merriweather',
  uiFontFamily: 'system'
};

export const defaultProfile: UserProfile = {
  name: 'Читатель',
  createdAt: new Date().toISOString(),
  completedEpisodes: [],
  bookmarks: [],
  collectedItems: [],
  storyItems: [],
  metCharacters: [],
  currentEpisodeId: 'ep1',
  currentParagraphIndex: 0,
  readParagraphs: [],
  usedChoices: [],
  activePaths: [],
  pathChoices: {}
};