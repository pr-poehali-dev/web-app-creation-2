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
  isTopMerged?: boolean;
}

function ItemBox({ name, description, imageUrl, skipTyping, onComplete, textSpeed = 50, isTopMerged = false }: ItemBoxProps) {

  return (
    <Card className="bg-gradient-to-br from-card via-secondary/10 to-accent/20 backdrop-blur-sm border-0 shadow-2xl animate-scale-in max-w-md mx-auto rounded-xl md:rounded-2xl">
      <CardContent className={isTopMerged ? "p-3 md:p-4 lg:p-6 text-center" : "p-3 md:p-4 lg:p-8 text-center"}>
        <Badge variant="default" className={isTopMerged 
          ? "mb-2 md:mb-3 lg:mb-4 text-xs md:text-xs bg-primary text-primary-foreground border-0 shadow-lg px-2 md:px-3 py-0.5 md:py-1 rounded-full font-semibold"
          : "mb-3 md:mb-4 lg:mb-6 text-xs md:text-sm bg-primary text-primary-foreground border-0 shadow-lg px-2 md:px-3 lg:px-4 py-0.5 md:py-1 lg:py-1.5 rounded-full font-semibold"
        }>
          Получен предмет
        </Badge>
        <div className={isTopMerged 
          ? "mb-3 md:mb-4 lg:mb-5 animate-scale-in flex justify-center p-2 md:p-3 lg:p-4 bg-background/50 rounded-xl md:rounded-2xl border-0 shadow-inner"
          : "mb-4 md:mb-6 lg:mb-8 animate-scale-in flex justify-center p-3 md:p-4 lg:p-6 bg-background/50 rounded-2xl md:rounded-3xl border-0 shadow-inner"
        }>
          {imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) ? (
            <ZoomableImage
              src={imageUrl}
              alt={name}
              className={isTopMerged 
                ? "max-w-[100px] md:max-w-[140px] lg:max-w-[200px] max-h-20 md:max-h-28 lg:max-h-36 object-contain rounded-lg md:rounded-xl drop-shadow-2xl"
                : "max-w-[140px] md:max-w-[200px] lg:max-w-xs max-h-32 md:max-h-48 lg:max-h-64 object-contain rounded-xl md:rounded-2xl drop-shadow-2xl"
              }
            />
          ) : imageUrl ? (
            <div className={isTopMerged ? "text-4xl md:text-5xl lg:text-7xl drop-shadow-2xl" : "text-5xl md:text-6xl lg:text-9xl drop-shadow-2xl"}>{imageUrl}</div>
          ) : (
            <div className={isTopMerged 
              ? "w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg md:rounded-xl flex items-center justify-center text-muted-foreground"
              : "w-32 h-32 md:w-48 md:h-48 bg-muted rounded-xl md:rounded-2xl flex items-center justify-center text-muted-foreground"
            }>
              <div className={isTopMerged ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl"}>📦</div>
            </div>
          )}
        </div>
        <h3 className={isTopMerged 
          ? "text-base md:text-lg lg:text-xl font-bold text-primary mb-1.5 md:mb-2 lg:mb-3 drop-shadow-lg"
          : "text-lg md:text-xl lg:text-3xl font-bold text-primary mb-3 md:mb-4 lg:mb-6 drop-shadow-lg"
        }>
          {name}
        </h3>
        <p className={`novel-text leading-snug md:leading-relaxed text-foreground font-medium ${
          isTopMerged ? "text-sm md:text-base lg:text-lg" : "text-sm md:text-base lg:text-lg"
        }`}>
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