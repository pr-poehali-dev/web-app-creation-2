import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ItemsVisualizationProps {
  itemsStats: Array<{
    item: {
      id: string;
      name: string;
      description: string;
      imageUrl?: string;
      itemType: 'collectible' | 'story';
    };
    usedInEpisodes: number;
    gainActions: number;
    loseActions: number;
  }>;
}

function ItemsVisualization({ itemsStats }: ItemsVisualizationProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Визуализация предметов</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemsStats.map(({ item, usedInEpisodes, gainActions, loseActions }) => (
                <Card key={item.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          item.imageUrl.startsWith('http') || item.imageUrl.startsWith('data:') ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="text-2xl">{item.imageUrl}</div>
                          )
                        ) : (
                          <Icon name="Package" size={24} className="text-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {item.itemType === 'story' ? 'Сюжетный' : 'Коллекционный'}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="MapPin" size={14} className="text-blue-500" />
                            <span className="text-muted-foreground">Эпизодов:</span>
                            <Badge variant="secondary" className="text-xs">{usedInEpisodes}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="Plus" size={14} className="text-green-500" />
                            <span className="text-muted-foreground">Получений:</span>
                            <Badge variant="secondary" className="text-xs">{gainActions}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="Minus" size={14} className="text-red-500" />
                            <span className="text-muted-foreground">Потерь:</span>
                            <Badge variant="secondary" className="text-xs">{loseActions}</Badge>
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
              <Icon name="Package" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Предметы не созданы</p>
              <p className="text-sm mt-2">Создайте предметы во вкладке "Библиотека"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ItemsVisualization;
