import { useState } from 'react';
import { Novel, Episode, Paragraph } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import NovelReaderContent from './NovelReaderContent';

interface NovelReaderBackgroundProps {
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
}

function NovelReaderBackground({
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
  existingBookmark,
  handleAddBookmark,
  handleRemoveBookmark,
  previousParagraph
}: NovelReaderBackgroundProps) {
  const [isContentHidden, setIsContentHidden] = useState(false);
  
  if (!backgroundImage) return null;

  const timeframes = currentParagraph.timeframes || currentEpisode.timeframes || ['present'];
  const isRetrospective = timeframes.includes('retrospective');

  const getFilterStyle = (baseFilter: string) => {
    const sepiaAmount = isRetrospective ? 0.6 : 0;
    const contrastAmount = isRetrospective ? 0.9 : 1;
    const brightnessAmount = isRetrospective ? 0.85 : 1;
    return `${baseFilter} sepia(${sepiaAmount}) contrast(${contrastAmount}) brightness(${brightnessAmount})`;
  };

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
      
      {/* Кнопка скрытия контента */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsContentHidden(!isContentHidden);
        }}
        className="absolute top-4 right-4 z-20 h-10 w-10 p-0 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50 rounded-full"
        title={isContentHidden ? 'Показать текст' : 'Скрыть текст'}
      >
        <Icon name={isContentHidden ? 'Eye' : 'EyeOff'} size={20} />
      </Button>
      
      {!isContentHidden && currentParagraph.type !== 'background' && !isBackgroundChanging && (
        currentParagraph.mergedWith ? (
          <>
            {/* Первый параграф - занимает пространство от top-[50px] до второго параграфа */}
            <div className="absolute top-[50px] left-0 right-0 bottom-[calc(20rem+5rem)] md:bottom-[calc(12rem+2rem)] z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent flex justify-center items-center px-4 md:px-6 md:pr-8">
              <div className="w-full max-w-4xl">
                <NovelReaderContent
                  currentParagraph={currentParagraph}
                  currentEpisode={currentEpisode}
                  novel={novel}
                  settings={settings}
                  profile={profile}
                  skipTyping={skipTyping}
                  handleTypingComplete={handleTypingComplete}
                  handleChoice={handleChoice}
                  onProfileUpdate={onProfileUpdate}
                  paragraphKey={paragraphKey}
                  isTopMerged={true}
                  previousParagraph={previousParagraph}
                />
              </div>
            </div>
            
            {/* Второй параграф на стандартной позиции */}
            {currentEpisode.paragraphs[currentParagraphIndex + 1] && (
              <div className="absolute bottom-20 md:bottom-8 left-0 right-0 z-10 flex justify-center px-4 md:px-6 md:pr-8">
                <div className="w-full max-w-4xl">
                  <NovelReaderContent
                    currentParagraph={currentEpisode.paragraphs[currentParagraphIndex + 1]}
                    currentEpisode={currentEpisode}
                    novel={novel}
                    settings={settings}
                    profile={profile}
                    skipTyping={skipTyping}
                    handleTypingComplete={handleTypingComplete}
                    handleChoice={handleChoice}
                    onProfileUpdate={onProfileUpdate}
                    paragraphKey={`${paragraphKey}-merged`}
                    isTopMerged={false}
                    previousParagraph={currentParagraph}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Стандартный одиночный параграф */
          <div className="absolute bottom-20 md:bottom-8 left-0 right-0 z-10 flex justify-center px-4 md:px-6 md:pr-8">
            <div className="w-full max-w-4xl">
              {!isTyping && currentParagraph.type !== 'choice' && (
                <div className="md:hidden flex justify-between items-center mb-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[NavButton] Previous clicked');
                      goToPreviousParagraph();
                    }}
                    disabled={currentParagraphIndex === 0}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[NavButton] Next clicked, currentIndex:', currentParagraphIndex, 'total:', currentEpisode.paragraphs.length);
                      goToNextParagraph();
                    }}
                    disabled={currentParagraphIndex === currentEpisode.paragraphs.length - 1}
                    className="h-8 px-3 bg-card/80 backdrop-blur-sm hover:bg-card/90 border border-border/50"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </div>
              )}
              
              <NovelReaderContent
                currentParagraph={currentParagraph}
                currentEpisode={currentEpisode}
                novel={novel}
                settings={settings}
                profile={profile}
                skipTyping={skipTyping}
                handleTypingComplete={handleTypingComplete}
                handleChoice={handleChoice}
                onProfileUpdate={onProfileUpdate}
                paragraphKey={paragraphKey}
                isTopMerged={false}
                previousParagraph={previousParagraph}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default NovelReaderBackground;