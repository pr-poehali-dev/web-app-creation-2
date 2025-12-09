import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TypewriterText from './TypewriterText';

interface ItemBoxProps {
  name: string;
  description: string;
  imageUrl?: string;
  skipTyping?: boolean;
  onComplete?: () => void;
}

function ItemBox({ name, description, imageUrl, skipTyping, onComplete }: ItemBoxProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-accent/50 shadow-2xl animate-scale-in">
      <CardContent className="p-8 text-center">
        <Badge variant="secondary" className="mb-4 text-sm">
          Получен предмет
        </Badge>
        {imageUrl && (
          <div className="text-8xl mb-6 animate-scale-in">
            {imageUrl}
          </div>
        )}
        <h3 className="text-2xl font-bold text-primary mb-4">
          {name}
        </h3>
        <p className="novel-text text-lg leading-relaxed text-muted-foreground">
          <TypewriterText 
            text={description}
            speed={50}
            skipTyping={skipTyping}
            onComplete={onComplete}
          />
        </p>
      </CardContent>
    </Card>
  );
}

export default ItemBox;
