import { Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EpisodesSidebarProps {
  novel: Novel;
  currentEpisodeId: string;
  onEpisodeSelect: (episodeId: string, paragraphIndex?: number) => void;
  onShowParagraphs: (episodeId: string) => void;
}

function EpisodesSidebar({ novel, currentEpisodeId, onEpisodeSelect, onShowParagraphs }: EpisodesSidebarProps) {
  return (
    <div className="w-80 h-full bg-card border-r border-border overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Эпизоды</h2>
        <div className="space-y-2">
          {novel.episodes.map((episode, index) => {
            const isCurrent = currentEpisodeId === episode.id;
            
            return (
              <div key={episode.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (isCurrent) {
                      onShowParagraphs(episode.id);
                    } else {
                      onEpisodeSelect(episode.id);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-bold text-sm">{index + 1}.</span>
                      <span className="text-sm font-medium">{episode.title}</span>
                    </div>
                    {isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowParagraphs(episode.id);
                        }}
                      >
                        <Icon name="List" size={14} />
                      </Button>
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {episode.paragraphs.length} параграфов
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EpisodesSidebar;