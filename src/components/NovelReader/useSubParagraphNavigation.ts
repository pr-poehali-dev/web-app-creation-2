import { useState, useEffect } from 'react';
import { Paragraph } from '@/types/novel';

interface UseSubParagraphNavigationProps {
  currentParagraph: Paragraph | undefined;
  paragraphKey: string;
}

export function useSubParagraphNavigation({
  currentParagraph,
  paragraphKey
}: UseSubParagraphNavigationProps) {
  const [currentSubParagraphIndex, setCurrentSubParagraphIndex] = useState(0);

  useEffect(() => {
    setCurrentSubParagraphIndex(0);
  }, [paragraphKey]);

  const hasSubParagraphs = 
    currentParagraph && 
    (currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') &&
    currentParagraph.subParagraphs &&
    currentParagraph.subParagraphs.length > 0;

  const subParagraphsCount = hasSubParagraphs 
    ? (currentParagraph.type === 'text' || currentParagraph.type === 'dialogue' 
        ? currentParagraph.subParagraphs!.length 
        : 0)
    : 0;

  // Индекс 0 = основной текст, индексы 1..N = подпараграфы 0..(N-1)
  // Последний индекс = subParagraphsCount (показываем подпараграф N-1)
  // isLastSubParagraph должен быть true когда мы показываем последний подпараграф
  const isLastSubParagraph = currentSubParagraphIndex === subParagraphsCount;
  const isFirstSubParagraph = currentSubParagraphIndex === 0;

  const goToNextSubParagraph = () => {
    console.log('[SubParagraph] goToNextSubParagraph - current index:', currentSubParagraphIndex, 'count:', subParagraphsCount);
    // Проверяем, что следующий индекс не выйдет за границы
    if (currentSubParagraphIndex < subParagraphsCount) {
      console.log('[SubParagraph] Incrementing index from', currentSubParagraphIndex, 'to', currentSubParagraphIndex + 1);
      setCurrentSubParagraphIndex(prev => prev + 1);
      return true;
    }
    console.log('[SubParagraph] Cannot increment - already at or past last subparagraph');
    return false;
  };

  const goToPreviousSubParagraph = () => {
    if (!isFirstSubParagraph) {
      setCurrentSubParagraphIndex(prev => prev - 1);
      return true;
    }
    return false;
  };

  return {
    currentSubParagraphIndex,
    setCurrentSubParagraphIndex,
    hasSubParagraphs,
    subParagraphsCount,
    isLastSubParagraph,
    isFirstSubParagraph,
    goToNextSubParagraph,
    goToPreviousSubParagraph
  };
}