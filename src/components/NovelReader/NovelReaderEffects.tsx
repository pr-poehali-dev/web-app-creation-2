import { useEffect, useRef } from 'react';
import { Novel, Episode, Paragraph } from '@/types/novel';
import { UserProfile } from '@/types/settings';

interface NovelReaderEffectsProps {
  currentEpisode: Episode;
  currentEpisodeId: string;
  currentParagraphIndex: number;
  currentParagraph: Paragraph;
  novel: Novel;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  backgroundImage: string | null;
  setBackgroundImage: (url: string | null) => void;
  setPreviousBackgroundImage: (url: string | null) => void;
  setIsBackgroundChanging: (value: boolean) => void;
  setNewImageReady: (value: boolean) => void;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  setSkipTyping: (value: boolean) => void;
  setCanNavigate: (value: boolean) => void;
  goToNextParagraph: () => void;
  goToPreviousParagraph: () => void;
  hasSubParagraphs?: boolean;
  isLastSubParagraph?: boolean;
  currentSubParagraphIndex?: number;
  goToNextSubParagraph?: () => boolean;
  goToPreviousSubParagraph?: () => boolean;
  setBackgroundObjectFit: (value: 'cover' | 'contain' | 'fill') => void;
  setBackgroundObjectPosition: (value: string) => void;
}

