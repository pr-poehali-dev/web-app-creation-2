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
  totalReadTime: number;
  completedEpisodes: string[];
  achievements: string[];
  bookmarks: Bookmark[];
  collectedItems: CollectedItem[];
  metCharacters: MetCharacter[];
  currentEpisodeId: string;
  currentParagraphIndex: number;
  readParagraphs: string[];
  usedChoices: string[];
  activePaths: string[];
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
  totalReadTime: 0,
  completedEpisodes: [],
  achievements: [],
  bookmarks: [],
  collectedItems: [],
  metCharacters: [],
  currentEpisodeId: 'ep1',
  currentParagraphIndex: 0,
  readParagraphs: [],
  usedChoices: [],
  activePaths: []
};