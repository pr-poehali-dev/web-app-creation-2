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
    <Card className="bg-card/95 backdrop-blur-sm border-accent/50 shadow-2xl animate-scale-in">
      <CardContent className="p-8 text-center">
        <Badge variant="secondary" className="mb-4 text-sm">
          Получен предмет
        </Badge>
        {imageUrl && (
          <div className="mb-6 animate-scale-in flex justify-center">
            {imageUrl.startsWith('data:') ? (
              <img 
                src={imageUrl} 
                alt={name}
                className="max-w-xs max-h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="text-8xl">{imageUrl}</div>
            )}
          </div>
        )}
        <h3 className="text-2xl font-bold text-primary mb-4">
          {name}
        </h3>
        <p className="novel-text text-lg leading-relaxed text-muted-foreground">
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