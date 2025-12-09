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
      <CardContent className="p-4 md:p-10 text-center">
        <Badge variant="default" className="mb-4 md:mb-6 text-xs md:text-sm bg-primary text-primary-foreground border-0 shadow-lg px-3 md:px-4 py-1 md:py-1.5 rounded-full font-semibold">
          Получен предмет
        </Badge>
        <div className="mb-6 md:mb-8 animate-scale-in flex justify-center p-4 md:p-6 bg-background/50 rounded-3xl border-0 shadow-inner">
          {imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) ? (
            <ZoomableImage
              src={imageUrl}
              alt={name}
              className="max-w-[200px] md:max-w-xs max-h-48 md:max-h-64 object-contain rounded-2xl drop-shadow-2xl"
            />
          ) : imageUrl ? (
            <div className="text-6xl md:text-9xl drop-shadow-2xl">{imageUrl}</div>
          ) : (
            <div className="w-48 h-48 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
              <div className="text-6xl">📦</div>
            </div>
          )}
        </div>
        <h3 className="text-2xl md:text-4xl font-bold text-primary mb-4 md:mb-6 drop-shadow-lg">
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