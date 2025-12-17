import { useCallback } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import { View } from './useAppState';

interface UseAppHandlersProps {
  novel: Novel | null;
  profile: UserProfile;
  setProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  setSettings: (settings: UserSettings) => void;
  setNovel: (novel: Novel) => void;
  setNovelForSaving: (novel: Novel) => void;
  setActiveView: (view: View) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setSelectedEpisodeForParagraphs: (episodeId: string | null) => void;
  setShowParagraphsDialog: (show: boolean) => void;
}

export function useAppHandlers({
  novel,
  profile,
  setProfile,
  setSettings,
  setNovel,
  setNovelForSaving,
  setActiveView,
  setIsAdmin,
  setSelectedEpisodeForParagraphs,
  setShowParagraphsDialog
}: UseAppHandlersProps) {
  const handleNovelUpdate = useCallback((updatedNovel: Novel) => {
    setNovel(updatedNovel);
    setNovelForSaving(updatedNovel);
  }, [setNovel, setNovelForSaving]);

  const handleSettingsUpdate = useCallback((updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
  }, [setSettings]);

  const handleProfileUpdate = useCallback((updatedProfile: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    if (typeof updatedProfile === 'function') {
      setProfile(updatedProfile);
    } else {
      setProfile(updatedProfile);
    }
  }, [setProfile]);

  const handleAdminLogin = useCallback(() => {
    setIsAdmin(true);
    setActiveView('admin');
  }, [setIsAdmin, setActiveView]);

  const handleEpisodeSelect = useCallback((episodeId: string, paragraphIndex?: number, subParagraphIndex?: number) => {
    setProfile(prev => ({
      ...prev,
      currentEpisodeId: episodeId,
      currentParagraphIndex: paragraphIndex !== undefined ? paragraphIndex : 0,
      currentSubParagraphIndex: subParagraphIndex !== undefined ? subParagraphIndex : 0
    }));
    setActiveView('reader');
  }, [setProfile, setActiveView]);

  const handleNavigateToBookmark = useCallback((episodeId: string, paragraphIndex: number) => {
    setProfile(prev => ({
      ...prev,
      currentEpisodeId: episodeId,
      currentParagraphIndex: paragraphIndex
    }));
    setActiveView('reader');
  }, [setProfile, setActiveView]);

  const handleShowParagraphs = useCallback((episodeId: string) => {
    setSelectedEpisodeForParagraphs(episodeId);
    setShowParagraphsDialog(true);
  }, [setSelectedEpisodeForParagraphs, setShowParagraphsDialog]);

  const handleAddBookmark = useCallback((comment: string) => {
    setProfile(prev => {
      if (!novel) return prev;
      const currentEpisode = novel.episodes.find(ep => ep.id === prev.currentEpisodeId);
      if (!currentEpisode) return prev;

      const existingBookmark = prev.bookmarks.find(
        b => b.episodeId === prev.currentEpisodeId && b.paragraphIndex === prev.currentParagraphIndex
      );

      const newBookmark = {
        id: existingBookmark?.id || `bm${Date.now()}`,
        episodeId: prev.currentEpisodeId,
        paragraphIndex: prev.currentParagraphIndex,
        comment,
        createdAt: existingBookmark?.createdAt || new Date().toISOString()
      };

      const updatedBookmarks = existingBookmark
        ? prev.bookmarks.map(b => b.id === existingBookmark.id ? newBookmark : b)
        : [...prev.bookmarks, newBookmark];

      return {
        ...prev,
        bookmarks: updatedBookmarks
      };
    });
  }, [novel, setProfile]);

  const handleRemoveBookmark = useCallback(() => {
    setProfile(prev => {
      const existingBookmark = prev.bookmarks.find(
        b => b.episodeId === prev.currentEpisodeId && b.paragraphIndex === prev.currentParagraphIndex
      );

      if (!existingBookmark) return prev;

      return {
        ...prev,
        bookmarks: prev.bookmarks.filter(b => b.id !== existingBookmark.id)
      };
    });
  }, [setProfile]);

  return {
    handleNovelUpdate,
    handleSettingsUpdate,
    handleProfileUpdate,
    handleAdminLogin,
    handleEpisodeSelect,
    handleNavigateToBookmark,
    handleShowParagraphs,
    handleAddBookmark,
    handleRemoveBookmark
  };
}