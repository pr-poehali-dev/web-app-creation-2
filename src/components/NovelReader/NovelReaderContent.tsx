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

  return (
    <>
      {currentParagraph.type === 'text' && (
        <div className={`bg-card/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-border flex items-start ${
          isTopMerged ? 'p-2 md:p-4 lg:p-5 h-auto' : 'p-4 md:p-6 lg:p-8 h-[220px] md:h-[280px] md:min-h-[12rem] md:h-auto'
        }`}>
          <div className={`leading-relaxed text-left text-foreground w-full pt-0.5 md:pt-2 ${
            isTopMerged 
              ? (settings.textSize === 'small' ? 'text-xs md:text-base lg:text-lg' :
                 settings.textSize === 'large' ? 'text-sm md:text-lg lg:text-xl' :
                 'text-xs md:text-base lg:text-lg')
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
        />
      )}

      {currentParagraph.type === 'image' && (
        <ImageBox
          url={currentParagraph.url}
          alt={currentParagraph.alt}
          isTopMerged={isTopMerged}
        />
      )}
    </>
  );
}

export default NovelReaderContent;