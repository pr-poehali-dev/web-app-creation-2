import { useState, useRef } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, Bookmark } from '@/types/settings';
import MusicPlayer from './MusicPlayer';
import { useNovelNavigation } from './NovelReader/useNovelNavigation';
import { useNovelInteraction } from './NovelReader/useNovelInteraction';
import { useSubParagraphNavigation } from './NovelReader/useSubParagraphNavigation';
import NovelReaderEffects from './NovelReader/NovelReaderEffects';
import NovelReaderBackgroundNew from './NovelReader/NovelReaderBackgroundNew';

interface NovelReaderProps {
  novel: Novel;
  settings: UserSettings;
  profile: UserProfile;
  onUpdate: (novel: Novel) => void;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  currentEpisodeId: string;
  currentParagraphIndex: number;
  isGuest?: boolean;
  isAdmin?: boolean;
  onGuestLimitReached?: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  isContentHidden?: boolean;
  onToggleContentVisibility?: () => void;
}

function NovelReader({ novel, settings, profile, onUpdate, onProfileUpdate, currentEpisodeId, currentParagraphIndex, isGuest = false, isAdmin = false, onGuestLimitReached, isMusicPlaying, onToggleMusic, isContentHidden, onToggleContentVisibility }: NovelReaderProps) {
  const currentEpisode = novel.episodes.find(ep => ep.id === currentEpisodeId);
  const currentParagraph = currentEpisode?.paragraphs[currentParagraphIndex];
  const previousParagraph = currentParagraphIndex > 0 ? currentEpisode?.paragraphs[currentParagraphIndex - 1] : undefined;

  const existingBookmark = profile?.bookmarks?.find(
    b => b.episodeId === currentEpisodeId && b.paragraphIndex === currentParagraphIndex
  );

  const paragraphKey = `${currentEpisodeId}-${currentParagraphIndex}`;
  
  const [isTyping, setIsTyping] = useState(true);
  const [skipTyping, setSkipTyping] = useState(false);
  const [canNavigate, setCanNavigate] = useState(false);
  
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [previousBackgroundImage, setPreviousBackgroundImage] = useState<string | null>(null);
  const [isBackgroundChanging, setIsBackgroundChanging] = useState(false);
  const [newImageReady, setNewImageReady] = useState(false);
  const [backgroundObjectFit, setBackgroundObjectFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [backgroundObjectPosition, setBackgroundObjectPosition] = useState<string>('center');
  
  const previousParagraphIndexRef = useRef<number>(currentParagraphIndex);
  
  // Отслеживаем максимальный индекс параграфа в комикс-группах для накопления фреймов
  const maxGroupIndexSeenRef = useRef<Map<string, number>>(new Map());

  const {
    isParagraphAccessible,
    goToNextParagraph,
    goToPreviousParagraph,
    handleChoice
  } = useNovelNavigation({
    currentEpisodeId,
    currentParagraphIndex,
    currentEpisode,
    currentParagraph,
    profile,
    novel,
    onProfileUpdate,
    setIsTyping,
    setSkipTyping,
    isGuest,
    isAdmin,
    onGuestLimitReached
  });

  const {
    currentSubParagraphIndex,
    setCurrentSubParagraphIndex,
    hasSubParagraphs,
    isLastSubParagraph,
    goToNextSubParagraph,
    goToPreviousSubParagraph
  } = useSubParagraphNavigation({
    currentParagraph,
    paragraphKey,
    profile,
    onProfileUpdate
  });

  const {
    handleClick,
    handleTypingComplete
  } = useNovelInteraction({
    currentParagraph,
    goToNextParagraph,
    goToPreviousParagraph,
    isTyping,
    canNavigate,
    setIsTyping,
    setSkipTyping,
    hasSubParagraphs,
    isLastSubParagraph,
    goToNextSubParagraph
  });

  const handleAddBookmark = (comment: string) => {
    const newBookmark: Bookmark = {
      id: `bm${Date.now()}`,
      episodeId: currentEpisodeId,
      paragraphIndex: currentParagraphIndex,
      comment,
      createdAt: new Date().toISOString()
    };

    const updatedBookmarks = existingBookmark
      ? profile.bookmarks.map(b => b.id === existingBookmark.id ? { ...b, comment } : b)
      : [...profile.bookmarks, newBookmark];

    onProfileUpdate({
      ...profile,
      bookmarks: updatedBookmarks
    });
  };

  const handleRemoveBookmark = () => {
    onProfileUpdate({
      ...profile,
      bookmarks: profile.bookmarks.filter(b => b.id !== existingBookmark?.id)
    });
  };

  if (!currentEpisode || !currentParagraph) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Эпизод не найден</h2>
          <p className="text-muted-foreground">Проверьте структуру новеллы</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex cursor-pointer relative bg-background"
      onClick={handleClick}
      style={{
        fontFamily: settings.fontFamily === 'merriweather' ? '"Merriweather", serif' :
                    settings.fontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
                    settings.fontFamily === 'georgia' ? 'Georgia, serif' :
                    'Arial, sans-serif'
      }}
    >
      <NovelReaderEffects
        currentEpisode={currentEpisode}
        currentEpisodeId={currentEpisodeId}
        currentParagraphIndex={currentParagraphIndex}
        currentParagraph={currentParagraph}
        novel={novel}
        onProfileUpdate={onProfileUpdate}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        setPreviousBackgroundImage={setPreviousBackgroundImage}
        setIsBackgroundChanging={setIsBackgroundChanging}
        setNewImageReady={setNewImageReady}
        isTyping={isTyping}
        setIsTyping={setIsTyping}
        setSkipTyping={setSkipTyping}
        setCanNavigate={setCanNavigate}
        goToNextParagraph={goToNextParagraph}
        goToPreviousParagraph={goToPreviousParagraph}
        hasSubParagraphs={hasSubParagraphs}
        isLastSubParagraph={isLastSubParagraph}
        currentSubParagraphIndex={currentSubParagraphIndex}
        goToNextSubParagraph={goToNextSubParagraph}
        goToPreviousSubParagraph={goToPreviousSubParagraph}
        setBackgroundObjectFit={setBackgroundObjectFit}
        setBackgroundObjectPosition={setBackgroundObjectPosition}
      />

      {currentEpisode.backgroundMusic && (
        <MusicPlayer 
          audioSrc={currentEpisode.backgroundMusic} 
          volume={settings.musicVolume}
          isPlaying={isMusicPlaying}
          onToggle={onToggleMusic}
        />
      )}

      <NovelReaderBackgroundNew
          backgroundImage={backgroundImage}
          previousBackgroundImage={previousBackgroundImage}
          newImageReady={newImageReady}
          isBackgroundChanging={isBackgroundChanging}
          currentParagraph={currentParagraph}
          currentEpisode={currentEpisode}
          currentParagraphIndex={currentParagraphIndex}
          isTyping={isTyping}
          novel={novel}
          settings={settings}
          profile={profile}
          skipTyping={skipTyping}
          handleTypingComplete={handleTypingComplete}
          handleChoice={handleChoice}
          onProfileUpdate={onProfileUpdate}
          paragraphKey={paragraphKey}
          goToPreviousParagraph={goToPreviousParagraph}
          goToNextParagraph={goToNextParagraph}
          existingBookmark={existingBookmark}
          currentSubParagraphIndex={currentSubParagraphIndex}
          backgroundObjectFit={backgroundObjectFit}
          backgroundObjectPosition={backgroundObjectPosition}
          setCurrentSubParagraphIndex={setCurrentSubParagraphIndex}
          goToNextSubParagraph={goToNextSubParagraph}
          goToPreviousSubParagraph={goToPreviousSubParagraph}
          handleAddBookmark={handleAddBookmark}
          handleRemoveBookmark={handleRemoveBookmark}
          previousParagraph={previousParagraph}
          isContentHidden={isContentHidden}
          onToggleContentVisibility={onToggleContentVisibility}
          maxGroupIndexSeenRef={maxGroupIndexSeenRef}
        />
    </div>
  );
}

export default NovelReader;