function NovelReaderEffects({
  currentEpisode,
  currentEpisodeId,
  currentParagraphIndex,
  currentParagraph,
  novel,
  onProfileUpdate,
  backgroundImage,
  setBackgroundImage,
  setPreviousBackgroundImage,
  setIsBackgroundChanging,
  setNewImageReady,
  isTyping,
  setIsTyping,
  setSkipTyping,
  setCanNavigate,
  goToNextParagraph,
  goToPreviousParagraph,
  hasSubParagraphs,
  isLastSubParagraph,
  currentSubParagraphIndex,
  goToNextSubParagraph,
  goToPreviousSubParagraph,
  setBackgroundObjectFit,
  setBackgroundObjectPosition
}: NovelReaderEffectsProps) {
  const previousEpisodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentEpisode) return;
    
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    
    let bgUrl: string | null = null;
    let bgObjectFit: 'cover' | 'contain' | 'fill' = 'cover';
    let bgObjectPosition = 'center';
    
    for (let i = currentParagraphIndex; i >= 0; i--) {
      const p = currentEpisode.paragraphs[i];
      if (p.type === 'background') {
        const selectedUrl = (isMobile && p.mobileUrl) ? p.mobileUrl : p.url;
        bgUrl = selectedUrl || null;
        bgObjectFit = p.objectFit || 'cover';
        bgObjectPosition = p.objectPosition || 'center';
        break;
      }
    }
    
    
    if (bgUrl !== backgroundImage) {
      console.log('[NovelReader] Background changing:', {
        from: backgroundImage,
        to: bgUrl,
        paragraphIndex: currentParagraphIndex,
        hasPrevious: !!backgroundImage
      });
      
      setBackgroundObjectFit(bgObjectFit);
      setBackgroundObjectPosition(bgObjectPosition);
      
      // Сохраняем текущий фон как предыдущий (не очищаем его, он перезапишется при следующем переходе)
      setPreviousBackgroundImage(backgroundImage);
      setBackgroundImage(bgUrl);
      setIsBackgroundChanging(true);
      setNewImageReady(false);
      
      // Даём браузеру 2 фрейма чтобы зафиксировать начальное состояние opacity: 0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log('[NovelReader] Background ready - starting transition');
          setNewImageReady(true);
        });
      });
      
      setTimeout(() => {
        console.log('[NovelReader] Background transition complete');
        setIsBackgroundChanging(false);
        // НЕ очищаем previousBackgroundImage - он нужен для следующего перехода!
      }, 2800);
    }
    
    previousEpisodeIdRef.current = currentEpisodeId;
  }, [currentEpisodeId, currentParagraphIndex, currentEpisode]);

  useEffect(() => {
    if (!isTyping) {
      const timer = setTimeout(() => setCanNavigate(true), 200);
      return () => clearTimeout(timer);
    } else {
      setCanNavigate(false);
    }
  }, [isTyping]);

  useEffect(() => {
    console.log('[NovelReader] Paragraph changed, type:', currentParagraph?.type, 'index:', currentParagraphIndex);
    if (currentParagraph?.type === 'text' || currentParagraph?.type === 'dialogue' || currentParagraph?.type === 'item') {
      console.log('[NovelReader] Text paragraph - immediately allow navigation');
      setIsTyping(false);
      setSkipTyping(false);
      setCanNavigate(true);
    } else {
      console.log('[NovelReader] Setting isTyping=false, canNavigate=true for non-typing paragraph');
      setIsTyping(false);
      setSkipTyping(false);
      setCanNavigate(true);
    }
  }, [currentEpisodeId, currentParagraphIndex, currentParagraph?.type]);

  useEffect(() => {
    if (currentParagraph?.type === 'background') {
      const timer = setTimeout(() => {
        goToNextParagraph();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [currentParagraph, goToNextParagraph]);

  useEffect(() => {
    if (currentParagraph?.type === 'dialogue') {
      onProfileUpdate(prev => {
        const characterExists = prev.metCharacters?.some(
          c => c.name === currentParagraph.characterName && c.episodeId === currentEpisodeId
        );
        if (!characterExists) {
          const libraryCharacter = novel.library.characters.find(
            c => c.name === currentParagraph.characterName
          );
          
          if (libraryCharacter?.isStoryCharacter === false) {
            return prev;
          }
          
          const defaultImage = libraryCharacter?.defaultImage || currentParagraph.characterImage;
          
          return {
            ...prev,
            metCharacters: [
              ...(prev.metCharacters || []),
              {
                id: `char${Date.now()}`,
                name: currentParagraph.characterName,
                image: defaultImage,
                episodeId: currentEpisodeId,
                firstMetAt: new Date().toISOString()
              }
            ]
          };
        }
        return prev;
      });
    }
  }, [currentParagraph?.type, currentParagraph?.characterName, currentEpisodeId, novel.library.characters, onProfileUpdate]);

  useEffect(() => {
    if (currentParagraph?.type === 'item') {
      const paragraphId = `${currentEpisodeId}-${currentParagraphIndex}`;
      
      onProfileUpdate(prev => {
        // Проверяем, был ли этот параграф уже обработан
        const wasProcessed = prev.readParagraphs?.includes(paragraphId);
        
        const itemType = currentParagraph.itemType || 'collectible';
        const action = currentParagraph.action || 'gain';
        
        if (itemType === 'collectible') {
          const itemExists = prev.collectedItems?.some(i => i.id === currentParagraph.id);
          if (!itemExists && action === 'gain') {
            return {
              ...prev,
              collectedItems: [
                ...(prev.collectedItems || []),
                {
                  id: currentParagraph.id,
                  name: currentParagraph.name,
                  description: currentParagraph.description,
                  imageUrl: currentParagraph.imageUrl,
                  episodeId: currentEpisodeId,
                  itemType: 'collectible'
                }
              ]
            };
          }
        } else {
          // Для сюжетных предметов
          const storyItemExists = prev.storyItems?.includes(currentParagraph.id);
          
          if (action === 'gain' && !storyItemExists) {
            // Добавляем предмет, если его нет
            const itemInCollection = prev.collectedItems?.some(i => i.id === currentParagraph.id);
            return {
              ...prev,
              storyItems: [...(prev.storyItems || []), currentParagraph.id],
              collectedItems: itemInCollection ? prev.collectedItems : [
                ...(prev.collectedItems || []),
                {
                  id: currentParagraph.id,
                  name: currentParagraph.name,
                  description: currentParagraph.description,
                  imageUrl: currentParagraph.imageUrl,
                  episodeId: currentEpisodeId,
                  itemType: 'story'
                }
              ]
            };
          } else if (action === 'lose' && storyItemExists) {
            // Удаляем из storyItems (но оставляем в collectedItems для истории)
            return {
              ...prev,
              storyItems: prev.storyItems?.filter(id => id !== currentParagraph.id) || []
            };
          }
        }
        
        return prev;
      });
    }
  }, [currentParagraph?.type, currentParagraph?.id, currentEpisodeId, currentParagraphIndex, onProfileUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentParagraph?.type !== 'choice') {
          // Если есть подпараграфы и мы не на последнем, переходим вперед по подпараграфам
          if (hasSubParagraphs && !isLastSubParagraph && goToNextSubParagraph) {
            const moved = goToNextSubParagraph();
            if (moved) return;
          }
          // Иначе переходим к следующему параграфу
          goToNextParagraph();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Если есть подпараграфы и мы не на первом, переходим назад по подпараграфам
        if (hasSubParagraphs && currentSubParagraphIndex !== undefined && currentSubParagraphIndex > 0 && goToPreviousSubParagraph) {
          goToPreviousSubParagraph();
        } else {
          goToPreviousParagraph();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, currentParagraph, goToNextParagraph, goToPreviousParagraph, hasSubParagraphs, isLastSubParagraph, currentSubParagraphIndex, goToNextSubParagraph, goToPreviousSubParagraph]);

  return null;
}

export default NovelReaderEffects;