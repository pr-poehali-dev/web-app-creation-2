import { useState, useCallback } from 'react';
import { Paragraph } from '@/types/novel';

interface UseNovelInteractionProps {
  currentParagraph: Paragraph | undefined;
  goToNextParagraph: () => void;
  goToPreviousParagraph: () => void;
}

export function useNovelInteraction({
  currentParagraph,
  goToNextParagraph,
  goToPreviousParagraph
}: UseNovelInteractionProps) {
  const [isTyping, setIsTyping] = useState(true);
  const [skipTyping, setSkipTyping] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
    if (!touchStart) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    // Если touchEnd не установлен, это простое касание (тап), а не свайп
    if (!touchEnd) {
      // Простое касание - показать весь текст или перелистнуть
      if (isTyping) {
        setSkipTyping(true);
        setIsTyping(false);
      } else {
        if (currentParagraph?.type !== 'choice') {
          goToNextParagraph();
        }
      }
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

  return {
    isTyping,
    setIsTyping,
    skipTyping,
    setSkipTyping,
    isFading,
    setIsFading,
    handleClick,
    handleTypingComplete,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}