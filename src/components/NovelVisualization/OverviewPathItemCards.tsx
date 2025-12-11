import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface OverviewPathItemCardsProps {
  scale: number;
  offset: { x: number; y: number };
  handleItemDragStart: (type: 'episode' | 'path' | 'item' | 'choice', id: string, e: React.MouseEvent) => void;
  pathsStats: Array<{
    path: { id: string; name: string; description?: string; position?: { x: number; y: number } };
    activatedBy: number;
    requiredBy: number;
    relatedEpisodes: string[];
    relatedChoices: Array<{ episodeId: string; choiceId: string }>;
  }>;
  itemsStats: Array<{
    item: {
      id: string;
      name: string;
      description: string;
      imageUrl?: string;
      itemType: 'collectible' | 'story';
      position?: { x: number; y: number };
    };
    usedInEpisodes: number;
    gainActions: number;
    loseActions: number;
    relatedEpisodes: string[];
    relatedChoices: Array<{ episodeId: string; choiceId: string }>;
  }>;
  choicesStats: Array<{
    episodeId: string;
    episodeTitle: string;
    choiceId: string;
    question: string;
    optionsCount: number;
    hasPathConditions: boolean;
    hasItemConditions: boolean;
    relatedEpisodes: string[];
    relatedPaths: string[];
    relatedItems: string[];
    position?: { x: number; y: number };
  }>;
  getPosition: (type: string, id: string, defaultX: number, defaultY: number) => { x: number; y: number };
}

function OverviewPathItemCards({
  scale,
  offset,
  handleItemDragStart,
  pathsStats,
  itemsStats,
  choicesStats,
  getPosition
}: OverviewPathItemCardsProps) {
  return (
    <>
      {pathsStats.map((pathStat, index) => {
        const pos = getPosition('path', pathStat.path.id, 600 + (index % 3) * 250, 100 + Math.floor(index / 3) * 200);
        
        return (
          <div
            key={pathStat.path.id}
            className="absolute cursor-move"
            style={{
              left: `${pos.x * scale + offset.x}px`,
              top: `${pos.y * scale + offset.y}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              zIndex: 10
            }}
            onMouseDown={(e) => handleItemDragStart('path', pathStat.path.id, e)}
          >
            <Card className="w-48 p-3 shadow-lg bg-green-500/5 border-green-500/30 hover:shadow-xl transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="GitBranch" size={16} className="text-green-500" />
                  </div>
                  <h4 className="font-semibold text-sm truncate">{pathStat.path.name}</h4>
                </div>
                {pathStat.path.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{pathStat.path.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Icon name="Unlock" size={10} className="text-green-400" />
                    <span>{pathStat.activatedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Lock" size={10} className="text-orange-400" />
                    <span>{pathStat.requiredBy}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      })}

      {itemsStats.map((itemStat, index) => {
        const pos = getPosition('item', itemStat.item.id, 1200 + (index % 3) * 250, 100 + Math.floor(index / 3) * 220);
        
        return (
          <div
            key={itemStat.item.id}
            className="absolute cursor-move"
            style={{
              left: `${pos.x * scale + offset.x}px`,
              top: `${pos.y * scale + offset.y}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              zIndex: 10
            }}
            onMouseDown={(e) => handleItemDragStart('item', itemStat.item.id, e)}
          >
            <Card className="w-48 p-3 shadow-lg bg-blue-500/5 border-blue-500/30 hover:shadow-xl transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    {itemStat.item.imageUrl ? (
                      itemStat.item.imageUrl.startsWith('http') || itemStat.item.imageUrl.startsWith('data:') ? (
                        <img src={itemStat.item.imageUrl} alt={itemStat.item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-lg">{itemStat.item.imageUrl}</div>
                      )
                    ) : (
                      <Icon name="Package" size={16} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs truncate">{itemStat.item.name}</h4>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {itemStat.item.itemType === 'story' ? 'Сюжет' : 'Колл.'}
                    </Badge>
                  </div>
                </div>
                {itemStat.item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{itemStat.item.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Icon name="MapPin" size={10} className="text-blue-400" />
                    <span>{itemStat.usedInEpisodes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Plus" size={10} className="text-green-400" />
                    <span>{itemStat.gainActions}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Minus" size={10} className="text-red-400" />
                    <span>{itemStat.loseActions}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      })}

      {choicesStats.map((choiceStat, index) => {
        const pos = getPosition('choice', choiceStat.choiceId, 1800 + (index % 3) * 250, 100 + Math.floor(index / 3) * 220);
        
        return (
          <div
            key={choiceStat.choiceId}
            className="absolute cursor-move"
            style={{
              left: `${pos.x * scale + offset.x}px`,
              top: `${pos.y * scale + offset.y}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              zIndex: 10
            }}
            onMouseDown={(e) => handleItemDragStart('choice', choiceStat.choiceId, e)}
          >
            <Card className="w-48 p-3 shadow-lg bg-purple-500/5 border-purple-500/30 hover:shadow-xl transition-all">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="GitMerge" size={16} className="text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-xs truncate">{choiceStat.question}</h4>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="text-[10px]">
                    {choiceStat.optionsCount} вариантов
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {choiceStat.hasPathConditions && (
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 border-green-500/30">
                      <Icon name="GitBranch" size={8} className="mr-1" />
                      Пути
                    </Badge>
                  )}
                  {choiceStat.hasItemConditions && (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30">
                      <Icon name="Package" size={8} className="mr-1" />
                      Предметы
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </>
  );
}

export default OverviewPathItemCards;