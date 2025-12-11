import { Novel, Episode } from '@/types/novel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface OverviewEpisodeCardsProps {
  novel: Novel;
  scale: number;
  offset: { x: number; y: number };
  handleItemDragStart: (type: 'episode' | 'path' | 'item' | 'choice', id: string, e: React.MouseEvent) => void;
  getConnectionsForEpisode: (episodeId: string) => { from: Episode; to: Episode }[];
}

function OverviewEpisodeCards({
  novel,
  scale,
  offset,
  handleItemDragStart,
  getConnectionsForEpisode
}: OverviewEpisodeCardsProps) {
  return (
    <>
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
              transformOrigin: 'top left',
              zIndex: 10
            }}
            onMouseDown={(e) => handleItemDragStart('episode', episode.id, e)}
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
    </>
  );
}

export default OverviewEpisodeCards;
