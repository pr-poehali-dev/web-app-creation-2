import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChoiceBoxProps {
  question: string;
  options: {
    id: string;
    text: string;
    nextEpisodeId?: string;
    nextParagraphIndex?: number;
  }[];
  onChoice: (nextEpisodeId?: string, nextParagraphIndex?: number) => void;
}

function ChoiceBox({ question, options, onChoice }: ChoiceBoxProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-2xl animate-scale-in">
      <CardContent className="p-4 md:p-10">
        <h3 className="text-lg md:text-2xl font-bold text-center mb-6 md:mb-8 text-foreground">
          {question}
        </h3>
        <div className="space-y-3 md:space-y-4">
          {options.map((option, index) => (
            <Button
              key={option.id}
              variant="outline"
              size="lg"
              className="w-full text-sm md:text-base py-4 md:py-6 rounded-2xl border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-[1.02] hover:shadow-xl animate-fade-in text-foreground font-semibold"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={(e) => {
                e.stopPropagation();
                onChoice(option.nextEpisodeId, option.nextParagraphIndex);
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