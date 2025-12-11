import { useCallback } from 'react';
import { Episode, Paragraph, Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';

interface UseNovelNavigationProps {
  currentEpisodeId: string;
  currentParagraphIndex: number;
  currentEpisode: Episode | undefined;
  currentParagraph: Paragraph | undefined;
  profile: UserProfile;
  novel: Novel;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  setIsTyping: (value: boolean) => void;
  setSkipTyping: (value: boolean) => void;
  setIsFading: (value: boolean) => void;
  isGuest?: boolean;
  onGuestLimitReached?: () => void;
}

export function useNovelNavigation({
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
  isGuest = false,
  onGuestLimitReached
}: UseNovelNavigationProps) {
  // Проверка, доступен ли эпизод для гостей
  const isEpisodeAccessibleForGuest = (episodeId: string) => {
    const episode = novel.episodes.find(ep => ep.id === episodeId);
    if (!episode) return false;
    const episodeIndex = novel.episodes.findIndex(ep => ep.id === episodeId);
    return episodeIndex === 0 || episode.unlockedForAll;
  };
  // Проверка доступности параграфа
  const isParagraphAccessible = (episodeId: string, paragraphIndex: number) => {
    const paragraphId = `${episodeId}-${paragraphIndex}`;
    if (paragraphIndex === 0) return true;
    if (!profile.readParagraphs || !Array.isArray(profile.readParagraphs)) return false;
    
    // Если параграф уже был прочитан ранее, он всегда доступен
    if (profile.readParagraphs.includes(paragraphId)) return true;
    
    // Иначе проверяем, прочитан ли предыдущий параграф
    const prevParagraphId = `${episodeId}-${paragraphIndex - 1}`;
    return profile.readParagraphs.includes(prevParagraphId);
  };

  const goToNextParagraph = useCallback(() => {
    if (!currentEpisode) return;

    // Отмечаем текущий параграф как прочитанный
    const currentParagraphId = `${currentEpisodeId}-${currentParagraphIndex}`;
    onProfileUpdate(prev => {
      const readParagraphs = prev.readParagraphs || [];
      if (!readParagraphs.includes(currentParagraphId)) {
        return {
          ...prev,
          readParagraphs: [...readParagraphs, currentParagraphId]
        };
      }
      return prev;
    });

    const nextIndex = currentParagraphIndex + 1;

    if (nextIndex < currentEpisode.paragraphs.length) {
      // Запускаем анимацию растворения для текстовых параграфов
      if (currentParagraph?.type === 'text') {
        // Если у текущего параграфа установлен slowFade, делаем растворение медленнее
        const fadeDelay = currentParagraph.slowFade ? 1500 : 800;
        setIsFading(true);
        setTimeout(() => {
          onProfileUpdate(prev => ({
            ...prev,
            currentEpisodeId,
            currentParagraphIndex: nextIndex
          }));
          setIsTyping(true);
          setSkipTyping(false);
          // Сбрасываем fade только после смены параграфа
          setTimeout(() => {
            setIsFading(false);
          }, 50);
        }, fadeDelay);
      } else {
        onProfileUpdate(prev => ({
          ...prev,
          currentEpisodeId,
          currentParagraphIndex: nextIndex
        }));
        setIsTyping(true);
        setSkipTyping(false);
      }
    } else {
      // Переход к следующему эпизоду
      const nextEpisodeId = currentEpisode.nextEpisodeId;
      const nextParagraphIdx = currentEpisode.nextParagraphIndex || 0;
      
      // Если nextEpisodeId не указан, пробуем следующий по порядку
      let targetEpisodeId = nextEpisodeId;
      let targetParagraphIdx = nextParagraphIdx;
      
      if (!targetEpisodeId) {
        const currentIndex = novel.episodes.findIndex(ep => ep.id === currentEpisodeId);
        if (currentIndex >= 0 && currentIndex < novel.episodes.length - 1) {
          targetEpisodeId = novel.episodes[currentIndex + 1].id;
          targetParagraphIdx = 0;
        }
      }
      
      if (targetEpisodeId) {
        // Проверяем доступ для гостя
        if (isGuest && !isEpisodeAccessibleForGuest(targetEpisodeId)) {
          if (onGuestLimitReached) {
            onGuestLimitReached();
          }
          return;
        }

        if (currentParagraph?.type === 'text') {
          // Если у текущего параграфа установлен slowFade, делаем растворение медленнее
          const fadeDelay = currentParagraph.slowFade ? 1500 : 300;
          setIsFading(true);
          setTimeout(() => {
            onProfileUpdate(prev => ({
              ...prev,
              currentEpisodeId: targetEpisodeId,
              currentParagraphIndex: targetParagraphIdx
            }));
            setIsTyping(true);
            setSkipTyping(false);
            // Сбрасываем fade только после смены параграфа
            setTimeout(() => {
              setIsFading(false);
            }, 50);
          }, fadeDelay);
        } else {
          onProfileUpdate(prev => ({
            ...prev,
            currentEpisodeId: targetEpisodeId,
            currentParagraphIndex: targetParagraphIdx
          }));
          setIsTyping(true);
          setSkipTyping(false);
        }
      }
    }
  }, [currentEpisodeId, currentParagraphIndex, currentEpisode, currentParagraph, onProfileUpdate, setIsTyping, setSkipTyping, setIsFading]);

  const goToPreviousParagraph = useCallback(() => {
    if (currentParagraphIndex > 0) {
      const prevIndex = currentParagraphIndex - 1;
      
      if (prevIndex >= 0) {
        onProfileUpdate(prev => ({
          ...prev,
          currentEpisodeId,
          currentParagraphIndex: prevIndex
        }));
        setIsTyping(true);
        setSkipTyping(false);
        setIsFading(false);
      }
    }
  }, [currentParagraphIndex, currentEpisodeId, onProfileUpdate, setIsTyping, setSkipTyping, setIsFading]);

  const handleChoice = useCallback((choiceId: string, pathId: string | undefined, oneTime: boolean | undefined, nextEpisodeId?: string, nextParagraphIndex?: number) => {
    // Отмечаем выбор как использованный если он одноразовый
    if (oneTime) {
      onProfileUpdate(prev => {
        const usedChoices = prev.usedChoices || [];
        if (!usedChoices.includes(choiceId)) {
          return {
            ...prev,
            usedChoices: [...usedChoices, choiceId]
          };
        }
        return prev;
      });
    }

    // Активируем путь если указан
    if (pathId) {
      onProfileUpdate(prev => {
        const activePaths = prev.activePaths || [];
        if (!activePaths.includes(pathId)) {
          return {
            ...prev,
            activePaths: [...activePaths, pathId]
          };
        }
        return prev;
      });
    }

    if (nextEpisodeId) {
      // Проверяем доступ для гостя
      if (isGuest && !isEpisodeAccessibleForGuest(nextEpisodeId)) {
        if (onGuestLimitReached) {
          onGuestLimitReached();
        }
        return;
      }

      onProfileUpdate(prev => ({
        ...prev,
        currentEpisodeId: nextEpisodeId,
        currentParagraphIndex: nextParagraphIndex || 0
      }));
      setIsTyping(true);
      setSkipTyping(false);
    } else {
      goToNextParagraph();
    }
  }, [onProfileUpdate, goToNextParagraph, setIsTyping, setSkipTyping]);

  return {
    isParagraphAccessible,
    goToNextParagraph,
    goToPreviousParagraph,
    handleChoice
  };
}