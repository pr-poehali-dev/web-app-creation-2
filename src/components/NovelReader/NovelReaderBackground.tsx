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
  handleChoice: (optionIndex: number) => void;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  paragraphKey: string;
  goToPreviousParagraph: () => void;
  goToNextParagraph: () => void;
  existingBookmark: any;
  handleAddBookmark: (comment: string) => void;
  handleRemoveBookmark: () => void;
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
  handleRemoveBookmark
}: NovelReaderBackgroundProps) {
  if (!backgroundImage) return null;

  const timeframe = currentParagraph.timeframe || currentEpisode.timeframe || 'present';
  const isRetrospective = timeframe === 'retrospective';

  const getFilterStyle = (baseFilter: string) => {
    if (isRetrospective) {
      return `${baseFilter} sepia(0.6) contrast(0.9) brightness(0.85)`;
    }
    return baseFilter;
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
          backgroundImage: `url(${backgroundImage})`,
          opacity: previousBackgroundImage && !newImageReady ? 0 : 1,
          filter: getFilterStyle(previousBackgroundImage && !newImageReady ? 'blur(16px)' : 'blur(0px)'),
          transition: previousBackgroundImage ? 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out' : 'none',
          zIndex: 0
        }}
      />
      
      <div className={`absolute inset-0 ${isRetrospective ? 'bg-amber-950/30' : 'bg-black/20'}`} style={{ transition: 'background-color 2.4s ease-in-out' }} />
      
      <div className="relative w-full h-full flex items-end justify-center pb-20 px-4 md:pb-8 md:px-6 md:pr-8">
        <div className="w-full max-w-4xl md:min-h-0 relative z-10">
          {!isTyping && currentParagraph.type !== 'choice' && (
            <div className="md:hidden flex justify-between items-center mb-2 gap-2">
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
                <Icon name="ChevronLeft" size={16} />
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
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          )}
          
          {currentParagraph.type !== 'background' && !isBackgroundChanging && (
            <div className={currentParagraph.mergedWith ? "space-y-2 md:space-y-3 max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent" : ""}>
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
                isTopMerged={!!currentParagraph.mergedWith}
              />
              {currentParagraph.mergedWith && currentEpisode.paragraphs[currentParagraphIndex + 1] && (
                <NovelReaderContent
                  currentParagraph={currentEpisode.paragraphs[currentParagraphIndex + 1]}
                  currentEpisode={currentEpisode}
                  novel={novel}
                  settings={settings}
                  profile={profile}
                  skipTyping={skipTyping}
                  handleTypingComplete={() => {}}
                  handleChoice={handleChoice}
                  onProfileUpdate={onProfileUpdate}
                  paragraphKey={`${paragraphKey}-merged`}
                  isTopMerged={false}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NovelReaderBackground;