import { Novel, Episode } from '@/types/novel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EpisodesVisualizationProps {
  novel: Novel;
  scale: number;
  offset: { x: number; y: number };
  setScale: (scale: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleEpisodeDragStart: (episodeId: string, e: React.MouseEvent) => void;
  allConnections: { from: Episode; to: Episode; type: 'choice' | 'next' }[];
  getConnectionsForEpisode: (episodeId: string) => { from: Episode; to: Episode }[];
}

function EpisodesVisualization({
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
  getConnectionsForEpisode
}: EpisodesVisualizationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Карта новеллы</h2>
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

      <Card className="relative overflow-hidden bg-muted/20" style={{ height: '600px' }}>
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
                <circle cx="5" cy="3" r="2" fill="hsl(var(--primary))" fillOpacity="0.5" />
              </marker>
            </defs>
          </svg>

          {novel.episodes.map((episode) => {
            const connections = getConnectionsForEpisode(episode.id);
            const episodePaths = episode.requiredPaths?.map(pathId => 
              novel.paths?.find(p => p.id === pathId)
            ).filter(Boolean) || [];
            
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
                  className={`w-52 p-4 shadow-lg transition-all mb-6 ${
                    episode.id === novel.currentEpisodeId 
                      ? 'border-primary border-2 bg-primary/10' 
                      : 'bg-card hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold truncate flex-1">{episode.title}</h3>
                    {episodePaths.length > 0 && (
                      <div className="flex gap-1 ml-2">
                        {episodePaths.map((path) => (
                          <div
                            key={path!.id}
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: path!.color }}
                            title={path!.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {episode.shortDescription && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {episode.shortDescription}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {episode.paragraphs.length} параграфов
                  </p>
                  {connections.length > 0 && (
                    <p className="text-xs text-primary mt-1">
                      → {connections.length} связей
                    </p>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground">
        💡 Перетаскивайте эпизоды для изменения расположения. Используйте колесо мыши или кнопки для масштабирования.
      </div>
    </div>
  );
}

export default EpisodesVisualization;