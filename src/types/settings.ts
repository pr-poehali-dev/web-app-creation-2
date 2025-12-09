export interface UserSettings {
  textSpeed: number;
  musicVolume: number;
  soundEffects: boolean;
  autoPlay: boolean;
  textSize: 'small' | 'medium' | 'large';
  theme: 'dark' | 'light';
}

export interface UserProfile {
  name: string;
  avatar?: string;
  createdAt: string;
  totalReadTime: number;
  completedEpisodes: string[];
  achievements: string[];
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
  theme: 'dark'
};

export const defaultProfile: UserProfile = {
  name: 'Читатель',
  createdAt: new Date().toISOString(),
  totalReadTime: 0,
  completedEpisodes: [],
  achievements: []
};
