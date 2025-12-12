import { useState, useRef } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, Bookmark } from '@/types/settings';
import MusicPlayer from './MusicPlayer';
import { useNovelNavigation } from './NovelReader/useNovelNavigation';
import { useNovelInteraction } from './NovelReader/useNovelInteraction';
import NovelReaderEffects from './NovelReader/NovelReaderEffects';
import NovelReaderBackground from './NovelReader/NovelReaderBackground';
import NovelReaderGreeting from './NovelReader/NovelReaderGreeting';

interface NovelReaderProps {
  novel: Novel;
  settings: UserSettings;
  profile: UserProfile;
  onUpdate: (novel: Novel) => void;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  currentEpisodeId: string;
  currentParagraphIndex: number;
  showGreetingScreen?: boolean;
  isGuest?: boolean;
  onGuestLimitReached?: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

function NovelReader({ novel, settings, profile, onUpdate, onProfileUpdate, currentEpisodeId, currentParagraphIndex, showGreetingScreen = false, isGuest = false, onGuestLimitReached, isMusicPlaying, onToggleMusic }: NovelReaderProps) {
  const currentEpisode = novel.episodes.find(ep => ep.id === currentEpisodeId);
  const currentParagraph = currentEpisode?.paragraphs[currentParagraphIndex];

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
  
  const previousParagraphIndexRef = useRef<number>(currentParagraphIndex);

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
    onGuestLimitReached
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
    setSkipTyping
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

  const showGreeting = showGreetingScreen && novel.homePage?.greeting;

  return (
    <div 
      className={`min-h-screen flex ${showGreeting ? 'items-center justify-center px-2 md:px-4 md:pr-32 md:pl-8' : ''} ${showGreeting ? '' : 'cursor-pointer'} relative bg-background`}
      onClick={showGreeting ? undefined : handleClick}
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
      />

      {!showGreeting && currentEpisode.backgroundMusic && (
        <MusicPlayer 
          audioSrc={currentEpisode.backgroundMusic} 
          volume={settings.musicVolume}
          isPlaying={isMusicPlaying}
          onToggle={onToggleMusic}
        />
      )}

      {!showGreeting && (
        <NovelReaderBackground
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
          handleAddBookmark={handleAddBookmark}
          handleRemoveBookmark={handleRemoveBookmark}
        />
      )}

      {showGreeting && (
        <NovelReaderGreeting novel={novel} />
      )}
    </div>
  );
}

export default NovelReader;