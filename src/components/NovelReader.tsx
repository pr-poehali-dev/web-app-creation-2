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
  
  // Временные состояния для typing
  const [isTyping, setIsTyping] = useState(true);
  const [skipTyping, setSkipTyping] = useState(false);
  const [canNavigate, setCanNavigate] = useState(false);
  
  // Фоновое изображение - находим последний background параграф до текущего
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [previousBackgroundImage, setPreviousBackgroundImage] = useState<string | null>(null);
  const [isBackgroundChanging, setIsBackgroundChanging] = useState(false);
  const [newImageReady, setNewImageReady] = useState(false);
  const [pendingBackgroundUrl, setPendingBackgroundUrl] = useState<string | null>(null);
  
  // Ref для отслеживания предыдущего индекса - чтобы понять, клик или прыжок
  const previousParagraphIndexRef = useRef<number>(currentParagraphIndex);
  
  // Определяем какой фон должен быть для текущего параграфа
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
      setPreviousBackgroundImage(backgroundImage);
      setBackgroundImage(bgUrl);
      setIsBackgroundChanging(true);
      setNewImageReady(false);
      
      setTimeout(() => {
        setNewImageReady(true);
      }, 400);
      
      setTimeout(() => {
        setIsBackgroundChanging(false);
        setPreviousBackgroundImage(null);
      }, 2800);
    }
  }, [currentEpisodeId, currentParagraphIndex, currentEpisode]);
  
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

  // При смене параграфа обновляем состояния
  useEffect(() => {
    console.log('[NovelReader] Paragraph changed, type:', currentParagraph?.type, 'index:', currentParagraphIndex);
    // Для параграфов с печатным эффектом (text, dialogue, item)
    if (currentParagraph?.type === 'text' || currentParagraph?.type === 'dialogue' || currentParagraph?.type === 'item') {
      console.log('[NovelReader] Setting isTyping=true, skipTyping=false for typing paragraph');
      setIsTyping(true);
      setSkipTyping(false);
      setCanNavigate(false);
    } else {
      // Для картинок и фонов сразу ставим isTyping=false и разрешаем навигацию
      console.log('[NovelReader] Setting isTyping=false, canNavigate=true for non-typing paragraph');
      setIsTyping(false);
      setSkipTyping(false);
      setCanNavigate(true);
    }
  }, [currentEpisodeId, currentParagraphIndex, currentParagraph?.type]);



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
    isGuest,
    onGuestLimitReached
  });

  // Хук взаимодействия (клики, typing)
  const {
    handleClick,
    handleTypingComplete
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
  
  // Авто-переход только для background параграфов
  useEffect(() => {
    if (currentParagraph?.type === 'background') {
      const timer = setTimeout(() => {
        goToNextParagraph();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentParagraph, goToNextParagraph]);

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
          
          // Добавляем персонажа только если он сюжетный (или isStoryCharacter не указан)
          if (libraryCharacter?.isStoryCharacter === false) {
            return prev;
          }
          
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

  // Сохранить/удалить предмет при показе
  useEffect(() => {
    if (currentParagraph?.type === 'item') {
      onProfileUpdate(prev => {
        const itemType = currentParagraph.itemType || 'collectible';
        const action = currentParagraph.action || 'gain';
        
        if (itemType === 'collectible') {
          // Коллекционные предметы всегда добавляются (только gain)
          const itemExists = prev.collectedItems?.some(i => i.id === currentParagraph.id);
          if (!itemExists && action === 'gain') {
            return {
              ...prev,
              collectedItems: [
                ...(prev.collectedItems || []),
                {
                  id: currentParagraph.id,
                  name: currentParagraph.name,
                  description: currentParagraph.description,
                  imageUrl: currentParagraph.imageUrl,
                  episodeId: currentEpisodeId,
                  itemType: 'collectible'
                }
              ]
            };
          }
        } else {
          // Сюжетные предметы можно добавлять и удалять
          const storyItemExists = prev.storyItems?.includes(currentParagraph.id);
          
          if (action === 'gain' && !storyItemExists) {
            return {
              ...prev,
              storyItems: [...(prev.storyItems || []), currentParagraph.id],
              collectedItems: [
                ...(prev.collectedItems || []),
                {
                  id: currentParagraph.id,
                  name: currentParagraph.name,
                  description: currentParagraph.description,
                  imageUrl: currentParagraph.imageUrl,
                  episodeId: currentEpisodeId,
                  itemType: 'story'
                }
              ]
            };
          } else if (action === 'lose' && storyItemExists) {
            return {
              ...prev,
              storyItems: prev.storyItems.filter(id => id !== currentParagraph.id),
              collectedItems: prev.collectedItems.filter(i => i.id !== currentParagraph.id)
            };
          }
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
      className={`min-h-screen flex ${showGreeting ? 'items-center justify-center px-2 md:px-4 md:pr-32 md:pl-8' : ''} ${showGreeting ? '' : 'cursor-pointer'} relative bg-background`}
      onClick={showGreeting ? undefined : handleClick}
      style={{
        fontFamily: settings.fontFamily === 'merriweather' ? '"Merriweather", serif' :
                    settings.fontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
                    settings.fontFamily === 'georgia' ? 'Georgia, serif' :
                    'Arial, sans-serif'
      }}
    >
      {/* Музыка запускается только когда эпизод открыт (не на экране приветствия) */}
      {!showGreeting && currentEpisode.backgroundMusic && (
        <MusicPlayer 
          audioSrc={currentEpisode.backgroundMusic} 
          volume={settings.musicVolume}
          isPlaying={isMusicPlaying}
          onToggle={onToggleMusic}
        />
      )}

      {/* Фоновое изображение с контентом внутри (только если не приветствие) */}
      {!showGreeting && backgroundImage && (
        <div className="absolute top-20 left-4 right-4 bottom-4 md:top-20 md:left-8 md:right-32 rounded-2xl overflow-hidden">
          {/* Предыдущее фоновое изображение (исчезает с размытием) */}
          {previousBackgroundImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${previousBackgroundImage})`,
                opacity: newImageReady ? 0 : 1,
                filter: newImageReady ? 'blur(16px)' : 'blur(0px)',
                transition: 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out',
                zIndex: 1
              }}
            />
          )}
          
          {/* Новое фоновое изображение (появляется из размытия) */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              opacity: previousBackgroundImage && !newImageReady ? 0 : 1,
              filter: previousBackgroundImage && !newImageReady ? 'blur(16px)' : 'blur(0px)',
              transition: previousBackgroundImage ? 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out' : 'none',
              zIndex: 0
            }}
          />
          
          {/* Слой затемнения */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Контент внутри фона */}
          <div className="relative w-full h-full flex items-end justify-center pb-20 px-4 md:pb-8 md:px-6 md:pr-8">
            <div className="w-full max-w-4xl md:min-h-0 relative z-10">
              {/* Мобильные кнопки навигации */}
              {!isTyping && currentParagraph.type !== 'choice' && (
                <div className="md:hidden flex justify-between items-center mb-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPreviousParagraph();
                    }}
                    disabled={currentParagraphIndex === 0}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextParagraph();
                    }}
                    disabled={currentParagraphIndex === currentEpisode.paragraphs.length - 1}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </div>
              )}
              
              {/* Отображаемый параграф - скрываем на время смены фона */}
              {currentParagraph.type !== 'background' && !isBackgroundChanging && (
                <div className={currentParagraph.mergedWith ? "space-y-2 md:space-y-3 max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent" : ""}>
                  <NovelReaderContent
                    currentParagraph={currentParagraph}
                    currentEpisode={currentEpisode}
                    novel={novel}
                    settings={settings}
                    profile={profile}
                    skipTyping={skipTyping}
                    handleTypingComplete={handleTypingComplete}
                    handleChoice={handleChoice}
                    onProfileUpdate={onProfileUpdate}
                    paragraphKey={paragraphKey}
                    isTopMerged={!!currentParagraph.mergedWith}
                  />
                  {/* Объединённый параграф */}
                  {currentParagraph.mergedWith && currentEpisode.paragraphs[currentParagraphIndex + 1] && (
                    <NovelReaderContent
                      currentParagraph={currentEpisode.paragraphs[currentParagraphIndex + 1]}
                      currentEpisode={currentEpisode}
                      novel={novel}
                      settings={settings}
                      profile={profile}
                      skipTyping={skipTyping}
                      handleTypingComplete={() => {}}
                      handleChoice={handleChoice}
                      onProfileUpdate={onProfileUpdate}
                      paragraphKey={`${paragraphKey}-merged`}
                      isTopMerged={false}
                    />
                  )}
                </div>
              )}

              {/* Подсказка для десктопа */}
              {!isTyping && currentParagraph.type !== 'choice' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="hidden md:block absolute bottom-0 left-1/2 md:left-[calc(50%+2rem)] -translate-x-1/2 text-xs text-muted-foreground/70 animate-pulse text-center px-4 cursor-help pb-2">
                      Нажмите или → для продолжения
                    </div>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()} className="md:ml-16">
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
        </div>
      )}

      {/* Приветствие (показывается отдельно если showGreeting) */}
      {showGreeting && (
        <div className="w-full max-w-4xl relative z-10 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] pr-4">
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

          {/* Новости под приветствием */}
          {novel.homePage?.news && novel.homePage.news.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground text-center">Новости</h2>
              {novel.homePage.news.map((item) => (
                <div key={item.id} className="bg-card rounded-2xl p-6 shadow-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full rounded-lg mb-4" />
                  )}
                  <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  );
}

export default NovelReader;