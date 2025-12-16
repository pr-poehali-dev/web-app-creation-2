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

  const isLastSubParagraph = currentSubParagraphIndex >= subParagraphsCount - 1;
  const isFirstSubParagraph = currentSubParagraphIndex === 0;

  const goToNextSubParagraph = () => {
    if (!isLastSubParagraph) {
      setCurrentSubParagraphIndex(prev => prev + 1);
      return true;
    }
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
