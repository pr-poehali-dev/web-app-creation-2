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

interface NovelReaderProps {
  novel: Novel;
  settings: UserSettings;
  profile: UserProfile;
  onUpdate: (novel: Novel) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

function NovelReader({ novel, settings, profile, onUpdate, onProfileUpdate }: NovelReaderProps) {
  const [isTyping, setIsTyping] = useState(true);
  const [skipTyping, setSkipTyping] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentEpisode = novel.episodes.find(ep => ep.id === novel.currentEpisodeId);
  const currentParagraph = currentEpisode?.paragraphs[novel.currentParagraphIndex];

  const existingBookmark = profile?.bookmarks?.find(
    b => b.episodeId === novel.currentEpisodeId && b.paragraphIndex === novel.currentParagraphIndex
  );

  const handleAddBookmark = (comment: string) => {
    const newBookmark: Bookmark = {
      id: `bm${Date.now()}`,
      episodeId: novel.currentEpisodeId,
      paragraphIndex: novel.currentParagraphIndex,
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
              episodeId: novel.currentEpisodeId
            }
          ]
        });
      }
    }

    // Сохранить персонажа при встрече
    if (currentParagraph?.type === 'dialogue' && profile) {
      const characterExists = profile.metCharacters?.some(
        c => c.name === currentParagraph.characterName && c.episodeId === novel.currentEpisodeId
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
              episodeId: novel.currentEpisodeId,
              firstMetAt: new Date().toISOString()
            }
          ]
        });
      }
    }

    let nextIndex = novel.currentParagraphIndex + 1;
    
    // Пропускаем fade параграфы
    while (nextIndex < currentEpisode.paragraphs.length && currentEpisode.paragraphs[nextIndex].type === 'fade') {
      nextIndex++;
    }

    if (nextIndex < currentEpisode.paragraphs.length) {
      // Если следующий параграф не fade, запускаем анимацию растворения
      if (currentParagraph?.type === 'text') {
        setIsFading(true);
        setTimeout(() => {
          onUpdate({
            ...novel,
            currentParagraphIndex: nextIndex
          });
          setIsTyping(true);
          setSkipTyping(false);
          setTimeout(() => {
            setIsFading(false);
          }, 50);
        }, 300);
      } else {
        onUpdate({
          ...novel,
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
          onUpdate({
            ...novel,
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
        onUpdate({
          ...novel,
          currentEpisodeId: currentEpisode.nextEpisodeId,
          currentParagraphIndex: currentEpisode.nextParagraphIndex || 0
        });
        setIsTyping(true);
        setSkipTyping(false);
      }
    }
  }, [novel, currentEpisode, currentParagraph, profile, onUpdate, onProfileUpdate]);

  const goToPreviousParagraph = useCallback(() => {
    if (novel.currentParagraphIndex > 0) {
      let prevIndex = novel.currentParagraphIndex - 1;
      
      // Пропускаем fade параграфы при движении назад
      while (prevIndex >= 0 && currentEpisode?.paragraphs[prevIndex].type === 'fade') {
        prevIndex--;
      }
      
      if (prevIndex >= 0) {
        onUpdate({
          ...novel,
          currentParagraphIndex: prevIndex
        });
        setIsTyping(true);
        setSkipTyping(false);
        setIsFading(false);
      }
    }
  }, [novel, currentEpisode, onUpdate]);

  const handleChoice = useCallback((nextEpisodeId?: string, nextParagraphIndex?: number) => {
    if (nextEpisodeId) {
      onUpdate({
        ...novel,
        currentEpisodeId: nextEpisodeId,
        currentParagraphIndex: nextParagraphIndex || 0
      });
      setIsTyping(true);
      setSkipTyping(false);
    } else {
      goToNextParagraph();
    }
  }, [novel, onUpdate, goToNextParagraph]);

  const handleClick = useCallback(() => {
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
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isTyping && currentParagraph?.type !== 'choice') {
      goToNextParagraph();
    }
    
    if (isRightSwipe) {
      goToPreviousParagraph();
    }
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
      className="min-h-screen bg-background flex items-start justify-center pt-16 p-4 pr-32 md:pl-8 md:pr-8 cursor-pointer"
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
          <div className={`leading-relaxed text-left text-foreground p-4 pr-8 md:p-8 transition-opacity duration-300 ${
            isFading ? 'opacity-0' : 'opacity-100'
          } ${
            settings.textSize === 'small' ? 'text-lg md:text-xl' :
            settings.textSize === 'large' ? 'text-2xl md:text-3xl' :
            'text-xl md:text-2xl'
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



        {!isTyping && currentParagraph.type !== 'choice' && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs md:text-sm text-muted-foreground animate-pulse text-center px-4">
            Нажмите или → для продолжения
          </div>
        )}
      </div>
    </div>
  );
}

export default NovelReader;