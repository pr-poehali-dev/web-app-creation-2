import { useState, useEffect, useMemo, useRef, MutableRefObject } from 'react';
import { Novel, Episode, Paragraph } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import BackgroundImageLayer from './BackgroundImageLayer';
import BackgroundContentOverlay from './BackgroundContentOverlay';
import TextContentPanel from './TextContentPanel';

interface NovelReaderBackgroundNewProps {
  backgroundImage: string | null;
  previousBackgroundImage: string | null;
  newImageReady: boolean;
  isBackgroundChanging: boolean;
  currentParagraph: Paragraph;
  currentEpisode: Episode;
  currentParagraphIndex: number;
  isTyping: boolean;
  novel: Novel;
  settings: UserSettings;
  profile: UserProfile;
  skipTyping: boolean;
  handleTypingComplete: () => void;
  handleChoice: (choiceId: string, pathId: string | undefined, oneTime: boolean | undefined, nextEpisodeId?: string, nextParagraphIndex?: number) => void;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  paragraphKey: string;
  goToPreviousParagraph: () => void;
  goToNextParagraph: () => void;
  existingBookmark: any;
  handleAddBookmark: (comment: string) => void;
  handleRemoveBookmark: () => void;
  previousParagraph?: Paragraph;
  isContentHidden?: boolean;
  onToggleContentVisibility?: () => void;
  backgroundObjectFit: 'cover' | 'contain' | 'fill';
  backgroundObjectPosition: string;
  maxGroupIndexSeenRef: MutableRefObject<Map<string, number>>;
}

