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
            draggedEpisode={draggedEpisode}
            containerRef={containerRef}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleEpisodeDragStart={handleEpisodeDragStart}
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
            handleEpisodeDragStart={handleEpisodeDragStart}
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