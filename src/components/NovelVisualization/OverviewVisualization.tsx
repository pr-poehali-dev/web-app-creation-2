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
  pathsStats: Array<{
    path: { id: string; name: string; description?: string };
    activatedBy: number;
    requiredBy: number;
  }>;
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
  pathsStats,
  itemsStats,
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

          {/* Эпизоды */}
          {novel.episodes.map((episode, epIndex) => {
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

          {/* Пути */}
          {pathsStats.map((pathStat, index) => {
            const posX = 600 + (index % 3) * 250;
            const posY = 100 + Math.floor(index / 3) * 200;
            
            return (
              <div
                key={pathStat.path.id}
                className="absolute"
                style={{
                  left: `${posX * scale + offset.x}px`,
                  top: `${posY * scale + offset.y}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
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

          {/* Предметы */}
          {itemsStats.map((itemStat, index) => {
            const posX = 1200 + (index % 3) * 250;
            const posY = 100 + Math.floor(index / 3) * 220;
            
            return (
              <div
                key={itemStat.item.id}
                className="absolute"
                style={{
                  left: `${posX * scale + offset.x}px`,
                  top: `${posY * scale + offset.y}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
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

          {/* Выборы */}
          {choicesStats.map((choice, index) => {
            const posX = 1800 + (index % 2) * 280;
            const posY = 100 + Math.floor(index / 2) * 180;
            
            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${posX * scale + offset.x}px`,
                  top: `${posY * scale + offset.y}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
              >
                <Card className="w-64 p-3 shadow-lg bg-purple-500/5 border-purple-500/30 hover:shadow-xl transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="GitMerge" size={16} className="text-purple-500" />
                      </div>
                      <Badge variant="outline" className="text-xs">{choice.episodeTitle}</Badge>
                    </div>
                    <p className="text-xs font-medium line-clamp-2">{choice.question}</p>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1">
                        <Icon name="List" size={10} className="text-blue-400" />
                        <span>{choice.optionsCount}</span>
                      </div>
                      {choice.hasPathConditions && (
                        <Icon name="GitBranch" size={10} className="text-green-400" title="Условия путей" />
                      )}
                      {choice.hasItemConditions && (
                        <Icon name="Package" size={10} className="text-orange-400" title="Условия предметов" />
                      )}
                    </div>
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
        💡 Перетаскивайте эпизоды для изменения расположения. На карте: 📄 эпизоды, 🟢 пути, 🔵 предметы, 🟣 выборы.
      </div>
    </div>
  );
}

export default OverviewVisualization;
