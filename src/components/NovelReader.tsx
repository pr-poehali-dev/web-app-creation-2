import { useState, useEffect, useCallback } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, Bookmark } from '@/types/settings';
import TypewriterText from './TypewriterText';
import DialogueBox from './DialogueBox';
import ChoiceBox from './ChoiceBox';
import ItemBox from './ItemBox';
import ImageBox from './ImageBox';
import MusicPlayer from './MusicPlayer';
import BookmarkButton from './BookmarkButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface NovelReaderProps {
  novel: Novel;
  settings: UserSettings;
  profile: UserProfile;
  onUpdate: (novel: Novel) => void;
  onProfileUpdate: (profile: UserProfile) => void;
  currentEpisodeId: string;
  currentParagraphIndex: number;
}

function NovelReader({ novel, settings, profile, onUpdate, onProfileUpdate, currentEpisodeId, currentParagraphIndex }: NovelReaderProps) {
  const [isTyping, setIsTyping] = useState(true);
  const [skipTyping, setSkipTyping] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentEpisode = novel.episodes.find(ep => ep.id === currentEpisodeId);
  const currentParagraph = currentEpisode?.paragraphs[currentParagraphIndex];

  const existingBookmark = profile?.bookmarks?.find(
    b => b.episodeId === currentEpisodeId && b.paragraphIndex === currentParagraphIndex
  );

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

  const goToNextParagraph = useCallback(() => {
    if (!currentEpisode) return;

    // Сохранить предмет в коллекцию
    if (currentParagraph?.type === 'item' && profile) {
      const itemExists = profile.collectedItems?.some(i => i.id === currentParagraph.id);
      if (!itemExists) {
        onProfileUpdate({
          ...profile,
          collectedItems: [
            ...(profile.collectedItems || []),
            {
              id: currentParagraph.id,
              name: currentParagraph.name,
              description: currentParagraph.description,
              imageUrl: currentParagraph.imageUrl,
              episodeId: currentEpisodeId
            }
          ]
        });
      }
    }

    // Сохранить персонажа при встрече
    if (currentParagraph?.type === 'dialogue' && profile) {
      const characterExists = profile.metCharacters?.some(
        c => c.name === currentParagraph.characterName && c.episodeId === currentEpisodeId
      );
      if (!characterExists) {
        onProfileUpdate({
          ...profile,
          metCharacters: [
            ...(profile.metCharacters || []),
            {
              id: `char${Date.now()}`,
              name: currentParagraph.characterName,
              image: currentParagraph.characterImage,
              episodeId: currentEpisodeId,
              firstMetAt: new Date().toISOString()
            }
          ]
        });
      }
    }

    let nextIndex = currentParagraphIndex + 1;
    
    // Пропускаем fade параграфы
    while (nextIndex < currentEpisode.paragraphs.length && currentEpisode.paragraphs[nextIndex].type === 'fade') {
      nextIndex++;
    }

    if (nextIndex < currentEpisode.paragraphs.length) {
      // Если следующий параграф не fade, запускаем анимацию растворения
      if (currentParagraph?.type === 'text') {
        setIsFading(true);
        setTimeout(() => {
          onProfileUpdate({
            ...profile,
            currentEpisodeId,
            currentParagraphIndex: nextIndex
          });
          setIsTyping(true);
          setSkipTyping(false);
          setTimeout(() => {
            setIsFading(false);
          }, 50);
        }, 300);
      } else {
        onProfileUpdate({
          ...profile,
          currentEpisodeId,
          currentParagraphIndex: nextIndex
        });
        setIsTyping(true);
        setSkipTyping(false);
      }
    } else if (currentEpisode.nextEpisodeId) {
      // Переход к следующему эпизоду
      if (currentParagraph?.type === 'text') {
        setIsFading(true);
        setTimeout(() => {
          onProfileUpdate({
            ...profile,
            currentEpisodeId: currentEpisode.nextEpisodeId,
            currentParagraphIndex: currentEpisode.nextParagraphIndex || 0
          });
          setIsTyping(true);
          setSkipTyping(false);
          setTimeout(() => {
            setIsFading(false);
          }, 50);
        }, 300);
      } else {
        onProfileUpdate({
          ...profile,
          currentEpisodeId: currentEpisode.nextEpisodeId,
          currentParagraphIndex: currentEpisode.nextParagraphIndex || 0
        });
        setIsTyping(true);
        setSkipTyping(false);
      }
    }
  }, [currentEpisodeId, currentParagraphIndex, currentEpisode, currentParagraph, profile, onProfileUpdate]);

  const goToPreviousParagraph = useCallback(() => {
    if (currentParagraphIndex > 0) {
      let prevIndex = currentParagraphIndex - 1;
      
      // Пропускаем fade параграфы при движении назад
      while (prevIndex >= 0 && currentEpisode?.paragraphs[prevIndex].type === 'fade') {
        prevIndex--;
      }
      
      if (prevIndex >= 0) {
        onProfileUpdate({
          ...profile,
          currentEpisodeId,
          currentParagraphIndex: prevIndex
        });
        setIsTyping(true);
        setSkipTyping(false);
        setIsFading(false);
      }
    }
  }, [currentParagraphIndex, currentEpisode, currentEpisodeId, profile, onProfileUpdate]);

  const handleChoice = useCallback((nextEpisodeId?: string, nextParagraphIndex?: number) => {
    if (nextEpisodeId) {
      onProfileUpdate({
        ...profile,
        currentEpisodeId: nextEpisodeId,
        currentParagraphIndex: nextParagraphIndex || 0
      });
      setIsTyping(true);
      setSkipTyping(false);
    } else {
      goToNextParagraph();
    }
  }, [profile, onProfileUpdate, goToNextParagraph]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Игнорируем клики по кнопкам и интерактивным элементам
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }

    if (isTyping) {
      setSkipTyping(true);
      setIsTyping(false);
    } else {
      if (currentParagraph?.type !== 'choice') {
        goToNextParagraph();
      }
    }
  }, [isTyping, currentParagraph, goToNextParagraph]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    // Игнорируем касания кнопок и интерактивных элементов
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }
    
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isTyping && currentParagraph?.type !== 'choice') {
      goToNextParagraph();
    }
    
    if (isRightSwipe) {
      goToPreviousParagraph();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

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

  return (
    <div 
      className="min-h-screen bg-background flex items-start justify-center pt-16 md:pt-20 px-2 md:px-4 pb-32 md:pb-4 md:pr-32 md:pl-8 cursor-pointer"
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        fontFamily: settings.fontFamily === 'merriweather' ? '"Merriweather", serif' :
                    settings.fontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
                    settings.fontFamily === 'georgia' ? 'Georgia, serif' :
                    'Arial, sans-serif'
      }}
    >
      {currentEpisode.backgroundMusic && (
        <MusicPlayer audioSrc={currentEpisode.backgroundMusic} volume={settings.musicVolume} />
      )}

      <div className="w-full max-w-4xl">
        {/* Текущий параграф */}
        {currentParagraph.type === 'fade' ? null : currentParagraph.type === 'text' && (
          <div className={`leading-relaxed text-left text-foreground px-2 py-4 md:p-8 transition-opacity duration-300 ${
            isFading ? 'opacity-0' : 'opacity-100'
          } ${
            settings.textSize === 'small' ? 'text-base md:text-lg' :
            settings.textSize === 'large' ? 'text-xl md:text-2xl' :
            'text-lg md:text-xl'
          }`}>
            <TypewriterText 
              text={currentParagraph.content}
              speed={settings.textSpeed}
              skipTyping={skipTyping}
              onComplete={handleTypingComplete}
            />
          </div>
        )}

        {currentParagraph.type === 'dialogue' && (
          <DialogueBox
            characterName={currentParagraph.characterName}
            characterImage={currentParagraph.characterImage}
            text={currentParagraph.text}
            skipTyping={skipTyping}
            onComplete={handleTypingComplete}
            textSpeed={settings.textSpeed}
            existingComment={profile.metCharacters?.find(
              c => c.name === currentParagraph.characterName
            )?.comment}
            onCommentSave={(comment) => {
              const characterIndex = profile.metCharacters?.findIndex(
                c => c.name === currentParagraph.characterName
              );
              if (characterIndex !== undefined && characterIndex >= 0) {
                const updatedCharacters = [...(profile.metCharacters || [])];
                updatedCharacters[characterIndex] = {
                  ...updatedCharacters[characterIndex],
                  comment
                };
                onProfileUpdate({
                  ...profile,
                  metCharacters: updatedCharacters
                });
              }
            }}
          />
        )}

        {currentParagraph.type === 'choice' && (
          <ChoiceBox
            question={currentParagraph.question}
            options={currentParagraph.options}
            onChoice={handleChoice}
          />
        )}

        {currentParagraph.type === 'item' && (
          <ItemBox
            name={currentParagraph.name}
            description={currentParagraph.description}
            imageUrl={currentParagraph.imageUrl}
            skipTyping={skipTyping}
            onComplete={handleTypingComplete}
            textSpeed={settings.textSpeed}
          />
        )}

        {currentParagraph.type === 'image' && (
          <ImageBox
            url={currentParagraph.url}
            alt={currentParagraph.alt}
          />
        )}



        {/* Навигация для мобильных */}
        {!isTyping && currentParagraph.type !== 'choice' && (
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