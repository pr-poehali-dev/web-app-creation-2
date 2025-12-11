import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ChoicesVisualizationProps {
  choicesStats: Array<{
    episodeTitle: string;
    question: string;
    optionsCount: number;
    hasPathConditions: boolean;
    hasItemConditions: boolean;
  }>;
}

function ChoicesVisualization({ choicesStats }: ChoicesVisualizationProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Визуализация выборов</CardTitle>
        </CardHeader>
        <CardContent>
          {choicesStats.length > 0 ? (
            <div className="space-y-3">
              {choicesStats.map((choice, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="GitMerge" size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{choice.episodeTitle}</Badge>
                        </div>
                        <h4 className="font-medium text-foreground mb-3">{choice.question}</h4>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="List" size={14} className="text-blue-500" />
                            <span className="text-muted-foreground">Вариантов:</span>
                            <Badge variant="secondary" className="text-xs">{choice.optionsCount}</Badge>
                          </div>
                          {choice.hasPathConditions && (
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="GitBranch" size={14} className="text-green-500" />
                              <span className="text-xs text-muted-foreground">Есть условия путей</span>
                            </div>
                          )}
                          {choice.hasItemConditions && (
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Package" size={14} className="text-orange-500" />
                              <span className="text-xs text-muted-foreground">Есть условия предметов</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="GitMerge" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Выборы не созданы</p>
              <p className="text-sm mt-2">Добавьте параграфы с выбором в эпизоды</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ChoicesVisualization;
