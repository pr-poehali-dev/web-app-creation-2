import { useState, useEffect } from 'react';
import { Paragraph } from '@/types/novel';
import { UserProfile } from '@/types/settings';

interface UseSubParagraphNavigationProps {
  currentParagraph: Paragraph | undefined;
  paragraphKey: string;
  profile?: UserProfile;
  onProfileUpdate?: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
}

export function useSubParagraphNavigation({
  currentParagraph,
  paragraphKey,
  profile,
  onProfileUpdate
}: UseSubParagraphNavigationProps) {
  const [currentSubParagraphIndex, setCurrentSubParagraphIndex] = useState(profile?.currentSubParagraphIndex || 0);

  useEffect(() => {
    // При смене параграфа восстанавливаем индекс из профиля или сбрасываем в 0
    const initialIndex = profile?.currentSubParagraphIndex || 0;
    setCurrentSubParagraphIndex(initialIndex);
  }, [paragraphKey, profile?.currentSubParagraphIndex]);

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
    // Проверяем, что следующий индекс не выйдет за границы
    if (currentSubParagraphIndex < subParagraphsCount) {
      const newIndex = currentSubParagraphIndex + 1;
      setCurrentSubParagraphIndex(newIndex);
      
      // Сохраняем в профиль если доступно
      if (onProfileUpdate) {
        onProfileUpdate(prev => ({
          ...prev,
          currentSubParagraphIndex: newIndex
        }));
      }
      
      return true;
    }
    return false;
  };

  const goToPreviousSubParagraph = () => {
    if (!isFirstSubParagraph) {
      const newIndex = currentSubParagraphIndex - 1;
      setCurrentSubParagraphIndex(newIndex);
      
      // Сохраняем в профиль если доступно
      if (onProfileUpdate) {
        onProfileUpdate(prev => ({
          ...prev,
          currentSubParagraphIndex: newIndex
        }));
      }
      
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