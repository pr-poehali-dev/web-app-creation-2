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

  return (
    <>
      {currentParagraph.type === 'text' && (
        <div className={`relative flex items-start ${
          isTopMerged ? 'p-12 md:p-16 lg:p-24 h-full w-full justify-center' : 'p-4 md:p-6 lg:p-8 min-h-[10rem] md:min-h-[12rem]'
        }`}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4c5b0" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#5c8fa3" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#d4c5b0" stopOpacity="0.9" />
              </linearGradient>
              <filter id="textShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
                <feOffset dx="0" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M 0,100 C 80,60 150,80 250,90 C 350,100 450,85 550,95 C 650,105 720,90 800,110 L 800,290 C 720,310 650,295 550,305 C 450,315 350,300 250,310 C 150,320 80,340 0,300 Z" 
              fill="url(#textGrad)" filter="url(#textShadow)" opacity="0.92" />
            <ellipse cx="120" cy="150" rx="45" ry="45" fill="#5c8fa3" opacity="0.25" />
            <ellipse cx="700" cy="120" rx="35" ry="55" fill="#2d2d2d" opacity="0.15" />
            <ellipse cx="680" cy="280" rx="50" ry="35" fill="#d4c5b0" opacity="0.3" />
            <path d="M 90,120 Q 95,140 100,160 Q 105,180 110,200" stroke="#2d2d2d" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
            <path d="M 720,100 C 730,100 740,105 750,110" stroke="#2d2d2d" strokeWidth="1" fill="none" opacity="0.25" strokeLinecap="round" />
          </svg>
          
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out"
            style={{
              opacity: isRetrospective ? 1 : 0,
              boxShadow: 'inset 0 0 60px 20px rgba(0, 0, 0, 0.4)',
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.3) 100%)'
            }}
          />
          <div className={`leading-relaxed w-full relative z-10 ${
            isTopMerged 
              ? (settings.textSize === 'small' ? 'text-2xl md:text-3xl lg:text-4xl text-center' :
                 settings.textSize === 'large' ? 'text-3xl md:text-4xl lg:text-5xl text-center' :
                 'text-2xl md:text-3xl lg:text-4xl text-center')
              : (settings.textSize === 'small' ? 'text-sm md:text-base lg:text-lg text-left' :
                 settings.textSize === 'large' ? 'text-lg md:text-xl lg:text-2xl text-left' :
                 'text-base md:text-lg lg:text-xl text-left')
          } text-foreground drop-shadow-sm`} style={novelFontStyle}>
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