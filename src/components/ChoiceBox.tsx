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
    activatesPath?: string;
    oneTime?: boolean;
  }[];
  novel: Novel;
  onChoice: (choiceId: string, pathId: string | undefined, oneTime: boolean | undefined, nextEpisodeId?: string, nextParagraphIndex?: number) => void;
}

function ChoiceBox({ question, options, novel, onChoice }: ChoiceBoxProps) {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-2xl animate-scale-in rounded-xl md:rounded-2xl">
      <CardContent className="p-3 md:p-6 lg:p-10">
        <h3 className="text-base md:text-lg lg:text-2xl font-bold text-center mb-4 md:mb-6 lg:mb-8 text-foreground">
          {question}
        </h3>
        <div className="space-y-2 md:space-y-3 lg:space-y-4">
          {options.map((option, index) => {
            const activatesPath = option.activatesPath ? novel.paths?.find(p => p.id === option.activatesPath) : null;
            return (
              <div key={option.id} className="relative">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-xs md:text-sm lg:text-base py-3 md:py-4 lg:py-6 rounded-xl md:rounded-2xl border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-[1.02] hover:shadow-xl animate-fade-in text-foreground font-semibold"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChoice(option.id, option.activatesPath, option.oneTime, option.nextEpisodeId, option.nextParagraphIndex);
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