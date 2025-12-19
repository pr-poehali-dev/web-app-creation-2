import { useState, useEffect } from 'react';
import { Novel, Episode, Paragraph, TextParagraph, DialogueParagraph } from '@/types/novel';
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
  onToggleContentVisibility
}: NovelReaderBackgroundNewProps) {
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [wasHidden, setWasHidden] = useState(false);
  
  const actualIsContentHidden = externalIsContentHidden !== undefined ? externalIsContentHidden : isContentHidden;
  const [showComicFrames, setShowComicFrames] = useState(false);
  
  useEffect(() => {
    setWasHidden(false);
    setIsContentHidden(false);
    setShowComicFrames(false);
    
    const timer = setTimeout(() => {
      if (!isBackgroundChanging) {
        setShowComicFrames(true);
      }
    }, 1300);
    
    return () => clearTimeout(timer);
  }, [paragraphKey]);
  
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
  
  if (!backgroundImage) return null;

  const timeframes = currentParagraph.timeframes || currentEpisode.timeframes || ['present'];
  const isRetrospective = timeframes.includes('retrospective');

  const getFilterStyle = (baseFilter: string) => {
    const sepiaAmount = isRetrospective ? 0.6 : 0;
    const contrastAmount = isRetrospective ? 0.9 : 1;
    const brightnessAmount = isRetrospective ? 0.85 : 1;
    return `${baseFilter} sepia(${sepiaAmount}) contrast(${contrastAmount}) brightness(${brightnessAmount})`;
  };

  const hasComicFrames = (currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') && 
                         currentParagraph.comicFrames && 
                         currentParagraph.comicFrames.length > 0;

  // Проверяем, это первый текстовый параграф после фона
  const isFirstTextParagraph = currentParagraphIndex <= 1 && 
                                (currentParagraph.type === 'text' || 
                                 currentParagraph.type === 'dialogue' || 
                                 currentParagraph.type === 'choice');
  
  // Условие показа контента: либо всё готово, либо это первый текстовый параграф
  const shouldShowContent = (!isBackgroundChanging && newImageReady) || isFirstTextParagraph;

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row overflow-hidden">
      {/* Верхняя/Левая часть - фоновое изображение */}
      <div className="h-[calc(100vh-280px)] lg:h-screen lg:w-1/2 relative overflow-hidden flex-shrink-0">
        {previousBackgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${previousBackgroundImage})`,
              opacity: newImageReady ? 0 : 1,
              filter: getFilterStyle(newImageReady ? 'blur(16px)' : 'blur(0px)'),
              transition: 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out',
              zIndex: 1
            }}
          />
        )}
        
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url("${backgroundImage}")`,
            opacity: previousBackgroundImage && !newImageReady ? 0 : 1,
            filter: getFilterStyle(previousBackgroundImage && !newImageReady ? 'blur(16px)' : 'blur(0px)'),
            transition: previousBackgroundImage ? 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out' : 'filter 1.2s ease-in-out',
            zIndex: 0
          }}
        />

        <div className={`absolute inset-0 ${isRetrospective ? 'bg-amber-950/30' : 'bg-black/20'}`} style={{ transition: 'background-color 1.2s ease-in-out' }} />
        
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
        
        {/* Comic frames поверх фона */}
        {hasComicFrames && showComicFrames && (
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
      <div className="min-h-[280px] lg:h-screen w-full lg:w-1/2 relative overflow-y-auto" style={{ backgroundColor: '#151d28' }}>
        
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
        
        {currentParagraph.type !== 'background' && shouldShowContent && (
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