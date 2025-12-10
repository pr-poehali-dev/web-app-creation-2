import { useState, useCallback } from 'react';
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
  goToPreviousParagraph,
  isTyping,
  isTypingRef,
  canNavigate,
  setIsTyping,
  setSkipTyping
}: UseNovelInteractionProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Игнорируем клики по кнопкам и интерактивным элементам
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }

    const currentIsTyping = isTypingRef.current;
    if (currentIsTyping) {
      setSkipTyping(true);
    } else if (canNavigate) {
      if (currentParagraph?.type !== 'choice') {
        goToNextParagraph();
      }
    }
  }, [isTypingRef, canNavigate, currentParagraph, goToNextParagraph, setSkipTyping]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, [setIsTyping]);

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

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    // Проверяем, было ли движение
    const finalTouch = touchEnd !== null ? touchEnd : e.changedTouches[0].clientX;
    const distance = touchStart - finalTouch;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;



    // Если движение было минимальным (тап)
    if (!isLeftSwipe && !isRightSwipe) {
      const currentIsTyping = isTypingRef.current;
      if (currentIsTyping) {
        setSkipTyping(true);
      } else if (canNavigate) {
        if (currentParagraph?.type !== 'choice') {
          goToNextParagraph();
        }
      }
    } else {
      // Свайп
      const currentIsTyping = isTypingRef.current;
      if (isLeftSwipe && !currentIsTyping && canNavigate && currentParagraph?.type !== 'choice') {
        goToNextParagraph();
      }
      
      if (isRightSwipe) {
        goToPreviousParagraph();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return {
    handleClick,
    handleTypingComplete,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}