import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Novel } from '@/types/novel';

interface ChoiceBoxProps {
  question: string;
  options: {
    id: string;
    text: string;
    nextEpisodeId?: string;
    nextParagraphIndex?: number;
    requiredPath?: string;
    oneTime?: boolean;
  }[];
  novel: Novel;
  onChoice: (choiceId: string, pathId: string | undefined, oneTime: boolean | undefined, nextEpisodeId?: string, nextParagraphIndex?: number) => void;
}

function ChoiceBox({ question, options, novel, onChoice }: ChoiceBoxProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-2xl animate-scale-in">
      <CardContent className="p-4 md:p-10">
        <h3 className="text-lg md:text-2xl font-bold text-center mb-6 md:mb-8 text-foreground">
          {question}
        </h3>
        <div className="space-y-3 md:space-y-4">
          {options.map((option, index) => {
            const activatesPath = option.requiredPath ? novel.paths?.find(p => p.id === option.requiredPath) : null;
            return (
              <div key={option.id} className="relative">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-sm md:text-base py-4 md:py-6 rounded-2xl border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-[1.02] hover:shadow-xl animate-fade-in text-foreground font-semibold"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChoice(option.id, option.requiredPath, option.oneTime, option.nextEpisodeId, option.nextParagraphIndex);
                  }}
                >
                  <span className="flex-1">{option.text}</span>
                  {activatesPath && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 text-xs"
                      style={{
                        backgroundColor: activatesPath.color ? `${activatesPath.color}30` : undefined,
                        borderColor: activatesPath.color || undefined,
                        color: activatesPath.color || undefined
                      }}
                    >
                      <Icon name="GitBranch" size={12} className="mr-1" />
                      {activatesPath.name}
                    </Badge>
                  )}
                  {option.oneTime && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      <Icon name="AlertCircle" size={12} className="mr-1" />
                      Одноразовый
                    </Badge>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChoiceBox;