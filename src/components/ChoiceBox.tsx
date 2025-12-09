import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChoiceBoxProps {
  question: string;
  options: {
    id: string;
    text: string;
    nextEpisodeId?: string;
  }[];
  onChoice: (nextEpisodeId?: string) => void;
}

function ChoiceBox({ question, options, onChoice }: ChoiceBoxProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-primary/30 shadow-2xl animate-scale-in">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-center mb-6 text-foreground">
          {question}
        </h3>
        <div className="space-y-3">
          {options.map((option, index) => (
            <Button
              key={option.id}
              variant="outline"
              size="lg"
              className="w-full text-lg py-6 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={(e) => {
                e.stopPropagation();
                onChoice(option.nextEpisodeId);
              }}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChoiceBox;
