import { useEffect, useState, useRef } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, Bookmark } from '@/types/settings';
import MusicPlayer from './MusicPlayer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNovelNavigation } from './NovelReader/useNovelNavigation';
import { useNovelInteraction } from './NovelReader/useNovelInteraction';
import NovelReaderContent from './NovelReader/NovelReaderContent';

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

  // Ключ для принудительного пересоздания компонентов при смене параграфа
  const paragraphKey = `${currentEpisodeId}-${currentParagraphIndex}`;
  
  // Временные состояния для typing и fading
  const [isTyping, setIsTyping] = useState(true);
  const [skipTyping, setSkipTyping] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [canNavigate, setCanNavigate] = useState(false);
  
  // Сохраняем отображаемый параграф для плавного fade
  const [displayParagraph, setDisplayParagraph] = useState(currentParagraph);
  
  // Фоновое изображение - находим последний background параграф до текущего
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (!currentEpisode) return;
    
    // Ищем последний background параграф до текущего индекса
    let bgUrl: string | null = null;
    for (let i = currentParagraphIndex; i >= 0; i--) {
      const p = currentEpisode.paragraphs[i];
      if (p.type === 'background') {
        bgUrl = p.url;
        break;
      }
    }
    
    if (bgUrl !== backgroundImage) {
      setBackgroundImage(bgUrl);
    }
  }, [currentEpisodeId, currentParagraphIndex, currentEpisode, backgroundImage]);
  
  // Ref для отслеживания актуального значения isTyping в callbacks
  const isTypingRef = useRef(isTyping);
  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  // Добавляем небольшую задержку после завершения печати перед навигацией
  useEffect(() => {
    if (!isTyping) {
      const timer = setTimeout(() => setCanNavigate(true), 200);
      return () => clearTimeout(timer);
    } else {
      setCanNavigate(false);
    }
  }, [isTyping]);

  // Обновляем displayParagraph только когда не в процессе fade
  useEffect(() => {
    if (!isFading) {
      console.log('[NovelReader] Paragraph changed, updating display and resetting isTyping');
      setDisplayParagraph(currentParagraph);
      setIsTyping(true);
      setSkipTyping(false);
      setCanNavigate(false);
    }
  }, [currentEpisodeId, currentParagraphIndex, currentParagraph, isFading]);

  // Хук навигации
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
    setIsFading,
    isGuest,
    onGuestLimitReached
  });

  // Хук взаимодействия (клики, свайпы, typing)
  const {
    handleClick,
    handleTypingComplete,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } = useNovelInteraction({
    currentParagraph,
    goToNextParagraph,
    goToPreviousParagraph,
    isTyping,
    isTypingRef,
    canNavigate,
    setIsTyping,
    setSkipTyping
  });
  
  // Авто-переход для background параграфов
  useEffect(() => {
    if (currentParagraph?.type === 'background' && !isFading) {
      const timer = setTimeout(() => {
        goToNextParagraph();
      }, 500); // Задержка на плавную смену фона
      return () => clearTimeout(timer);
    }
  }, [currentParagraph, isFading, goToNextParagraph]);

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

  // Сохранить персонажа при показе диалога
  useEffect(() => {
    if (currentParagraph?.type === 'dialogue') {
      onProfileUpdate(prev => {
        const characterExists = prev.metCharacters?.some(
          c => c.name === currentParagraph.characterName && c.episodeId === currentEpisodeId
        );
        if (!characterExists) {
          const libraryCharacter = novel.library.characters.find(
            c => c.name === currentParagraph.characterName
          );
          const defaultImage = libraryCharacter?.defaultImage || currentParagraph.characterImage;
          
          return {
            ...prev,
            metCharacters: [
              ...(prev.metCharacters || []),
              {
                id: `char${Date.now()}`,
                name: currentParagraph.characterName,
                image: defaultImage,
                episodeId: currentEpisodeId,
                firstMetAt: new Date().toISOString()
              }
            ]
          };
        }
        return prev;
      });
    }
  }, [currentParagraph?.type, currentParagraph?.characterName, currentEpisodeId, novel.library.characters, onProfileUpdate]);

  // Сохранить предмет при показе
  useEffect(() => {
    if (currentParagraph?.type === 'item') {
      onProfileUpdate(prev => {
        const itemExists = prev.collectedItems?.some(i => i.id === currentParagraph.id);
        if (!itemExists) {
          return {
            ...prev,
            collectedItems: [
              ...(prev.collectedItems || []),
              {
                id: currentParagraph.id,
                name: currentParagraph.name,
                description: currentParagraph.description,
                imageUrl: currentParagraph.imageUrl,
                episodeId: currentEpisodeId
              }
            ]
          };
        }
        return prev;
      });
    }
  }, [currentParagraph?.type, currentParagraph?.id, currentEpisodeId, onProfileUpdate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isTyping && currentParagraph?.type !== 'choice') {
          goToNextParagraph();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousParagraph();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, currentParagraph, goToNextParagraph, goToPreviousParagraph]);

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

  const fontClass = settings.fontFamily === 'merriweather' ? 'font-serif' :
                    settings.fontFamily === 'georgia' ? 'font-serif' :
                    settings.fontFamily === 'arial' ? 'font-sans' :
                    'font-sans';

  // Показываем приветствие только если showGreetingScreen === true
  const showGreeting = showGreetingScreen && novel.homePage?.greeting;

  return (
    <div 
      className={`min-h-screen flex ${showGreeting ? 'items-center' : 'items-end'} justify-center ${showGreeting ? '' : 'pb-1'} px-2 md:px-4 md:pr-32 md:pl-8 ${showGreeting ? '' : 'cursor-pointer'} relative bg-background`}
      onClick={showGreeting ? undefined : handleClick}
      onTouchStart={showGreeting ? undefined : onTouchStart}
      onTouchMove={showGreeting ? undefined : onTouchMove}
      onTouchEnd={showGreeting ? undefined : onTouchEnd}
      style={{
        fontFamily: settings.fontFamily === 'merriweather' ? '"Merriweather", serif' :
                    settings.fontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
                    settings.fontFamily === 'georgia' ? 'Georgia, serif' :
                    'Arial, sans-serif'
      }}
    >
      {/* Фоновое изображение с плавной сменой (только если не приветствие) */}
      {!showGreeting && backgroundImage && (
        <div 
          className="absolute top-16 left-4 right-4 bottom-4 md:left-8 md:right-8 bg-cover bg-center transition-opacity duration-500 rounded-2xl"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Слой затемнения чтобы не терять текст (только если не приветствие) */}
      {!showGreeting && backgroundImage && (
        <div className="absolute top-16 left-4 right-4 bottom-4 md:left-8 md:right-8 bg-black/20 rounded-2xl" />
      )}
      {/* Музыка запускается только когда эпизод открыт (не на экране приветствия) */}
      {!showGreeting && currentEpisode.backgroundMusic && (
        <MusicPlayer 
          audioSrc={currentEpisode.backgroundMusic} 
          volume={settings.musicVolume}
          isPlaying={isMusicPlaying}
          onToggle={onToggleMusic}
        />
      )}

      <div className={`w-full max-w-4xl relative z-10 ${showGreeting ? '' : 'mb-1'}`}>
        {/* Показываем либо приветствие (если showGreetingScreen), либо параграф */}
        {showGreeting ? (
          <div className="text-center animate-fade-in">
            <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
              {novel.homePage?.greetingImage && (
                <img 
                  src={novel.homePage.greetingImage} 
                  alt="Greeting" 
                  className="w-full max-w-md mx-auto mb-6 rounded-xl"
                />
              )}
              <h1 className="text-4xl font-bold mb-4 text-foreground">{novel.homePage.greeting}</h1>
              <p className="text-muted-foreground text-sm">Выберите эпизод в боковой панели для начала чтения</p>
            </div>
          </div>
        ) : (
          /* Отображаемый параграф (для плавного fade) */
          <>
            {currentParagraph.type !== 'background' && (
              <NovelReaderContent
                currentParagraph={displayParagraph}
                currentEpisode={currentEpisode}
                novel={novel}
                settings={settings}
                profile={profile}
                skipTyping={skipTyping}
                isFading={isFading}
                handleTypingComplete={handleTypingComplete}
                handleChoice={handleChoice}
                onProfileUpdate={onProfileUpdate}
                paragraphKey={paragraphKey}
              />
            )}
          </>
        )}

        {/* Навигация для мобильных (только если не приветствие) */}
        {!showGreeting && !isTyping && currentParagraph.type !== 'choice' && (
          <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-50">
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                goToPreviousParagraph();
              }}
              className="bg-card/90 backdrop-blur-sm shadow-xl"
            >
              <Icon name="ChevronLeft" size={24} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                goToNextParagraph();
              }}
              className="bg-card/90 backdrop-blur-sm shadow-xl"
            >
              <Icon name="ChevronRight" size={24} />
            </Button>
          </div>
        )}

        {/* Подсказка для десктопа */}
        {!isTyping && currentParagraph.type !== 'choice' && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground animate-pulse text-center px-4 cursor-help">
                Нажмите или → для продолжения
              </div>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Управление</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-foreground">• Клик или → - следующий параграф</p>
                <p className="text-foreground">• ← - предыдущий параграф</p>
                <p className="text-foreground">• Swipe влево/вправо - навигация</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default NovelReader;