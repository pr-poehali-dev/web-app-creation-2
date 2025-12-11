import { Novel, Episode } from '@/types/novel';

interface OverviewConnectionsProps {
  novel: Novel;
  scale: number;
  offset: { x: number; y: number };
  allConnections: { from: Episode; to: Episode; type: 'choice' | 'next' }[];
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
  }>;
  getPosition: (type: string, id: string, defaultX: number, defaultY: number) => { x: number; y: number };
}

function OverviewConnections({
  novel,
  scale,
  offset,
  allConnections,
  pathsStats,
  itemsStats,
  choicesStats,
  getPosition
}: OverviewConnectionsProps) {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
      {allConnections.map((conn, idx) => {
        const fromX = conn.from.position.x * scale + offset.x + 112;
        const fromY = conn.from.position.y * scale + offset.y + 40;
        const toX = conn.to.position.x * scale + offset.x + 112;
        const toY = conn.to.position.y * scale + offset.y + 40;

        return (
          <g key={`ep-${idx}`}>
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

      {pathsStats.map((pathStat, idx) => {
        const pathPos = getPosition('path', pathStat.path.id, 600 + (idx % 3) * 250, 100 + Math.floor(idx / 3) * 200);
        const pathX = pathPos.x * scale + offset.x + 96;
        const pathY = pathPos.y * scale + offset.y + 40;

        return (
          <g key={`path-${idx}`}>
            {pathStat.relatedEpisodes.map((epId, i) => {
              const episode = novel.episodes.find(ep => ep.id === epId);
              if (!episode) return null;
              const epX = episode.position.x * scale + offset.x + 112;
              const epY = episode.position.y * scale + offset.y + 40;
              return (
                <line
                  key={`path-ep-${i}`}
                  x1={pathX}
                  y1={pathY}
                  x2={epX}
                  y2={epY}
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeDasharray="3,3"
                />
              );
            })}
          </g>
        );
      })}

      {itemsStats.map((itemStat, idx) => {
        const itemPos = getPosition('item', itemStat.item.id, 1200 + (idx % 3) * 250, 100 + Math.floor(idx / 3) * 220);
        const itemX = itemPos.x * scale + offset.x + 96;
        const itemY = itemPos.y * scale + offset.y + 40;

        return (
          <g key={`item-${idx}`}>
            {itemStat.relatedEpisodes.map((epId, i) => {
              const episode = novel.episodes.find(ep => ep.id === epId);
              if (!episode) return null;
              const epX = episode.position.x * scale + offset.x + 112;
              const epY = episode.position.y * scale + offset.y + 40;
              return (
                <line
                  key={`item-ep-${i}`}
                  x1={itemX}
                  y1={itemY}
                  x2={epX}
                  y2={epY}
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeDasharray="3,3"
                />
              );
            })}
          </g>
        );
      })}

      {choicesStats.map((choice, idx) => {
        const sourceEpisode = novel.episodes.find(ep => ep.id === choice.episodeId);
        if (!sourceEpisode) return null;
        const choiceX = sourceEpisode.position.x * scale + offset.x + 112;
        const choiceY = sourceEpisode.position.y * scale + offset.y + 40;

        return (
          <g key={`choice-${idx}`}>
            {choice.relatedPaths.map((pathId, i) => {
              const pathStat = pathsStats.find(p => p.path.id === pathId);
              if (!pathStat) return null;
              const pathPos = getPosition('path', pathId, 0, 0);
              const pathX = pathPos.x * scale + offset.x + 96;
              const pathY = pathPos.y * scale + offset.y + 40;
              return (
                <line
                  key={`choice-path-${i}`}
                  x1={choiceX}
                  y1={choiceY}
                  x2={pathX}
                  y2={pathY}
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="1.5"
                  strokeOpacity="0.2"
                  strokeDasharray="2,2"
                />
              );
            })}
            {choice.relatedItems.map((itemId, i) => {
              const itemStat = itemsStats.find(it => it.item.id === itemId);
              if (!itemStat) return null;
              const itemPos = getPosition('item', itemId, 0, 0);
              const itemX = itemPos.x * scale + offset.x + 96;
              const itemY = itemPos.y * scale + offset.y + 40;
              return (
                <line
                  key={`choice-item-${i}`}
                  x1={choiceX}
                  y1={choiceY}
                  x2={itemX}
                  y2={itemY}
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="1.5"
                  strokeOpacity="0.2"
                  strokeDasharray="2,2"
                />
              );
            })}
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
  );
}

export default OverviewConnections;
