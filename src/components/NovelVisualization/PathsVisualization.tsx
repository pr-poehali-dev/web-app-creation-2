import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface PathsVisualizationProps {
  pathsStats: Array<{
    path: { id: string; name: string; description?: string };
    activatedBy: number;
    requiredBy: number;
  }>;
}

function PathsVisualization({ pathsStats }: PathsVisualizationProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Визуализация путей</CardTitle>
        </CardHeader>
        <CardContent>
          {pathsStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pathsStats.map(({ path, activatedBy, requiredBy }) => (
                <Card key={path.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="GitBranch" size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-2 truncate">{path.name}</h4>
                        {path.description && (
                          <p className="text-xs text-muted-foreground mb-3">{path.description}</p>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="Unlock" size={14} className="text-green-500" />
                            <span className="text-muted-foreground">Активируется:</span>
                            <Badge variant="secondary" className="text-xs">{activatedBy}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="Lock" size={14} className="text-orange-500" />
                            <span className="text-muted-foreground">Требуется:</span>
                            <Badge variant="secondary" className="text-xs">{requiredBy}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="GitBranch" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Пути не созданы</p>
              <p className="text-sm mt-2">Создайте пути во вкладке "Пути"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PathsVisualization;
