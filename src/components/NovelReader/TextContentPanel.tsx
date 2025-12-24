import { Novel, Episode, Paragraph } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import NovelReaderContent from './NovelReaderContent';

interface TextContentPanelProps {
  currentParagraph: Paragraph;
  currentEpisode: Episode;
  currentParagraphIndex: number;
  novel: Novel;
  settings: UserSettings;
  profile: UserProfile;
  skipTyping: boolean;
  wasHidden: boolean;
  handleTypingComplete: () => void;
  handleChoice: (choiceId: string, pathId: string | undefined, oneTime: boolean | undefined, nextEpisodeId?: string, nextParagraphIndex?: number) => void;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  paragraphKey: string;
  previousParagraph?: Paragraph;
  goToPreviousParagraph: () => void;
  goToNextParagraph: () => void;
  actualIsContentHidden: boolean;
  setWasHidden: (value: boolean) => void;
  onToggleContentVisibility?: () => void;
  setIsContentHidden: (value: boolean | ((prev: boolean) => boolean)) => void;
  isContentHidden: boolean;
  shouldShowContent: boolean;
  isEditorMode?: boolean;
}

function TextContentPanel({
  currentParagraph,
  currentEpisode,
  currentParagraphIndex,
  novel,
  settings,
  profile,
  skipTyping,
  wasHidden,
  handleTypingComplete,
  handleChoice,
  onProfileUpdate,
  paragraphKey,
  previousParagraph,
  goToPreviousParagraph,
  goToNextParagraph,
  actualIsContentHidden,
  setWasHidden,
  onToggleContentVisibility,
  setIsContentHidden,
  isContentHidden,
  shouldShowContent,
  isEditorMode = false
}: TextContentPanelProps) {
  return (
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
      
      {currentParagraph.type !== 'background' && shouldShowContent && (
        <>
          <div className="absolute bottom-12 md:bottom-8 lg:top-1/2 lg:-translate-y-1/2 left-0 right-0 z-10 px-5 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className={`w-full ${isEditorMode ? '' : 'max-w-3xl mx-auto'} flex flex-col items-center justify-center`}>
            {currentParagraph.type !== 'choice' && !isEditorMode && (
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
            
            {currentParagraph.type === 'image' ? null : (
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

export default TextContentPanel;