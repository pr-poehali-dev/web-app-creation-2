import { useCallback } from 'react';
import { Paragraph } from '@/types/novel';

interface UseNovelInteractionProps {
  currentParagraph: Paragraph | undefined;
  goToNextParagraph: () => void;
  goToPreviousParagraph: () => void;
  isTyping: boolean;
  isTypingRef: React.MutableRefObject<boolean>;
  canNavigate: boolean;
  setIsTyping: (value: boolean) => void;
  setSkipTyping: (value: boolean) => void;
}

export function useNovelInteraction({
  currentParagraph,
  goToNextParagraph,
  isTypingRef,
  canNavigate,
  setIsTyping,
  setSkipTyping
}: UseNovelInteractionProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Игнорируем клики по кнопкам и интерактивным элементам
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }

    const currentIsTyping = isTypingRef.current;
    console.log('[Click] isTyping:', currentIsTyping, 'canNavigate:', canNavigate);
    if (currentIsTyping) {
      console.log('[Click] Skip typing - setting skipTyping=true');
      setSkipTyping(true);
    } else if (canNavigate) {
      console.log('[Click] Go to next paragraph');
      if (currentParagraph?.type !== 'choice') {
        goToNextParagraph();
      }
    }
  }, [isTypingRef, canNavigate, currentParagraph, goToNextParagraph, setSkipTyping]);

  const handleTypingComplete = useCallback(() => {
    console.log('[Interaction] Typing complete, setting isTyping to false');
    setIsTyping(false);
  }, [setIsTyping]);

  return {
    handleClick,
    handleTypingComplete
  };
}