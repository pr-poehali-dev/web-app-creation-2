import { useState, useEffect } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, defaultSettings, defaultProfile } from '@/types/settings';

export type View = 'home' | 'reader' | 'admin' | 'episodes' | 'profile' | 'settings';

export function useAppState() {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeView, setActiveView] = useState<View>('home');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [showParagraphsDialog, setShowParagraphsDialog] = useState(false);
  const [selectedEpisodeForParagraphs, setSelectedEpisodeForParagraphs] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
        setProfile(parsedProfile);
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
    adminPassword,
    setAdminPassword,
    showAdminButton,
    setShowAdminButton,
    showParagraphsDialog,
    setShowParagraphsDialog,
    selectedEpisodeForParagraphs,
    setSelectedEpisodeForParagraphs,
    showSidebar,
    setShowSidebar,
    isAdmin,
    setIsAdmin
  };
}