function NovelReaderBackgroundNew({
  backgroundImage,
  previousBackgroundImage,
  newImageReady,
  isBackgroundChanging,
  currentParagraph,
  currentEpisode,
  currentParagraphIndex,
  isTyping,
  novel,
  settings,
  profile,
  skipTyping,
  handleTypingComplete,
  handleChoice,
  onProfileUpdate,
  paragraphKey,
  goToPreviousParagraph,
  goToNextParagraph,
  previousParagraph,
  isContentHidden: externalIsContentHidden,
  onToggleContentVisibility,
  backgroundObjectFit,
  backgroundObjectPosition,
  maxGroupIndexSeenRef
}: NovelReaderBackgroundNewProps) {
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [wasHidden, setWasHidden] = useState(false);
  
  const actualIsContentHidden = externalIsContentHidden !== undefined ? externalIsContentHidden : isContentHidden;
  const [showComicFrames, setShowComicFrames] = useState(false);
  const [showImageFrames, setShowImageFrames] = useState(false);
  const previousParagraphKeyRef = useRef<string>(paragraphKey);
  

  
  useEffect(() => {
    setWasHidden(false);
    setIsContentHidden(false);
    
    const prevIndex = parseInt(previousParagraphKeyRef.current.split('-')[1]);
    const prevParagraph = currentEpisode.paragraphs[prevIndex];
    
    const isSameComicGroup = currentParagraph.comicGroupId && 
                       prevParagraph?.comicGroupId === currentParagraph.comicGroupId;
    
    const isSameImageGroup = currentParagraph.type === 'image' && 
                       currentParagraph.imageGroupId && 
                       prevParagraph?.type === 'image' &&
                       prevParagraph?.imageGroupId === currentParagraph.imageGroupId;
    
    console.log('[ShowFrames] Paragraph change:', {
      prev: previousParagraphKeyRef.current,
      current: paragraphKey,
      prevComicGroup: prevParagraph?.comicGroupId,
      currentComicGroup: currentParagraph.comicGroupId,
      prevImageGroup: prevParagraph?.type === 'image' ? prevParagraph.imageGroupId : undefined,
      currentImageGroup: currentParagraph.type === 'image' ? currentParagraph.imageGroupId : undefined,
      isSameComicGroup,
      isSameImageGroup
    });
    
    if (!isSameComicGroup) {
      setShowComicFrames(false);
      
      const timer = setTimeout(() => {
        if (!isBackgroundChanging) {
          setShowComicFrames(true);
        }
      }, 1300);
      
      previousParagraphKeyRef.current = paragraphKey;
      return () => clearTimeout(timer);
    } else {
      setShowComicFrames(true);
    }
    
    if (!isSameImageGroup) {
      setShowImageFrames(false);
      
      const timer = setTimeout(() => {
        if (!isBackgroundChanging) {
          setShowImageFrames(true);
        }
      }, 1300);
      
      previousParagraphKeyRef.current = paragraphKey;
      return () => clearTimeout(timer);
    } else {
      setShowImageFrames(true);
      previousParagraphKeyRef.current = paragraphKey;
    }
  }, [paragraphKey, currentParagraph.comicGroupId, currentParagraph.type, currentEpisode.paragraphs, isBackgroundChanging]);
  
  useEffect(() => {
    maxGroupIndexSeenRef.current.clear();
  }, [currentEpisode.id, maxGroupIndexSeenRef]);
  
  useEffect(() => {
    if (isBackgroundChanging) {
      setShowComicFrames(false);
      setShowImageFrames(false);
    } else {
      const timer = setTimeout(() => {
        setShowComicFrames(true);
        setShowImageFrames(true);
      }, 1300);
      
      return () => clearTimeout(timer);
    }
  }, [isBackgroundChanging]);
  
  const comicGroupData = useMemo(() => {
    if (!currentParagraph.comicGroupId) return null;
    
    const groupParagraphs = currentEpisode.paragraphs.filter(
      p => p.comicGroupId === currentParagraph.comicGroupId
    );
    
    const firstParagraph = groupParagraphs.find(p => p.comicGroupIndex === 0);
    if (!firstParagraph || !firstParagraph.comicFrames) return null;
    
    const currentGroupIndex = currentParagraph.comicGroupIndex || 0;
    const groupId = currentParagraph.comicGroupId;
    
    const prevMaxIndex = maxGroupIndexSeenRef.current.get(groupId) ?? -1;
    const newMaxIndex = Math.max(prevMaxIndex, currentGroupIndex);
    maxGroupIndexSeenRef.current.set(groupId, newMaxIndex);
    
    console.log('[ComicGroup] Group:', groupId, 'Current index:', currentGroupIndex, 'Max seen:', newMaxIndex);
    
    const framesWithVisibility = firstParagraph.comicFrames.map(frame => {
      const triggerIndex = frame.paragraphTrigger ?? 0;
      const isVisible = triggerIndex <= newMaxIndex;
      console.log('[ComicGroup] Frame:', frame.id, 'trigger:', triggerIndex, 'visible:', isVisible);
      return {
        ...frame,
        _isVisible: isVisible
      };
    });
    
    console.log('[ComicGroup] Total frames:', firstParagraph.comicFrames.length);
    
    return {
      frames: framesWithVisibility,
      layout: firstParagraph.frameLayout || 'horizontal-3' as const
    };
  }, [currentParagraph.comicGroupId, currentParagraph.comicGroupIndex, currentEpisode.paragraphs]);

  const imageGroupData = useMemo(() => {
    if (currentParagraph.type !== 'image' || !currentParagraph.imageGroupId) return null;
    
    const groupParagraphs = currentEpisode.paragraphs.filter(
      p => p.type === 'image' && p.imageGroupId === currentParagraph.imageGroupId
    );
    
    const firstParagraph = groupParagraphs.find(p => p.imageGroupIndex === 0);
    if (!firstParagraph || !firstParagraph.imageFrames) return null;
    
    const currentGroupIndex = currentParagraph.imageGroupIndex || 0;
    const groupId = currentParagraph.imageGroupId;
    
    const prevMaxIndex = maxGroupIndexSeenRef.current.get(`img-${groupId}`) ?? -1;
    const newMaxIndex = Math.max(prevMaxIndex, currentGroupIndex);
    maxGroupIndexSeenRef.current.set(`img-${groupId}`, newMaxIndex);
    
    console.log('[ImageGroup] Group:', groupId, 'Current index:', currentGroupIndex, 'Max seen:', newMaxIndex);
    
    const framesWithVisibility = firstParagraph.imageFrames.map(frame => {
      const triggerIndex = frame.paragraphTrigger ?? 0;
      const isVisible = triggerIndex <= newMaxIndex;
      console.log('[ImageGroup] Frame:', frame.id, 'trigger:', triggerIndex, 'visible:', isVisible);
      return {
        ...frame,
        _isVisible: isVisible
      };
    });
    
    console.log('[ImageGroup] Total frames:', firstParagraph.imageFrames.length);
    
    return {
      frames: framesWithVisibility,
      layout: firstParagraph.imageLayout || 'horizontal-3' as const
    };
  }, [currentParagraph.type, currentParagraph.imageGroupId, currentParagraph.imageGroupIndex, currentEpisode.paragraphs]);
  
  if (!backgroundImage) return null;

  const timeframes = currentParagraph.timeframes || currentEpisode.timeframes || ['present'];
  const isRetrospective = timeframes.includes('retrospective');
  const effectivePastelColor = currentParagraph.pastelColor || currentEpisode.pastelColor;

  const getPastelColor = (color?: string) => {
    const colors = {
      pink: 'rgba(255, 182, 193, 0.4)',
      blue: 'rgba(173, 216, 230, 0.4)',
      peach: 'rgba(255, 218, 185, 0.4)',
      lavender: 'rgba(221, 160, 221, 0.4)',
      mint: 'rgba(152, 255, 152, 0.4)',
      yellow: 'rgba(255, 255, 153, 0.4)',
      coral: 'rgba(255, 160, 122, 0.4)',
      sky: 'rgba(135, 206, 235, 0.4)'
    };
    return colors[color as keyof typeof colors] || colors.pink;
  };

  const getFilterStyle = (baseFilter: string) => {
    const contrastAmount = isRetrospective ? 0.95 : 1;
    const brightnessAmount = isRetrospective ? 1.05 : 1;
    const saturationAmount = isRetrospective ? 1.2 : 1;
    return `${baseFilter} contrast(${contrastAmount}) brightness(${brightnessAmount}) saturate(${saturationAmount})`;
  };

  const isFirstTextParagraph = currentParagraphIndex <= 1 && 
                                (currentParagraph.type === 'text' || 
                                 currentParagraph.type === 'dialogue' || 
                                 currentParagraph.type === 'choice');
  
  const wasBackgroundParagraph = previousParagraph?.type === 'background';
  
  const shouldShowContent = wasBackgroundParagraph 
    ? !isBackgroundChanging
    : (!isBackgroundChanging || isFirstTextParagraph);

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row overflow-hidden">
      <div className="h-[60vh] lg:h-screen lg:w-1/2 relative overflow-hidden flex-shrink-0">
        <BackgroundImageLayer
          backgroundImage={backgroundImage}
          previousBackgroundImage={previousBackgroundImage}
          backgroundObjectFit={backgroundObjectFit}
          backgroundObjectPosition={backgroundObjectPosition}
          isRetrospective={isRetrospective}
          effectivePastelColor={effectivePastelColor}
          getFilterStyle={getFilterStyle}
          getPastelColor={getPastelColor}
          transform={currentParagraph.type === 'background' ? currentParagraph.transform : undefined}
        />
        
        <BackgroundContentOverlay
          currentParagraph={currentParagraph}
          comicGroupData={comicGroupData}
          imageGroupData={imageGroupData}
          showComicFrames={showComicFrames}
          showImageFrames={showImageFrames}
          actualIsContentHidden={actualIsContentHidden}
          isTyping={isTyping}
          isRetrospective={isRetrospective}
          effectivePastelColor={effectivePastelColor}
          getFilterStyle={getFilterStyle}
        />
        
        <div className="absolute bottom-0 left-0 right-0 h-80 lg:h-full lg:top-0 lg:right-0 lg:left-auto lg:bottom-auto lg:w-64 pointer-events-none z-10">
          <div className="w-full h-full bg-gradient-to-b lg:bg-gradient-to-r from-transparent via-[#151d28]/50 to-[#151d28]" />
        </div>
      </div>

      <TextContentPanel
        currentParagraph={currentParagraph}
        currentEpisode={currentEpisode}
        currentParagraphIndex={currentParagraphIndex}
        novel={novel}
        settings={settings}
        profile={profile}
        skipTyping={skipTyping}
        wasHidden={wasHidden}
        handleTypingComplete={handleTypingComplete}
        handleChoice={handleChoice}
        onProfileUpdate={onProfileUpdate}
        paragraphKey={paragraphKey}
        previousParagraph={previousParagraph}
        goToPreviousParagraph={goToPreviousParagraph}
        goToNextParagraph={goToNextParagraph}
        actualIsContentHidden={actualIsContentHidden}
        setWasHidden={setWasHidden}
        onToggleContentVisibility={onToggleContentVisibility}
        setIsContentHidden={setIsContentHidden}
        isContentHidden={isContentHidden}
        shouldShowContent={shouldShowContent}
      />
    </div>
  );
}

export default NovelReaderBackgroundNew;