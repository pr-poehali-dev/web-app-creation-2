import { Novel, Episode, Paragraph } from '@/types/novel';
import { UserSettings, UserProfile } from '@/types/settings';
import TypewriterText from '../TypewriterText';
import DialogueBox from '../DialogueBox';
import ChoiceBox from '../ChoiceBox';
import ItemBox from '../ItemBox';
import ImageBox from '../ImageBox';

interface NovelReaderContentProps {
  currentParagraph: Paragraph;
  currentEpisode: Episode;
  novel: Novel;
  settings: UserSettings;
  profile: UserProfile;
  skipTyping: boolean;
  handleTypingComplete: () => void;
  handleChoice: (choiceId: string, pathId: string | undefined, oneTime: boolean | undefined, nextEpisodeId?: string, nextParagraphIndex?: number) => void;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  paragraphKey: string;
  isTopMerged?: boolean;
  previousParagraph?: Paragraph;
}

function NovelReaderContent({
  currentParagraph,
  currentEpisode,
  novel,
  settings,
  profile,
  skipTyping,
  handleTypingComplete,
  handleChoice,
  onProfileUpdate,
  paragraphKey,
  isTopMerged = false,
  previousParagraph
}: NovelReaderContentProps) {
  const novelFontStyle = {
    fontFamily: settings.fontFamily === 'merriweather' ? '"Merriweather", serif' :
               settings.fontFamily === 'playfair' ? '"Playfair Display", serif' :
               settings.fontFamily === 'lora' ? '"Lora", serif' :
               settings.fontFamily === 'georgia' ? 'Georgia, serif' :
               settings.fontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
               settings.fontFamily === 'roboto' ? '"Roboto", sans-serif' :
               settings.fontFamily === 'opensans' ? '"Open Sans", sans-serif' :
               settings.fontFamily === 'ptsans' ? '"PT Sans", sans-serif' :
               settings.fontFamily === 'Inter' ? '"Inter", sans-serif' :
               'Arial, sans-serif'
  };

  const timeframes = currentParagraph.timeframes || currentEpisode.timeframes || ['present'];
  const isRetrospective = timeframes.includes('retrospective');

  const getPastelColor = (color?: string) => {
    const colors = {
      pink: 'rgba(255, 182, 193, 0.5)',
      blue: 'rgba(173, 216, 230, 0.5)',
      peach: 'rgba(255, 218, 185, 0.5)',
      lavender: 'rgba(221, 160, 221, 0.5)',
      mint: 'rgba(152, 255, 152, 0.5)',
      yellow: 'rgba(255, 255, 153, 0.5)',
      coral: 'rgba(255, 160, 122, 0.5)',
      sky: 'rgba(135, 206, 235, 0.5)'
    };
    return colors[color as keyof typeof colors] || colors.pink;
  };

  const effectivePastelColor = currentParagraph.pastelColor || currentEpisode.pastelColor;

  return (
    <>
      {currentParagraph.type === 'text' && (
        <div className={`bg-card/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-border flex items-start relative w-full ${
          isTopMerged ? 'p-12 md:p-16 lg:p-24 h-full justify-center' : 'p-4 md:p-6 lg:p-8 min-h-[10rem] md:min-h-[12rem]'
        }`}>
          <div 
            className="absolute inset-0 pointer-events-none rounded-xl md:rounded-2xl transition-all duration-1000 ease-in-out"
            style={{
              opacity: isRetrospective ? 1 : 0,
              background: getPastelColor(effectivePastelColor),
              backdropFilter: isRetrospective ? 'saturate(1.2) brightness(1.05)' : 'none'
            }}
          />
          <div className={`leading-relaxed w-full ${
            isTopMerged 
              ? (settings.textSize === 'small' ? 'text-2xl md:text-3xl lg:text-4xl text-center' :
                 settings.textSize === 'large' ? 'text-3xl md:text-4xl lg:text-5xl text-center' :
                 'text-2xl md:text-3xl lg:text-4xl text-center')
              : (settings.textSize === 'small' ? 'text-sm md:text-base lg:text-lg text-left' :
                 settings.textSize === 'large' ? 'text-lg md:text-xl lg:text-2xl text-left' :
                 'text-base md:text-lg lg:text-xl text-left')
          } text-foreground`} style={novelFontStyle}>
            {console.log('[NovelReaderContent] Rendering TypewriterText with key:', paragraphKey, 'skipTyping:', skipTyping)}
            <TypewriterText
              text={currentParagraph.content}
              speed={settings.textSpeed}
              skipTyping={skipTyping}
              onComplete={handleTypingComplete}
              resetKey={paragraphKey}
            />
          </div>
        </div>
      )}

      {currentParagraph.type === 'dialogue' && (() => {
        const isSameCharacter = previousParagraph?.type === 'dialogue' && 
          previousParagraph.characterName === currentParagraph.characterName &&
          previousParagraph.characterImage === currentParagraph.characterImage;
        
        const dialogueKey = isSameCharacter 
          ? `dialogue-${currentParagraph.characterName}`
          : paragraphKey;
        
        return (
          <DialogueBox
            key={dialogueKey}
            characterName={currentParagraph.characterName}
            characterImage={currentParagraph.characterImage}
            text={currentParagraph.text}
            skipTyping={skipTyping}
            onComplete={handleTypingComplete}
            textSpeed={settings.textSpeed}
            fontFamily={novelFontStyle.fontFamily}
            isTopMerged={isTopMerged}
            isRetrospective={isRetrospective}
            pastelColor={effectivePastelColor}
            shouldAnimate={!isSameCharacter}
            resetKey={paragraphKey}
            existingComment={profile.metCharacters?.find(
              c => c.name === currentParagraph.characterName
            )?.comment}
            onCommentSave={(comment) => {
              const characterIndex = profile.metCharacters?.findIndex(
                c => c.name === currentParagraph.characterName
              );
              if (characterIndex !== undefined && characterIndex >= 0) {
                const updatedCharacters = [...(profile.metCharacters || [])];
                updatedCharacters[characterIndex] = {
                  ...updatedCharacters[characterIndex],
                  comment
                };
                onProfileUpdate({
                  ...profile,
                  metCharacters: updatedCharacters
                });
              }
            }}
          />
        );
      })()}

      {currentParagraph.type === 'choice' && (
        <div className="w-full max-w-md mx-auto">
          <ChoiceBox
            question={currentParagraph.question}
            options={currentParagraph.options.filter(opt => {
              // Фильтруем недоступные выборы
              if (opt.oneTime && profile.usedChoices.includes(opt.id)) return false;
              if (opt.requiredPath && !profile.activePaths.includes(opt.requiredPath)) return false;
              return true;
            })}
            novel={novel}
            onChoice={handleChoice}
            isChoiceMade={currentParagraph.lockAfterChoice && profile.madeChoicesInParagraphs?.includes(paragraphKey)}
          />
        </div>
      )}

      {currentParagraph.type === 'item' && (
        <ItemBox
          key={paragraphKey}
          name={currentParagraph.name}
          description={currentParagraph.description}
          imageUrl={currentParagraph.imageUrl}
          skipTyping={skipTyping}
          onComplete={handleTypingComplete}
          textSpeed={settings.textSpeed}
          isTopMerged={isTopMerged}
          itemType={currentParagraph.itemType}
          action={currentParagraph.action}
          isRetrospective={isRetrospective}
          pastelColor={effectivePastelColor}
        />
      )}

      {/* ImageParagraph теперь отображается на левой стороне с фоном */}
      {currentParagraph.type === 'image' && (
        <div className="bg-card/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-border p-6 text-center">
          <p className="text-foreground/60 italic">Изображение отображается слева</p>
        </div>
      )}
    </>
  );
}

export default NovelReaderContent;