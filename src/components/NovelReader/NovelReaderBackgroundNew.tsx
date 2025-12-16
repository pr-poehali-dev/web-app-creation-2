import { useState, useEffect } from 'react';
import { Novel, Episode, Paragraph, TextParagraph, DialogueParagraph } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import NovelReaderContent from './NovelReaderContent';
import ComicFrameReader from './ComicFrameReader';

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
    <div className="absolute top-20 left-4 right-4 bottom-4 md:top-20 md:left-8 md:right-32 rounded-2xl overflow-hidden">
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
        className="absolute top-4 right-4 z-20 h-10 w-10 p-0 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50 rounded-full"
        title={isContentHidden ? 'Показать текст' : 'Скрыть текст'}
      >
        <Icon name={isContentHidden ? 'Eye' : 'EyeOff'} size={20} className="text-white" />
      </Button>
      
      {!isContentHidden && currentParagraph.type !== 'background' && !isBackgroundChanging && (
        <>
          {hasComicFrames && (
            <div className="absolute top-[60px] left-4 right-4 bottom-[calc(14rem+3rem)] md:top-[80px] md:left-8 md:right-32 md:bottom-[calc(14rem+3rem)] z-10 p-4">
              <div className="w-full h-full max-w-5xl mx-auto">
                <ComicFrameReader
                  paragraph={currentParagraph as TextParagraph | DialogueParagraph}
                  currentSubParagraphIndex={currentParagraph.subParagraphs && currentParagraph.subParagraphs.length > 0 ? currentSubParagraphIndex : undefined}
                  layout={currentParagraph.frameLayout || 'single'}
                />
              </div>
            </div>
          )}
          
          <div className="absolute bottom-20 md:bottom-8 left-0 right-0 z-10 flex justify-center px-4 md:px-6 md:pr-8">
            <div className="w-full max-w-4xl">
              {!isTyping && currentParagraph.type !== 'choice' && (
                <div className="flex justify-between items-center mb-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPreviousParagraph();
                    }}
                    disabled={currentParagraphIndex === 0}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronLeft" size={16} className="text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextParagraph();
                    }}
                    disabled={currentParagraphIndex === currentEpisode.paragraphs.length - 1}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronRight" size={16} className="text-white" />
                  </Button>
                </div>
              )}
              
              {(currentParagraph.type === 'text' || currentParagraph.type === 'dialogue') && 
               currentParagraph.subParagraphs && 
               currentParagraph.subParagraphs.length > 0 ? (
                <div className="bg-card/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-border p-4 md:p-6 lg:p-8">
                  <div className="leading-relaxed w-full text-base md:text-lg lg:text-xl text-foreground">
                    {currentParagraph.subParagraphs[currentSubParagraphIndex].text}
                  </div>
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
  );
}

export default NovelReaderBackgroundNew;