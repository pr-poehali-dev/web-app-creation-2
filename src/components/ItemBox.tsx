import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TypewriterText from './TypewriterText';

interface ItemBoxProps {
  name: string;
  description: string;
  imageUrl?: string;
  skipTyping?: boolean;
  onComplete?: () => void;
  textSpeed?: number;
}

function ItemBox({ name, description, imageUrl, skipTyping, onComplete, textSpeed = 50 }: ItemBoxProps) {
  return (
    <Card className="bg-gradient-to-br from-card via-primary/5 to-accent/10 backdrop-blur-sm border-2 border-primary/60 shadow-2xl shadow-primary/20 animate-scale-in">
      <CardContent className="p-8 text-center">
        <Badge variant="default" className="mb-4 text-sm bg-primary text-primary-foreground animate-pulse">
          Получен предмет
        </Badge>
        {imageUrl && (
          <div className="mb-6 animate-scale-in flex justify-center p-4 bg-background/40 rounded-xl border border-primary/30">
            {imageUrl.startsWith('data:') ? (
              <img 
                src={imageUrl} 
                alt={name}
                className="max-w-xs max-h-64 object-contain rounded-lg drop-shadow-2xl"
              />
            ) : (
              <div className="text-9xl drop-shadow-2xl">{imageUrl}</div>
            )}
          </div>
        )}
        <h3 className="text-3xl font-bold text-primary mb-4 drop-shadow-lg">
          {name}
        </h3>
        <p className="novel-text text-lg leading-relaxed text-foreground font-medium">
          <TypewriterText 
            text={description}
            speed={textSpeed}
            skipTyping={skipTyping}
            onComplete={onComplete}
          />
        </p>
      </CardContent>
    </Card>
  );
}

export default ItemBox;