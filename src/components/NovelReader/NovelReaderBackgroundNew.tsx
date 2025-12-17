import { useState, useEffect } from 'react';
import { Novel, Episode, Paragraph, TextParagraph, DialogueParagraph } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import NovelReaderContent from './NovelReaderContent';
import ComicFrameReader from './ComicFrameReader';
import TypewriterText from '../TypewriterText';
import ShapeTransition from './ShapeTransitions';

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
  goToPreviousSubParagraph
}: NovelReaderBackgroundNewProps) {
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [wasHidden, setWasHidden] = useState(false);
  
  useEffect(() => {
    setWasHidden(false);
    setIsContentHidden(false);
  }, [paragraphKey]);
  
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

  return (
    <div className="absolute inset-0 flex">
      {/* Левая часть - фоновое изображение с волнистым краем */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <img 
              src={currentParagraph.url}
              alt={currentParagraph.alt || 'Изображение'}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-fade-in"
            />
          </div>
        )}
        
        {/* Фигурный переход */}
        <ShapeTransition type={
          currentParagraph.type === 'background' && currentParagraph.shapeTransition 
            ? currentParagraph.shapeTransition 
            : currentEpisode.shapeTransition || 'organic'
        } />
      </div>

      {/* Правая часть - контент */}
      <div className="w-full lg:w-1/2 relative overflow-hidden"
        style={{
          clipPath: 'inset(0)',
          background: 'linear-gradient(135deg, hsl(210, 70%, 15%) 0%, hsl(215, 65%, 20%) 100%)'
        }}
      >
        {/* Мобильный фон */}
        <div className="lg:hidden absolute inset-0">
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
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (!isContentHidden) {
              setWasHidden(true);
            }
            setIsContentHidden(!isContentHidden);
          }}
          className="absolute top-6 right-4 z-20 h-10 w-10 p-0 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50 rounded-full"
          title={isContentHidden ? 'Показать текст' : 'Скрыть текст'}
        >
          <Icon name={isContentHidden ? 'Eye' : 'EyeOff'} size={20} className="text-white" />
        </Button>
        
        {!isContentHidden && currentParagraph.type !== 'background' && !isBackgroundChanging && (
          <>
            {hasComicFrames && (
              <div className="absolute top-[80px] left-4 right-4 bottom-[calc(14rem+3rem)] z-10">
                <div className="w-full h-full max-w-3xl mx-auto px-2">
                  <ComicFrameReader
                    paragraph={currentParagraph as TextParagraph | DialogueParagraph}
                    currentSubParagraphIndex={currentParagraph.subParagraphs && currentParagraph.subParagraphs.length > 0 ? currentSubParagraphIndex : undefined}
                    layout={currentParagraph.frameLayout || 'single'}
                    isTyping={isTyping}
                  />
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-8">
            <div className="w-full max-w-3xl">
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
                <div className="backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 min-h-[10rem] md:min-h-[12rem]" style={{ background: 'linear-gradient(135deg, hsl(210, 70%, 15%) 0%, hsl(215, 65%, 20%) 100%)' }}>
                  <div className={`leading-relaxed w-full text-white ${
                    settings.textSize === 'small' ? 'text-base md:text-lg' :
                    settings.textSize === 'large' ? 'text-xl md:text-2xl' :
                    'text-lg md:text-xl'
                  }`}>
                    {/* Индекс 0 = основной текст параграфа, индекс 1+ = подпараграфы 0, 1, 2... */}
                    {currentSubParagraphIndex === 0 ? (
                      currentParagraph.type === 'text' ? currentParagraph.content : currentParagraph.text
                    ) : (
                      currentParagraph.subParagraphs?.[currentSubParagraphIndex - 1]?.text || ''
                    )}
                  </div>
                </div>
              ) : currentParagraph.type === 'image' ? (
                <div className="backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 min-h-[10rem] md:min-h-[12rem] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(210, 70%, 15%) 0%, hsl(215, 65%, 20%) 100%)' }}>
                  <p className="text-white/60 text-center">Изображение отображается на фоне</p>
                </div>
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