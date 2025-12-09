import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TypewriterText from './TypewriterText';
import ZoomableImage from './ZoomableImage';

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
    <Card className="bg-gradient-to-br from-card via-secondary/10 to-accent/20 backdrop-blur-sm border-0 shadow-2xl animate-scale-in">
      <CardContent className="p-10 text-center">
        <Badge variant="default" className="mb-6 text-sm bg-primary text-primary-foreground border-0 shadow-lg px-4 py-1.5 rounded-full font-semibold">
          Получен предмет
        </Badge>
        {imageUrl && (
          <div className="mb-8 animate-scale-in flex justify-center p-6 bg-background/50 rounded-3xl border-0 shadow-inner">
            {imageUrl.startsWith('data:') ? (
              <ZoomableImage
                src={imageUrl}
                alt={name}
                className="max-w-xs max-h-64 object-contain rounded-2xl drop-shadow-2xl"
              />
            ) : (
              <div className="text-9xl drop-shadow-2xl">{imageUrl}</div>
            )}
          </div>
        )}
        <h3 className="text-4xl font-bold text-primary mb-6 drop-shadow-lg">
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