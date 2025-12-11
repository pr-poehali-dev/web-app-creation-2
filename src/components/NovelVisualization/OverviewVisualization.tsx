import { Novel, Episode } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface OverviewVisualizationProps {
  novel: Novel;
  scale: number;
  offset: { x: number; y: number };
  setScale: (scale: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  draggedEpisode: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleEpisodeDragStart: (episodeId: string, e: React.MouseEvent) => void;
  allConnections: { from: Episode; to: Episode; type: 'choice' | 'next' }[];
  getConnectionsForEpisode: (episodeId: string) => { from: Episode; to: Episode }[];
  choicesStats: Array<{
    episodeTitle: string;
    question: string;
    optionsCount: number;
    hasPathConditions: boolean;
    hasItemConditions: boolean;
  }>;
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
  handleEpisodeDragStart,
  allConnections,
  getConnectionsForEpisode,
  choicesStats
}: OverviewVisualizationProps) {
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
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {allConnections.map((conn, idx) => {
              const fromX = conn.from.position.x * scale + offset.x + 100;
              const fromY = conn.from.position.y * scale + offset.y + 40;
              const toX = conn.to.position.x * scale + offset.x + 100;
              const toY = conn.to.position.y * scale + offset.y + 40;

              return (
                <g key={idx}>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke={conn.type === 'next' ? "hsl(var(--secondary))" : "hsl(var(--primary))"}
                    strokeWidth={conn.type === 'next' ? "3" : "2"}
                    strokeOpacity={conn.type === 'next' ? "0.6" : "0.3"}
                    strokeDasharray={conn.type === 'next' ? "5,5" : "0"}
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--primary))" fillOpacity="0.3" />
              </marker>
            </defs>
          </svg>

          {novel.episodes.map((episode) => {
            const connections = getConnectionsForEpisode(episode.id);
            const episodePaths = novel.paths?.filter(p => episode.requiredPath === p.id) || [];
            const episodeItems: string[] = [];
            const episodeChoices: number[] = [];
            
            episode.paragraphs.forEach(para => {
              if (para.type === 'itemBox' && para.itemId) {
                if (!episodeItems.includes(para.itemId)) episodeItems.push(para.itemId);
              }
              if (para.type === 'choice') {
                episodeChoices.push(para.options.length);
              }
            });
            
            return (
              <div
                key={episode.id}
                className="absolute cursor-move"
                style={{
                  left: `${episode.position.x * scale + offset.x}px`,
                  top: `${episode.position.y * scale + offset.y}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
                onMouseDown={(e) => handleEpisodeDragStart(episode.id, e)}
              >
                <Card 
                  className={`w-56 p-4 shadow-lg transition-all ${
                    episode.id === novel.currentEpisodeId 
                      ? 'border-primary border-2 bg-primary/10' 
                      : 'bg-card hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm truncate">{episode.title}</h3>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <Icon name="FileText" size={10} className="mr-1" />
                        {episode.paragraphs.length}
                      </Badge>
                      
                      {episodePaths.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                          <Icon name="GitBranch" size={10} className="mr-1" />
                          {episodePaths.length}
                        </Badge>
                      )}
                      
                      {episodeItems.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                          <Icon name="Package" size={10} className="mr-1" />
                          {episodeItems.length}
                        </Badge>
                      )}
                      
                      {episodeChoices.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                          <Icon name="GitMerge" size={10} className="mr-1" />
                          {episodeChoices.length}
                        </Badge>
                      )}
                    </div>
                    
                    {episodePaths.length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {episodePaths.map(path => (
                          <div key={path.id} className="flex items-center gap-1">
                            <Icon name="Lock" size={10} className="text-green-500" />
                            <span className="truncate">{path.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {connections.length > 0 && (
                      <p className="text-xs text-primary">
                        → {connections.length} связей
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="Map" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{novel.episodes.length}</p>
                <p className="text-xs text-muted-foreground">Эпизодов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Icon name="GitBranch" size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{novel.paths?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Путей</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Icon name="Package" size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{novel.library.items.length}</p>
                <p className="text-xs text-muted-foreground">Предметов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Icon name="GitMerge" size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{choicesStats.length}</p>
                <p className="text-xs text-muted-foreground">Выборов</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground">
        💡 Перетаскивайте эпизоды для изменения расположения. Цветные иконки показывают: 🟢 пути, 🔵 предметы, 🟣 выборы.
      </div>
    </div>
  );
}

export default OverviewVisualization;
