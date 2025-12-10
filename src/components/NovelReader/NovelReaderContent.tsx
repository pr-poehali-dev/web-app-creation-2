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
  isFading: boolean;
  handleTypingComplete: () => void;
  handleChoice: (choiceId: string, pathId: string | undefined, oneTime: boolean | undefined, nextEpisodeId?: string, nextParagraphIndex?: number) => void;
  onProfileUpdate: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
}

function NovelReaderContent({
  currentParagraph,
  currentEpisode,
  novel,
  settings,
  profile,
  skipTyping,
  isFading,
  handleTypingComplete,
  handleChoice,
  onProfileUpdate
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
        <div className={`leading-relaxed text-left text-foreground px-2 py-4 md:p-8 transition-opacity ease-in-out ${
          isFading 
            ? `opacity-0 ${currentParagraph.slowFade ? 'duration-[3000ms]' : 'duration-300'}` 
            : 'opacity-100 duration-300'
        } ${
          settings.textSize === 'small' ? 'text-base md:text-lg' :
          settings.textSize === 'large' ? 'text-xl md:text-2xl' :
          'text-lg md:text-xl'
        }`} style={novelFontStyle}>
          <TypewriterText 
            text={currentParagraph.content}
            speed={settings.textSpeed}
            skipTyping={skipTyping}
            onComplete={handleTypingComplete}
          />
        </div>
      )}

      {currentParagraph.type === 'dialogue' && (
        <DialogueBox
          characterName={currentParagraph.characterName}
          characterImage={currentParagraph.characterImage}
          text={currentParagraph.text}
          skipTyping={skipTyping}
          onComplete={handleTypingComplete}
          textSpeed={settings.textSpeed}
          fontFamily={novelFontStyle.fontFamily}
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
      )}

      {currentParagraph.type === 'item' && (
        <ItemBox
          name={currentParagraph.name}
          description={currentParagraph.description}
          imageUrl={currentParagraph.imageUrl}
          skipTyping={skipTyping}
          onComplete={handleTypingComplete}
          textSpeed={settings.textSpeed}
        />
      )}

      {currentParagraph.type === 'image' && (
        <ImageBox
          url={currentParagraph.url}
          alt={currentParagraph.alt}
        />
      )}
    </>
  );
}

export default NovelReaderContent;