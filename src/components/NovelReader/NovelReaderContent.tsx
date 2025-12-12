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
  isTopMerged = false
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

  return (
    <>
      {currentParagraph.type === 'text' && (
        <div className={`bg-card/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-border flex items-start relative ${
          isTopMerged ? 'p-3 md:p-4 lg:p-5 min-h-[8rem]' : 'p-4 md:p-6 lg:p-8 min-h-[10rem] md:min-h-[12rem]'
        }`}>
          <div 
            className="absolute inset-0 pointer-events-none rounded-xl md:rounded-2xl transition-all duration-1000 ease-in-out"
            style={{
              opacity: isRetrospective ? 1 : 0,
              boxShadow: 'inset 0 0 60px 20px rgba(0, 0, 0, 0.4)',
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.3) 100%)'
            }}
          />
          <div className={`leading-relaxed text-left text-foreground w-full pt-1 md:pt-2 ${
            isTopMerged 
              ? (settings.textSize === 'small' ? 'text-sm md:text-base lg:text-lg' :
                 settings.textSize === 'large' ? 'text-base md:text-lg lg:text-xl' :
                 'text-sm md:text-base lg:text-lg')
              : (settings.textSize === 'small' ? 'text-sm md:text-base lg:text-lg' :
                 settings.textSize === 'large' ? 'text-lg md:text-xl lg:text-2xl' :
                 'text-base md:text-lg lg:text-xl')
          }`} style={novelFontStyle}>
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

      {currentParagraph.type === 'dialogue' && (
        <DialogueBox
          key={paragraphKey}
          characterName={currentParagraph.characterName}
          characterImage={currentParagraph.characterImage}
          text={currentParagraph.text}
          skipTyping={skipTyping}
          onComplete={handleTypingComplete}
          textSpeed={settings.textSpeed}
          fontFamily={novelFontStyle.fontFamily}
          isTopMerged={isTopMerged}
          isRetrospective={isRetrospective}
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
      )}

      {currentParagraph.type === 'choice' && (
        <div className="w-full max-w-2xl ml-0 md:ml-16">
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
        />
      )}

      {currentParagraph.type === 'image' && (
        <ImageBox
          url={currentParagraph.url}
          mobileUrl={currentParagraph.mobileUrl}
          alt={currentParagraph.alt}
          isTopMerged={isTopMerged}
          isRetrospective={isRetrospective}
        />
      )}
    </>
  );
}

export default NovelReaderContent;