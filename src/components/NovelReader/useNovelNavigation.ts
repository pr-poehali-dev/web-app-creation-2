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

    // Если текущий параграф объединён со следующим, пропускаем его
    let nextIndex = currentParagraphIndex + 1;
    if (currentParagraph?.mergedWith && nextIndex < currentEpisode.paragraphs.length) {
      nextIndex = currentParagraphIndex + 2;
    }

    if (nextIndex < currentEpisode.paragraphs.length) {
      // Переходим к следующему параграфу
      onProfileUpdate(prev => ({
        ...prev,
        currentEpisodeId,
        currentParagraphIndex: nextIndex
      }));
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

        // Переходим к следующему эпизоду
        onProfileUpdate(prev => ({
          ...prev,
          currentEpisodeId: targetEpisodeId,
          currentParagraphIndex: targetParagraphIdx
        }));
      }
    }
  }, [currentEpisodeId, currentParagraphIndex, currentEpisode, currentParagraph, onProfileUpdate, isGuest, onGuestLimitReached, novel]);

  const goToPreviousParagraph = useCallback(() => {
    if (!currentEpisode) return;
    if (currentParagraphIndex > 0) {
      let prevIndex = currentParagraphIndex - 1;
      
      // Если предыдущий параграф объединён с текущим, пропускаем его
      if (prevIndex > 0 && currentEpisode.paragraphs[prevIndex - 1]?.mergedWith === currentEpisode.paragraphs[prevIndex]?.id) {
        prevIndex = currentParagraphIndex - 2;
      }
      
      if (prevIndex >= 0) {
        onProfileUpdate(prev => ({
          ...prev,
          currentEpisodeId,
          currentParagraphIndex: prevIndex
        }));
      }
    }
  }, [currentParagraphIndex, currentEpisodeId, currentEpisode, onProfileUpdate]);

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

    // Добавляем выбор к пути и проверяем активацию (нужно 90% выборов)
    if (pathId) {
      onProfileUpdate(prev => {
        const pathChoices = prev.pathChoices || {};
        const currentChoices = pathChoices[pathId] || [];
        
        // Добавляем выбор если его ещё нет
        if (!currentChoices.includes(choiceId)) {
          const updatedChoices = [...currentChoices, choiceId];
          const updatedPathChoices = { ...pathChoices, [pathId]: updatedChoices };
          
          // Подсчитываем общее количество выборов активирующих этот путь
          let totalPathChoices = 0;
          novel.episodes.forEach(ep => {
            ep.paragraphs.forEach(para => {
              if (para.type === 'choice') {
                para.options.forEach(opt => {
                  if (opt.activatesPath === pathId) {
                    totalPathChoices++;
                  }
                });
              }
            });
          });
          
          // Проверяем достигнут ли порог в 90%
          const threshold = Math.ceil(totalPathChoices * 0.9);
          const activePaths = prev.activePaths || [];
          const shouldActivate = updatedChoices.length >= threshold && !activePaths.includes(pathId);
          
          console.log(`[Path ${pathId}] Choices: ${updatedChoices.length}/${totalPathChoices}, Threshold: ${threshold}, Should activate: ${shouldActivate}`);
          
          return {
            ...prev,
            pathChoices: updatedPathChoices,
            activePaths: shouldActivate ? [...activePaths, pathId] : activePaths
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
    } else {
      goToNextParagraph();
    }
  }, [onProfileUpdate, goToNextParagraph, isGuest, onGuestLimitReached, isEpisodeAccessibleForGuest]);

  return {
    isParagraphAccessible,
    goToNextParagraph,
    goToPreviousParagraph,
    handleChoice
  };
}