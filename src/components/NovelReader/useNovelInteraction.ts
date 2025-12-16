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

    console.log('[Click] isTyping:', isTyping, 'canNavigate:', canNavigate, 'paragraphType:', currentParagraph?.type, 'hasSubParagraphs:', hasSubParagraphs, 'isLastSubParagraph:', isLastSubParagraph);
    if (isTyping) {
      console.log('[Click] Skip typing - setting skipTyping=true');
      setSkipTyping(true);
    } else if (canNavigate) {
      if (currentParagraph?.type !== 'choice') {
        // Если есть подпараграфы, сначала переключаем их
        console.log('[Click] Checking sub-paragraphs: hasSubParagraphs=', hasSubParagraphs, '!isLastSubParagraph=', !isLastSubParagraph, 'goToNextSubParagraph=', !!goToNextSubParagraph);
        if (hasSubParagraphs && !isLastSubParagraph && goToNextSubParagraph) {
          const moved = goToNextSubParagraph();
          console.log('[Click] goToNextSubParagraph() returned:', moved);
          if (moved) {
            console.log('[Click] Go to next sub-paragraph');
            return;
          }
        }
        
        // Если подпараграфов нет или это последний, идем к следующему параграфу
        console.log('[Click] Go to next paragraph - calling goToNextParagraph()');
        goToNextParagraph();
      } else {
        console.log('[Click] Blocked - paragraph is choice type');
      }
    } else {
      console.log('[Click] Blocked - canNavigate is false');
    }
  }, [isTyping, canNavigate, currentParagraph, goToNextParagraph, setSkipTyping, hasSubParagraphs, isLastSubParagraph, goToNextSubParagraph]);

  const handleTypingComplete = useCallback(() => {
    console.log('[Interaction] Typing complete, setting isTyping to false');
    setIsTyping(false);
  }, [setIsTyping]);

  return {
    handleClick,
    handleTypingComplete
  };
}