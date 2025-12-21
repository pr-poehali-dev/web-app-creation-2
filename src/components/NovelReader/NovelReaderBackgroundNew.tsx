import { useState, useEffect, useMemo, useRef, MutableRefObject } from 'react';
import { Novel, Episode, Paragraph, TextParagraph, DialogueParagraph, ComicParagraph } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import NovelReaderContent from './NovelReaderContent';
import ComicFrameReader from './ComicFrameReader';
import TypewriterText from '../TypewriterText';

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
  currentSubParagraphIndex: number;
  setCurrentSubParagraphIndex: (index: number) => void;
  goToNextSubParagraph: () => boolean;
  goToPreviousSubParagraph: () => boolean;
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
  currentSubParagraphIndex,
  setCurrentSubParagraphIndex,
  goToNextSubParagraph,
  goToPreviousSubParagraph,
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
  const previousParagraphKeyRef = useRef<string>(paragraphKey);
  
  // Проверяем, меняется ли комикс-группа при смене параграфа
  useEffect(() => {
    setWasHidden(false);
    setIsContentHidden(false);
    
    // Получаем предыдущий параграф из episode
    const prevIndex = parseInt(previousParagraphKeyRef.current.split('-')[1]);
    const prevParagraph = currentEpisode.paragraphs[prevIndex];
    
    // Проверяем, остались ли мы в той же комикс-группе
    const isSameGroup = currentParagraph.comicGroupId && 
                       prevParagraph?.comicGroupId === currentParagraph.comicGroupId;
    
    console.log('[ShowFrames] Paragraph change:', {
      prev: previousParagraphKeyRef.current,
      current: paragraphKey,
      prevGroup: prevParagraph?.comicGroupId,
      currentGroup: currentParagraph.comicGroupId,
      isSameGroup
    });
    
    if (!isSameGroup) {
      setShowComicFrames(false);
      
      const timer = setTimeout(() => {
        if (!isBackgroundChanging) {
          setShowComicFrames(true);
        }
      }, 1300);
      
      previousParagraphKeyRef.current = paragraphKey;
      return () => clearTimeout(timer);
    } else {
      // В той же группе - фреймы остаются видимыми
      setShowComicFrames(true);
      previousParagraphKeyRef.current = paragraphKey;
    }
  }, [paragraphKey, currentParagraph.comicGroupId, currentEpisode.paragraphs, isBackgroundChanging]);
  
  // Сбрасываем накопленные фреймы при смене эпизода
  useEffect(() => {
    maxGroupIndexSeenRef.current.clear();
  }, [currentEpisode.id, maxGroupIndexSeenRef]);
  
  useEffect(() => {
    if (isBackgroundChanging) {
      setShowComicFrames(false);
    } else {
      const timer = setTimeout(() => {
        setShowComicFrames(true);
      }, 1300);
      
      return () => clearTimeout(timer);
    }
  }, [isBackgroundChanging]);
  
  // Логика для группированных комикс-параграфов с накоплением фреймов
  const comicGroupData = useMemo(() => {
    if (!currentParagraph.comicGroupId) return null;
    
    // Находим все параграфы в группе
    const groupParagraphs = currentEpisode.paragraphs.filter(
      p => p.comicGroupId === currentParagraph.comicGroupId
    );
    
    // Находим первый параграф группы (у него хранятся фреймы)
    const firstParagraph = groupParagraphs.find(p => p.comicGroupIndex === 0);
    if (!firstParagraph || !firstParagraph.comicFrames) return null;
    
    const currentGroupIndex = currentParagraph.comicGroupIndex || 0;
    const groupId = currentParagraph.comicGroupId;
    
    // Обновляем максимальный индекс, который мы видели для этой группы
    const prevMaxIndex = maxGroupIndexSeenRef.current.get(groupId) ?? -1;
    const newMaxIndex = Math.max(prevMaxIndex, currentGroupIndex);
    maxGroupIndexSeenRef.current.set(groupId, newMaxIndex);
    
    console.log('[ComicGroup] Group:', groupId, 'Current index:', currentGroupIndex, 'Max seen:', newMaxIndex);
    
    // Добавляем к каждому фрейму информацию о видимости
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
  
  // Старая логика для обратной совместимости
  const hasComicFrames = !comicGroupData && 
                         (currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') && 
                         currentParagraph.comicFrames && 
                         currentParagraph.comicFrames.length > 0;

  // Проверяем активный комикс-параграф (старая система)
  const getActiveComicParagraph = (): ComicParagraph | null => {
    if (!currentEpisode) return null;
    
    for (let i = currentParagraphIndex; i >= 0; i--) {
      const p = currentEpisode.paragraphs[i];
      if (p.type === 'comic' && p.persistAcrossParagraphs) {
        const spanCount = p.spanCount || 1;
        if (currentParagraphIndex >= i && currentParagraphIndex < i + spanCount) {
          return p;
        }
      }
    }
    return null;
  };

  const activeComicParagraph = getActiveComicParagraph();

  // Проверяем, это первый текстовый параграф после фона
  const isFirstTextParagraph = currentParagraphIndex <= 1 && 
                                (currentParagraph.type === 'text' || 
                                 currentParagraph.type === 'dialogue' || 
                                 currentParagraph.type === 'choice');
  
  // Если предыдущий параграф был background, ждём завершения анимации
  const wasBackgroundParagraph = previousParagraph?.type === 'background';
  
  // Условие показа контента
  const shouldShowContent = wasBackgroundParagraph 
    ? (!isBackgroundChanging && newImageReady)  // После background - только когда анимация готова
    : ((!isBackgroundChanging && newImageReady) || isFirstTextParagraph);  // Обычный случай

  console.log('[NovelReaderBackgroundNew] Render:', {
    backgroundImage,
    previousBackgroundImage,
    newImageReady,
    isBackgroundChanging
  });

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row overflow-hidden">
      {/* Верхняя/Левая часть - фоновое изображение */}
      <div className="h-[60vh] lg:h-screen lg:w-1/2 relative overflow-hidden flex-shrink-0">
        {previousBackgroundImage && previousBackgroundImage !== backgroundImage && (
          <img
            src={previousBackgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ 
              objectFit: backgroundObjectFit,
              objectPosition: backgroundObjectPosition,
              opacity: newImageReady ? 0 : 1,
              filter: getFilterStyle(newImageReady ? 'blur(16px)' : 'blur(0px)'),
              transition: 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out',
              willChange: 'opacity, filter',
              zIndex: 1
            }}
          />
        )}
        
        <img
          src={backgroundImage || ''}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ 
            objectFit: backgroundObjectFit,
            objectPosition: backgroundObjectPosition,
            opacity: (previousBackgroundImage && !newImageReady) ? 0 : 1,
            filter: getFilterStyle((previousBackgroundImage && !newImageReady) ? 'blur(16px)' : 'blur(0px)'),
            transition: 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out',
            willChange: 'opacity, filter',
            zIndex: 0
          }}
        />

        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{ 
            background: isRetrospective 
              ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
              : 'rgba(0, 0, 0, 0.2)'
          }}
        />
        
        {/* Картинки-параграфы поверх фона */}
        {currentParagraph.type === 'image' && (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-10">
            <img 
              src={currentParagraph.url}
              alt={currentParagraph.alt || 'Изображение'}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              style={{
                animation: 'fadeIn 0.8s ease-in-out',
                filter: getFilterStyle('blur(0px)')
              }}
            />
          </div>
        )}
        
        {/* Группированные комикс-фреймы (новая система) */}
        {comicGroupData && showComicFrames && (
          <div 
            key={`comic-group-${currentParagraph.comicGroupId}`}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-30 transition-all duration-300 ease-in-out"
            style={{ 
              opacity: actualIsContentHidden ? 0 : 1,
              pointerEvents: actualIsContentHidden ? 'none' : 'auto'
            }}
          >
            <div className="w-full h-full max-w-4xl">
              <ComicFrameReader
                key={`comic-group-reader-${currentParagraph.comicGroupId}`}
                paragraph={{
                  ...currentParagraph,
                  comicFrames: comicGroupData.frames,
                  frameLayout: comicGroupData.layout
                } as TextParagraph | DialogueParagraph}
                currentSubParagraphIndex={undefined}
                layout={comicGroupData.layout}
                isTyping={false}
                isRetrospective={isRetrospective}
                pastelColor={effectivePastelColor}
                isComicGroup={true}
              />
            </div>
          </div>
        )}
        
        {/* Comic frames поверх фона (старая система) */}
        {hasComicFrames && showComicFrames && !comicGroupData && (
          <div 
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-30 transition-all duration-300 ease-in-out"
            style={{ 
              opacity: actualIsContentHidden ? 0 : 1,
              pointerEvents: actualIsContentHidden ? 'none' : 'auto'
            }}
          >
            <div className="w-full h-full max-w-4xl">
              <ComicFrameReader
                paragraph={currentParagraph as TextParagraph | DialogueParagraph}
                currentSubParagraphIndex={currentParagraph.subParagraphs && currentParagraph.subParagraphs.length > 0 ? currentSubParagraphIndex : undefined}
                layout={currentParagraph.frameLayout || 'single'}
                isTyping={isTyping}
                isRetrospective={isRetrospective}
                pastelColor={effectivePastelColor}
              />
            </div>
          </div>
        )}
        
        {/* Отдельные комикс-параграфы (старая система) */}
        {activeComicParagraph && showComicFrames && !comicGroupData && (
          <div 
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-30 transition-all duration-300 ease-in-out"
            style={{ 
              opacity: actualIsContentHidden ? 0 : 1,
              pointerEvents: actualIsContentHidden ? 'none' : 'auto'
            }}
          >
            <div className="w-full h-full max-w-4xl">
              <ComicFrameReader
                paragraph={{
                  ...activeComicParagraph,
                  comicFrames: activeComicParagraph.frames,
                  frameLayout: activeComicParagraph.layout
                } as TextParagraph | DialogueParagraph}
                currentSubParagraphIndex={undefined}
                layout={activeComicParagraph.layout || 'single'}
                isTyping={isTyping}
                isRetrospective={isRetrospective}
                pastelColor={effectivePastelColor}
              />
            </div>
          </div>
        )}
        
        {/* Плавный градиент-переход */}
        <div className="absolute bottom-0 left-0 right-0 h-80 lg:h-full lg:top-0 lg:right-0 lg:left-auto lg:bottom-auto lg:w-64 pointer-events-none z-10">
          <div className="w-full h-full bg-gradient-to-b lg:bg-gradient-to-r from-transparent via-[#151d28]/50 to-[#151d28]" />
        </div>
      </div>

      {/* Нижняя/Правая часть - контент */}
      <div className="flex-1 lg:h-screen w-full lg:w-1/2 relative overflow-y-auto" style={{ backgroundColor: '#151d28' }}>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (!actualIsContentHidden) {
              setWasHidden(true);
            }
            if (onToggleContentVisibility) {
              onToggleContentVisibility();
            } else {
              setIsContentHidden(!isContentHidden);
            }
          }}
          className="md:hidden absolute top-2 md:top-4 right-4 z-30 h-10 w-10 p-0 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50 rounded-full"
          title={actualIsContentHidden ? 'Показать текст' : 'Скрыть текст'}
        >
          <Icon name={actualIsContentHidden ? 'Eye' : 'EyeOff'} size={20} className="text-white" />
        </Button>
        
        {currentParagraph.type !== 'background' && currentParagraph.type !== 'comic' && shouldShowContent && (
          <>
            <div className="absolute bottom-12 md:bottom-8 lg:top-1/2 lg:-translate-y-1/2 left-0 right-0 z-10 px-5 md:px-8">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center">
              {currentParagraph.type !== 'choice' && (
                <div className="flex justify-between items-center mb-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Если есть подпараграфы и мы не на первом, переходим назад по подпараграфам
                      if ((currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') && 
                          currentParagraph.subParagraphs && 
                          currentParagraph.subParagraphs.length > 0 && 
                          currentSubParagraphIndex > 0) {
                        goToPreviousSubParagraph();
                      } else {
                        goToPreviousParagraph();
                      }
                    }}
                    disabled={currentParagraphIndex === 0 && currentSubParagraphIndex === 0}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronLeft" size={16} className="text-white" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Если есть подпараграфы и мы не на последнем, переходим вперед по подпараграфам
                      const hasSubParagraphs = (currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') && 
                                               currentParagraph.subParagraphs && 
                                               currentParagraph.subParagraphs.length > 0;
                      const subParagraphsCount = hasSubParagraphs ? currentParagraph.subParagraphs!.length : 0;
                      const isLastSubParagraph = currentSubParagraphIndex >= subParagraphsCount;
                      
                      if (hasSubParagraphs && !isLastSubParagraph) {
                        goToNextSubParagraph();
                      } else {
                        goToNextParagraph();
                      }
                    }}
                    disabled={currentParagraphIndex === currentEpisode.paragraphs.length - 1 && 
                              (!(currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') || 
                               !currentParagraph.subParagraphs || 
                               currentParagraph.subParagraphs.length === 0 ||
                               currentSubParagraphIndex >= currentParagraph.subParagraphs.length)}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronRight" size={16} className="text-white" />
                  </Button>
                </div>
              )}
              
              {(currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') && 
               currentParagraph.subParagraphs && 
               currentParagraph.subParagraphs.length > 0 ? (
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-border p-6 md:p-8 w-full">
                  <div className={`leading-relaxed w-full text-foreground ${
                    settings.textSize === 'small' ? 'text-base md:text-lg' :
                    settings.textSize === 'large' ? 'text-xl md:text-2xl' :
                    'text-lg md:text-xl'
                  }`}>
                    {currentSubParagraphIndex === 0 ? (
                      currentParagraph.type === 'text' ? currentParagraph.content : currentParagraph.text
                    ) : (
                      currentParagraph.subParagraphs?.[currentSubParagraphIndex - 1]?.text || ''
                    )}
                  </div>
                </div>
              ) : currentParagraph.type === 'image' ? (
                null
              ) : (
                <NovelReaderContent
                  currentParagraph={currentParagraph}
                  currentEpisode={currentEpisode}
                  novel={novel}
                  settings={settings}
                  profile={profile}
                  skipTyping={skipTyping || wasHidden}
                  handleTypingComplete={handleTypingComplete}
                  handleChoice={handleChoice}
                  onProfileUpdate={onProfileUpdate}
                  paragraphKey={paragraphKey}
                  previousParagraph={previousParagraph}
                />
              )}
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NovelReaderBackgroundNew;