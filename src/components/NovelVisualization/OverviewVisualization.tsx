import { Novel, Episode } from '@/types/novel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import OverviewConnections from './OverviewConnections';
import OverviewEpisodeCards from './OverviewEpisodeCards';
import OverviewPathItemCards from './OverviewPathItemCards';
import OverviewStatistics from './OverviewStatistics';

interface OverviewVisualizationProps {
  novel: Novel;
  scale: number;
  offset: { x: number; y: number };
  setScale: (scale: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  draggedItem: { type: 'episode' | 'path' | 'item' | 'choice'; id: string } | null;
  containerRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleItemDragStart: (type: 'episode' | 'path' | 'item' | 'choice', id: string, e: React.MouseEvent) => void;
  allConnections: { from: Episode; to: Episode; type: 'choice' | 'next' }[];
  getConnectionsForEpisode: (episodeId: string) => { from: Episode; to: Episode }[];
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
  onEpisodeClick?: (episodeId: string) => void;
}

function OverviewVisualization({
  novel,
  scale,
  offset,
  setScale,
  setOffset,
  containerRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleItemDragStart,
  allConnections,
  getConnectionsForEpisode,
  pathsStats,
  itemsStats,
  choicesStats,
  onEpisodeClick
}: OverviewVisualizationProps) {
  
  const getPosition = (type: string, id: string, defaultX: number, defaultY: number) => {
    if (type === 'path') {
      const path = pathsStats.find(p => p.path.id === id);
      return path?.path.position || { x: defaultX, y: defaultY };
    } else if (type === 'item') {
      const item = itemsStats.find(i => i.item.id === id);
      return item?.item.position || { x: defaultX, y: defaultY };
    } else if (type === 'choice') {
      const choice = choicesStats.find(c => c.choiceId === id);
      return choice?.position || { x: defaultX, y: defaultY };
    }
    return { x: defaultX, y: defaultY };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Общая карта новеллы</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setScale(Math.min(2, scale + 0.1))}>
            <Icon name="ZoomIn" size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
            <Icon name="ZoomOut" size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}>
            <Icon name="Maximize2" size={16} />
          </Button>
        </div>
      </div>

      <Card className="relative overflow-hidden bg-muted/20" style={{ height: '700px' }}>
        <div
          ref={containerRef}
          className="w-full h-full cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <OverviewConnections
            novel={novel}
            scale={scale}
            offset={offset}
            allConnections={allConnections}
            pathsStats={pathsStats}
            itemsStats={itemsStats}
            choicesStats={choicesStats}
            getPosition={getPosition}
          />

          <OverviewEpisodeCards
            novel={novel}
            scale={scale}
            offset={offset}
            handleItemDragStart={handleItemDragStart}
            getConnectionsForEpisode={getConnectionsForEpisode}
            onEpisodeClick={onEpisodeClick}
          />

          <OverviewPathItemCards
            scale={scale}
            offset={offset}
            handleItemDragStart={handleItemDragStart}
            pathsStats={pathsStats}
            itemsStats={itemsStats}
            choicesStats={choicesStats}
            getPosition={getPosition}
          />
        </div>
      </Card>

      <OverviewStatistics novel={novel} choicesStatsLength={choicesStats.length} />

      <div className="text-xs text-muted-foreground">
        💡 Перетаскивайте любые элементы для изменения их расположения. Линии показывают связи между элементами.
      </div>
    </div>
  );
}

export default OverviewVisualization;