import { Card, CardContent } from '@/components/ui/card';
import TypewriterText from './TypewriterText';

interface DialogueBoxProps {
  characterName: string;
  characterImage?: string;
  text: string;
  skipTyping?: boolean;
  onComplete?: () => void;
  textSpeed?: number;
}

function DialogueBox({ characterName, characterImage, text, skipTyping, onComplete, textSpeed = 50 }: DialogueBoxProps) {
  return (
    <div className="relative flex items-end gap-4">
      {characterImage && (
        <div className="flex flex-col items-center gap-2 mb-4 animate-scale-in">
          {characterImage.startsWith('data:') ? (
            <img 
              src={characterImage} 
              alt={characterName}
              className="w-32 h-32 object-cover rounded-lg shadow-2xl border-2 border-primary/30"
            />
          ) : (
            <div className="text-8xl">{characterImage}</div>
          )}
          <span className="text-sm font-bold text-primary bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/30">
            {characterName}
          </span>
        </div>
      )}
      
      <Card className="flex-1 bg-card/95 backdrop-blur-sm border-primary/30 shadow-2xl animate-scale-in">
        <CardContent className="p-6">
          {!characterImage && (
            <h3 className="text-lg font-bold text-primary mb-3">
              {characterName}
            </h3>
          )}
          <p className="novel-text text-lg leading-relaxed text-foreground">
            <TypewriterText 
              text={text}
              speed={textSpeed}
              skipTyping={skipTyping}
              onComplete={onComplete}
            />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default DialogueBox;
