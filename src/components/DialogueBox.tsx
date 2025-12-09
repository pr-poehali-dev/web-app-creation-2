import { Card, CardContent } from '@/components/ui/card';
import TypewriterText from './TypewriterText';

interface DialogueBoxProps {
  characterName: string;
  characterImage?: string;
  text: string;
  skipTyping?: boolean;
  onComplete?: () => void;
}

function DialogueBox({ characterName, characterImage, text, skipTyping, onComplete }: DialogueBoxProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-primary/30 shadow-2xl animate-scale-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {characterImage && (
            <div className="text-6xl flex-shrink-0 animate-scale-in">
              {characterImage}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary mb-3">
              {characterName}
            </h3>
            <p className="novel-text text-lg leading-relaxed text-foreground">
              <TypewriterText 
                text={text}
                speed={50}
                skipTyping={skipTyping}
                onComplete={onComplete}
              />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DialogueBox;
