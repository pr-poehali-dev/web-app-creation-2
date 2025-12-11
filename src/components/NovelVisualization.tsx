import { useState, useRef, useEffect, useMemo } from 'react';
import { Novel, Episode } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface NovelVisualizationProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function NovelVisualization({ novel, onUpdate }: NovelVisualizationProps) {
  const [draggedEpisode, setDraggedEpisode] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEpisodeDragStart = (episodeId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setDraggedEpisode(episodeId);
  };

  const handleEpisodeDrag = (e: React.MouseEvent) => {
    if (!draggedEpisode) return;
    
    const episode = novel.episodes.find(ep => ep.id === draggedEpisode);
    if (!episode) return;

    const newX = episode.position.x + e.movementX / scale;
    const newY = episode.position.y + e.movementY / scale;

    onUpdate({
      ...novel,
      episodes: novel.episodes.map(ep =>
        ep.id === draggedEpisode
          ? { ...ep, position: { x: newX, y: newY } }
          : ep
      )
    });
  };

  const handleEpisodeDragEnd = () => {
    setDraggedEpisode(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedEpisode) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedEpisode) {
      handleEpisodeDrag(e);
    } else if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    handleEpisodeDragEnd();
    setIsPanning(false);
  };

  const getConnectionsForEpisode = (episodeId: string) => {
    const connections: { from: Episode; to: Episode }[] = [];
    
    novel.episodes.forEach(episode => {
      episode.paragraphs.forEach(paragraph => {
        if (paragraph.type === 'choice') {
          paragraph.options.forEach(option => {
            if (option.nextEpisodeId) {
              const toEpisode = novel.episodes.find(ep => ep.id === option.nextEpisodeId);
              if (toEpisode && episode.id === episodeId) {
                connections.push({ from: episode, to: toEpisode });
              }
            }
          });
        }
      });
    });

    return connections;
  };

  const allConnections: { from: Episode; to: Episode; type: 'choice' | 'next' }[] = [];
  novel.episodes.forEach(episode => {
    // Связи из выборов
    episode.paragraphs.forEach(paragraph => {
      if (paragraph.type === 'choice') {
        paragraph.options.forEach(option => {
          if (option.nextEpisodeId) {
            const toEpisode = novel.episodes.find(ep => ep.id === option.nextEpisodeId);
            if (toEpisode) {
              allConnections.push({ from: episode, to: toEpisode, type: 'choice' });
            }
          }
        });
      }
    });
    // Связь следующего эпизода
    if (episode.nextEpisodeId) {
      const toEpisode = novel.episodes.find(ep => ep.id === episode.nextEpisodeId);
      if (toEpisode) {
        allConnections.push({ from: episode, to: toEpisode, type: 'next' });
      }
    }
  });

  // Статистика по путям
  const pathsStats = useMemo(() => {
    return novel.paths?.map(path => {
      let activatedBy = 0;
      let requiredBy = 0;
      
      novel.episodes.forEach(ep => {
        if (ep.requiredPath === path.id) requiredBy++;
        ep.paragraphs.forEach(para => {
          if (para.type === 'choice') {
            para.options.forEach(opt => {
              if (opt.activatesPath === path.id) activatedBy++;
              if (opt.requiredPath === path.id) requiredBy++;
            });
          }
        });
      });
      
      return { path, activatedBy, requiredBy };
    }) || [];
  }, [novel.paths, novel.episodes]);

  // Статистика по предметам
  const itemsStats = useMemo(() => {
    return novel.library.items.map(item => {
      let usedInEpisodes = 0;
      let gainActions = 0;
      let loseActions = 0;
      
      novel.episodes.forEach(ep => {
        ep.paragraphs.forEach(para => {
          if (para.type === 'itemBox' && para.itemId === item.id) {
            usedInEpisodes++;
            if (para.action === 'gain') gainActions++;
            if (para.action === 'lose') loseActions++;
          }
        });
      });
      
      return { item, usedInEpisodes, gainActions, loseActions };
    });
  }, [novel.library.items, novel.episodes]);

  // Статистика по выборам
  const choicesStats = useMemo(() => {
    const stats: Array<{
      episodeTitle: string;
      question: string;
      optionsCount: number;
      hasPathConditions: boolean;
      hasItemConditions: boolean;
    }> = [];
    
    novel.episodes.forEach(ep => {
      ep.paragraphs.forEach(para => {
        if (para.type === 'choice') {
          stats.push({
            episodeTitle: ep.title,
            question: para.question,
            optionsCount: para.options.length,
            hasPathConditions: para.options.some(opt => opt.requiredPath || opt.activatesPath),
            hasItemConditions: para.options.some(opt => opt.requiredItem)
          });
        }
      });
    });
    
    return stats;
  }, [novel.episodes]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="episodes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="episodes">
            <Icon name="Map" size={16} className="mr-2" />
            Эпизоды
          </TabsTrigger>
          <TabsTrigger value="paths">
            <Icon name="GitBranch" size={16} className="mr-2" />
            Пути
          </TabsTrigger>
          <TabsTrigger value="items">
            <Icon name="Package" size={16} className="mr-2" />
            Предметы
          </TabsTrigger>
          <TabsTrigger value="choices">
            <Icon name="GitMerge" size={16} className="mr-2" />
            Выборы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="episodes" className="space-y-4">
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
                <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--primary))" fillOpacity="0.3" />
              </marker>
            </defs>
          </svg>

          {novel.episodes.map((episode) => {
            const connections = getConnectionsForEpisode(episode.id);
            
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
                  className={`w-48 p-4 shadow-lg transition-all ${
                    episode.id === novel.currentEpisodeId 
                      ? 'border-primary border-2 bg-primary/10' 
                      : 'bg-card hover:shadow-xl'
                  }`}
                >
                  <h3 className="font-bold mb-2 truncate">{episode.title}</h3>
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
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="choices" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NovelVisualization;