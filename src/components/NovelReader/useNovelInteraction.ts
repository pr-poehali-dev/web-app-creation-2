import { useCallback } from 'react';
import { Paragraph } from '@/types/novel';

interface UseNovelInteractionProps {
  currentParagraph: Paragraph | undefined;
  goToNextParagraph: () => void;
  goToPreviousParagraph: () => void;
  isTyping: boolean;
  canNavigate: boolean;
  setIsTyping: (value: boolean) => void;
  setSkipTyping: (value: boolean) => void;
  hasSubParagraphs?: boolean;
  isLastSubParagraph?: boolean;
  goToNextSubParagraph?: () => boolean;
}

export function useNovelInteraction({
  currentParagraph,
  goToNextParagraph,
  isTyping,
  canNavigate,
  setIsTyping,
  setSkipTyping,
  hasSubParagraphs,
  isLastSubParagraph,
  goToNextSubParagraph
}: UseNovelInteractionProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Игнорируем клики по кнопкам и интерактивным элементам
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]') || target.closest('[role="dialog"]')) {
      console.log('[Click] Ignored - clicked on button, link or dialog');
      return;
    }

    if (isTyping) {
      setSkipTyping(true);
    } else if (canNavigate) {
      if (currentParagraph?.type !== 'choice') {
        // Если есть подпараграфы, сначала переключаем их
        if (hasSubParagraphs && !isLastSubParagraph && goToNextSubParagraph) {
          const moved = goToNextSubParagraph();
          if (moved) {
            return;
          }
        }
        
        // Если подпараграфов нет или это последний, идем к следующему параграфу
        goToNextParagraph();
      }
    }
  }, [isTyping, canNavigate, currentParagraph, goToNextParagraph, setSkipTyping, hasSubParagraphs, isLastSubParagraph, goToNextSubParagraph]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, [setIsTyping]);

  return {
    handleClick,
    handleTypingComplete
  };
}