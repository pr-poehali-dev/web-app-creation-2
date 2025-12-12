import { useState, useEffect } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, defaultSettings, defaultProfile } from '@/types/settings';

export type View = 'home' | 'reader' | 'admin' | 'episodes' | 'profile' | 'settings';

export function useAppState() {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeView, setActiveView] = useState<View>('reader');

  const [showParagraphsDialog, setShowParagraphsDialog] = useState(false);
  const [selectedEpisodeForParagraphs, setSelectedEpisodeForParagraphs] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showGreetingScreen, setShowGreetingScreen] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptDismissed, setAuthPromptDismissed] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        // Миграция старых профилей: добавляем отсутствующие поля
        const migratedProfile = {
          ...parsedProfile,
          readParagraphs: parsedProfile.readParagraphs || [],
          usedChoices: parsedProfile.usedChoices || [],
          activePaths: parsedProfile.activePaths || [],
          pathChoices: parsedProfile.pathChoices || {}
        };
        setProfile(migratedProfile);
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  return {
    novel,
    setNovel,
    settings,
    setSettings,
    profile,
    setProfile,
    activeView,
    setActiveView,
    showParagraphsDialog,
    setShowParagraphsDialog,
    selectedEpisodeForParagraphs,
    setSelectedEpisodeForParagraphs,
    showSidebar,
    setShowSidebar,
    isAdmin,
    setIsAdmin,
    showGreetingScreen,
    setShowGreetingScreen,
    showAuthPrompt,
    setShowAuthPrompt,
    authPromptDismissed,
    setAuthPromptDismissed,
    isMusicPlaying,
    setIsMusicPlaying
  };
}