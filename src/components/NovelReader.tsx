import { useState, useEffect, useCallback } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings } from '@/types/settings';
import TypewriterText from './TypewriterText';
import DialogueBox from './DialogueBox';
import ChoiceBox from './ChoiceBox';
import ItemBox from './ItemBox';
import ImageBox from './ImageBox';
import MusicPlayer from './MusicPlayer';

interface NovelReaderProps {
  novel: Novel;
  settings: UserSettings;
  onUpdate: (novel: Novel) => void;
}

function NovelReader({ novel, settings, onUpdate }: NovelReaderProps) {
  const [isTyping, setIsTyping] = useState(true);
  const [skipTyping, setSkipTyping] = useState(false);

  const currentEpisode = novel.episodes.find(ep => ep.id === novel.currentEpisodeId);
  const currentParagraph = currentEpisode?.paragraphs[novel.currentParagraphIndex];

  const goToNextParagraph = useCallback(() => {
    if (!currentEpisode) return;

    if (novel.currentParagraphIndex < currentEpisode.paragraphs.length - 1) {
      onUpdate({
        ...novel,
        currentParagraphIndex: novel.currentParagraphIndex + 1
      });
      setIsTyping(true);
      setSkipTyping(false);
    }
  }, [novel, currentEpisode, onUpdate]);

  const goToPreviousParagraph = useCallback(() => {
    if (novel.currentParagraphIndex > 0) {
      onUpdate({
        ...novel,
        currentParagraphIndex: novel.currentParagraphIndex - 1
      });
      setIsTyping(true);
      setSkipTyping(false);
    }
  }, [novel, onUpdate]);

  const handleChoice = useCallback((nextEpisodeId?: string) => {
    if (nextEpisodeId) {
      onUpdate({
        ...novel,
        currentEpisodeId: nextEpisodeId,
        currentParagraphIndex: 0
      });
      setIsTyping(true);
      setSkipTyping(false);
    } else {
      goToNextParagraph();
    }
  }, [novel, onUpdate, goToNextParagraph]);

  const handleClick = useCallback(() => {
    if (isTyping) {
      setSkipTyping(true);
      setIsTyping(false);
    } else {
      if (currentParagraph?.type !== 'choice') {
        goToNextParagraph();
      }
    }
  }, [isTyping, currentParagraph, goToNextParagraph]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isTyping && currentParagraph?.type !== 'choice') {
          goToNextParagraph();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousParagraph();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, currentParagraph, goToNextParagraph, goToPreviousParagraph]);

  if (!currentEpisode || !currentParagraph) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Эпизод не найден</h2>
          <p className="text-muted-foreground">Проверьте структуру новеллы</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 cursor-pointer"
      onClick={handleClick}
    >
      {currentEpisode.backgroundMusic && (
        <MusicPlayer audioSrc={currentEpisode.backgroundMusic} volume={settings.musicVolume} />
      )}

      <div className="w-full max-w-4xl">
        {currentParagraph.type === 'text' && (
          <div className={`novel-text leading-relaxed text-foreground p-8 ${
            settings.textSize === 'small' ? 'text-lg md:text-xl' :
            settings.textSize === 'large' ? 'text-2xl md:text-3xl' :
            'text-xl md:text-2xl'
          }`}>
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
          />
        )}

        {currentParagraph.type === 'choice' && (
          <ChoiceBox
            question={currentParagraph.question}
            options={currentParagraph.options}
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

        <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
          {novel.currentParagraphIndex + 1} / {currentEpisode.paragraphs.length}
        </div>

        {!isTyping && currentParagraph.type !== 'choice' && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground animate-pulse">
            Нажмите или → для продолжения
          </div>
        )}
      </div>
    </div>
  );
}

export default NovelReader;