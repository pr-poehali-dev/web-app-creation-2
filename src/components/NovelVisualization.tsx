import { useState, useRef, useMemo } from 'react';
import { Novel, Episode } from '@/types/novel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import OverviewVisualization from './NovelVisualization/OverviewVisualization';
import EpisodesVisualization from './NovelVisualization/EpisodesVisualization';
import PathsVisualization from './NovelVisualization/PathsVisualization';
import ItemsVisualization from './NovelVisualization/ItemsVisualization';
import ChoicesVisualization from './NovelVisualization/ChoicesVisualization';

interface NovelVisualizationProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function NovelVisualization({ novel, onUpdate }: NovelVisualizationProps) {
  const [draggedItem, setDraggedItem] = useState<{ type: 'episode' | 'path' | 'item' | 'choice'; id: string } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleItemDragStart = (type: 'episode' | 'path' | 'item' | 'choice', id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setDraggedItem({ type, id });
  };

  const handleItemDrag = (e: React.MouseEvent) => {
    if (!draggedItem) return;
    
    const movementX = e.movementX / scale;
    const movementY = e.movementY / scale;

    if (draggedItem.type === 'episode') {
      const episode = novel.episodes.find(ep => ep.id === draggedItem.id);
      if (!episode) return;

      onUpdate({
        ...novel,
        episodes: novel.episodes.map(ep =>
          ep.id === draggedItem.id
            ? { ...ep, position: { x: ep.position.x + movementX, y: ep.position.y + movementY } }
            : ep
        )
      });
    } else if (draggedItem.type === 'path') {
      const path = novel.paths?.find(p => p.id === draggedItem.id);
      if (!path) return;

      onUpdate({
        ...novel,
        paths: novel.paths?.map(p =>
          p.id === draggedItem.id
            ? { ...p, position: { x: (p.position?.x || 0) + movementX, y: (p.position?.y || 0) + movementY } }
            : p
        )
      });
    } else if (draggedItem.type === 'item') {
      const item = novel.library.items.find(i => i.id === draggedItem.id);
      if (!item) return;

      onUpdate({
        ...novel,
        library: {
          ...novel.library,
          items: novel.library.items.map(i =>
            i.id === draggedItem.id
              ? { ...i, position: { x: (i.position?.x || 0) + movementX, y: (i.position?.y || 0) + movementY } }
              : i
          )
        }
      });
    }
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedItem) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem) {
      handleItemDrag(e);
    } else if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    handleItemDragEnd();
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
      const relatedEpisodes: string[] = [];
      const relatedChoices: Array<{ episodeId: string; choiceId: string }> = [];
      
      novel.episodes.forEach(ep => {
        if (ep.requiredPath === path.id) {
          requiredBy++;
          if (!relatedEpisodes.includes(ep.id)) relatedEpisodes.push(ep.id);
        }
        ep.paragraphs.forEach(para => {
          if (para.type === 'choice') {
            para.options.forEach(opt => {
              if (opt.activatesPath === path.id) {
                activatedBy++;
                relatedChoices.push({ episodeId: ep.id, choiceId: para.id });
              }
              if (opt.requiredPath === path.id) {
                requiredBy++;
                relatedChoices.push({ episodeId: ep.id, choiceId: para.id });
              }
            });
          }
        });
      });
      
      return { path, activatedBy, requiredBy, relatedEpisodes, relatedChoices };
    }) || [];
  }, [novel.paths, novel.episodes]);

  // Статистика по предметам
  const itemsStats = useMemo(() => {
    return novel.library.items.map(item => {
      let usedInEpisodes = 0;
      let gainActions = 0;
      let loseActions = 0;
      const relatedEpisodes: string[] = [];
      const relatedChoices: Array<{ episodeId: string; choiceId: string }> = [];
      
      novel.episodes.forEach(ep => {
        let usedInThisEpisode = false;
        ep.paragraphs.forEach(para => {
          if (para.type === 'itemBox' && para.itemId === item.id) {
            if (!usedInThisEpisode) {
              usedInEpisodes++;
              usedInThisEpisode = true;
              if (!relatedEpisodes.includes(ep.id)) relatedEpisodes.push(ep.id);
            }
            if (para.action === 'gain') gainActions++;
            if (para.action === 'lose') loseActions++;
          }
          if (para.type === 'choice') {
            para.options.forEach(opt => {
              if (opt.requiredItem === item.id) {
                relatedChoices.push({ episodeId: ep.id, choiceId: para.id });
              }
            });
          }
        });
      });
      
      return { item, usedInEpisodes, gainActions, loseActions, relatedEpisodes, relatedChoices };
    });
  }, [novel.library.items, novel.episodes]);

  // Статистика по выборам
  const choicesStats = useMemo(() => {
    const stats: Array<{
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
    }> = [];
    
    novel.episodes.forEach(ep => {
      ep.paragraphs.forEach(para => {
        if (para.type === 'choice') {
          const relatedEpisodes: string[] = [];
          const relatedPaths: string[] = [];
          const relatedItems: string[] = [];
          
          para.options.forEach(opt => {
            if (opt.nextEpisodeId && !relatedEpisodes.includes(opt.nextEpisodeId)) {
              relatedEpisodes.push(opt.nextEpisodeId);
            }
            if (opt.requiredPath && !relatedPaths.includes(opt.requiredPath)) {
              relatedPaths.push(opt.requiredPath);
            }
            if (opt.activatesPath && !relatedPaths.includes(opt.activatesPath)) {
              relatedPaths.push(opt.activatesPath);
            }
            if (opt.requiredItem && !relatedItems.includes(opt.requiredItem)) {
              relatedItems.push(opt.requiredItem);
            }
          });
          
          stats.push({
            episodeId: ep.id,
            episodeTitle: ep.title,
            choiceId: para.id,
            question: para.question,
            optionsCount: para.options.length,
            hasPathConditions: para.options.some(opt => opt.requiredPath || opt.activatesPath),
            hasItemConditions: para.options.some(opt => opt.requiredItem),
            relatedEpisodes,
            relatedPaths,
            relatedItems
          });
        }
      });
    });
    
    return stats;
  }, [novel.episodes]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview">
            <Icon name="LayoutGrid" size={16} className="mr-2" />
            Общая
          </TabsTrigger>
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

        <TabsContent value="overview" className="space-y-4">
          <OverviewVisualization
            novel={novel}
            scale={scale}
            offset={offset}
            setScale={setScale}
            setOffset={setOffset}
            draggedItem={draggedItem}
            containerRef={containerRef}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleItemDragStart={handleItemDragStart}
            allConnections={allConnections}
            getConnectionsForEpisode={getConnectionsForEpisode}
            pathsStats={pathsStats}
            itemsStats={itemsStats}
            choicesStats={choicesStats}
          />
        </TabsContent>

        <TabsContent value="episodes" className="space-y-4">
          <EpisodesVisualization
            novel={novel}
            scale={scale}
            offset={offset}
            setScale={setScale}
            setOffset={setOffset}
            containerRef={containerRef}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleEpisodeDragStart={(id, e) => handleItemDragStart('episode', id, e)}
            allConnections={allConnections}
            getConnectionsForEpisode={getConnectionsForEpisode}
          />
        </TabsContent>

        <TabsContent value="paths">
          <PathsVisualization pathsStats={pathsStats} />
        </TabsContent>

        <TabsContent value="items">
          <ItemsVisualization itemsStats={itemsStats} />
        </TabsContent>

        <TabsContent value="choices">
          <ChoicesVisualization choicesStats={choicesStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NovelVisualization;
