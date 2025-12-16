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
  goToPreviousParagraph
}: NovelReaderEffectsProps) {
  const previousEpisodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentEpisode) return;
    
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    
    let bgUrl: string | null = null;
    for (let i = currentParagraphIndex; i >= 0; i--) {
      const p = currentEpisode.paragraphs[i];
      if (p.type === 'background') {
        const selectedUrl = (isMobile && p.mobileUrl) ? p.mobileUrl : p.url;
        bgUrl = selectedUrl || null;
        break;
      }
    }
    
    
    if (bgUrl !== backgroundImage) {
      const episodeChanged = previousEpisodeIdRef.current !== null && previousEpisodeIdRef.current !== currentEpisodeId;
      const isFirstParagraph = currentParagraphIndex === 0;
      
      if (episodeChanged && !isFirstParagraph) {
        setBackgroundImage(bgUrl);
        setPreviousBackgroundImage(null);
        setIsBackgroundChanging(false);
        setNewImageReady(true);
      } else {
        setPreviousBackgroundImage(backgroundImage);
        setBackgroundImage(bgUrl);
        setIsBackgroundChanging(true);
        setNewImageReady(false);
        
        setTimeout(() => {
          setNewImageReady(true);
        }, 400);
        
        setTimeout(() => {
          setIsBackgroundChanging(false);
          setPreviousBackgroundImage(null);
        }, 2800);
      }
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
      }, 500);
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
        if (!isTyping && currentParagraph?.type !== 'choice') {
          goToNextParagraph();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousParagraph();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, currentParagraph, goToNextParagraph, goToPreviousParagraph]);

  return null;
}

export default NovelReaderEffects;