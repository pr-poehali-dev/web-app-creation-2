import { useState, useCallback } from 'react';
import { Paragraph } from '@/types/novel';

interface UseNovelInteractionProps {
  currentParagraph: Paragraph | undefined;
  goToNextParagraph: () => void;
  goToPreviousParagraph: () => void;
  isTyping: boolean;
  isTypingRef: React.MutableRefObject<boolean>;
  setIsTyping: (value: boolean) => void;
  setSkipTyping: (value: boolean) => void;
}

export function useNovelInteraction({
  currentParagraph,
  goToNextParagraph,
  goToPreviousParagraph,
  isTyping,
  isTypingRef,
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
    console.log('[Click] isTyping:', currentIsTyping);
    if (currentIsTyping) {
      console.log('[Click] Skip typing - setting skipTyping=true');
      setSkipTyping(true);
      // НЕ устанавливаем setIsTyping(false) здесь - это сделает TypewriterText через onComplete
    } else {
      console.log('[Click] Go to next paragraph');
      if (currentParagraph?.type !== 'choice') {
        goToNextParagraph();
      }
    }
  }, [isTyping, currentParagraph, goToNextParagraph, setSkipTyping]);

  const handleTypingComplete = useCallback(() => {
    console.log('[Interaction] Typing complete, setting isTyping to false');
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

    console.log('[Touch] isTyping:', isTyping, 'distance:', distance, 'isSwipe:', isLeftSwipe || isRightSwipe);

    // Если движение было минимальным (тап)
    if (!isLeftSwipe && !isRightSwipe) {
      // Простое касание
      const currentIsTyping = isTypingRef.current;
      console.log('[Touch] Tap detected, isTyping:', currentIsTyping);
      if (currentIsTyping) {
        // Показать весь текст
        console.log('[Touch] Skip typing - setting skipTyping=true');
        setSkipTyping(true);
        // НЕ устанавливаем setIsTyping(false) здесь - это сделает TypewriterText через onComplete
      } else {
        // Текст уже полностью показан - переход к следующему
        console.log('[Touch] Go to next paragraph');
        if (currentParagraph?.type !== 'choice') {
          goToNextParagraph();
        }
      }
    } else {
      // Свайп
      const currentIsTyping = isTypingRef.current;
      console.log('[Touch] Swipe detected');
      if (isLeftSwipe && !currentIsTyping && currentParagraph?.type !== 'choice') {
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