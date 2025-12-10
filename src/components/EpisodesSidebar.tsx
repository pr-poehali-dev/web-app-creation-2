import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EpisodesSidebarProps {
  novel: Novel;
  currentEpisodeId: string;
  profile: UserProfile;
  onEpisodeSelect: (episodeId: string, paragraphIndex?: number) => void;
  onShowParagraphs: (episodeId: string) => void;
}

function EpisodesSidebar({ novel, currentEpisodeId, profile, onEpisodeSelect, onShowParagraphs }: EpisodesSidebarProps) {
  const isEpisodeFullyRead = (episodeId: string) => {
    const episode = novel.episodes.find(ep => ep.id === episodeId);
    if (!episode) return false;
    if (!profile.readParagraphs || !Array.isArray(profile.readParagraphs)) return false;
    
    for (let i = 0; i < episode.paragraphs.length; i++) {
      const paragraphId = `${episodeId}-${i}`;
      if (!profile.readParagraphs.includes(paragraphId)) {
        return false;
      }
    }
    return true;
  };

  const isEpisodeAccessible = (index: number) => {
    if (index === 0) return true;
    const prevEpisode = novel.episodes[index - 1];
    return isEpisodeFullyRead(prevEpisode.id);
  };
  return (
    <div className="w-80 h-full bg-card border-r border-border overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Эпизоды</h2>
        <div className="space-y-2">
          {novel.episodes.map((episode, index) => {
            const isCurrent = currentEpisodeId === episode.id;
            const isAccessible = isEpisodeAccessible(index) || isCurrent;
            const isLocked = !isAccessible;
            const isFullyRead = isEpisodeFullyRead(episode.id);
            
            return (
              <div key={episode.id} className="space-y-1">
                <div
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  } ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : isLocked
                      ? 'bg-muted/50 text-muted-foreground'
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-2 flex-1"
                      onClick={() => {
                        if (isLocked) return;
                        if (isCurrent) {
                          onShowParagraphs(episode.id);
                        } else {
                          onEpisodeSelect(episode.id);
                        }
                      }}
                    >
                      {isLocked && <Icon name="Lock" size={14} className="flex-shrink-0" />}
                      <span className="font-bold text-sm">{index + 1}.</span>
                      <span className="text-sm font-medium">{episode.title}</span>
                    </div>
                    {isCurrent && (
                      <button
                        className="h-6 w-6 flex-shrink-0 hover:opacity-80 transition-opacity flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowParagraphs(episode.id);
                        }}
                      >
                        <Icon name="List" size={14} />
                      </button>
                    )}
                  </div>
                  <div 
                    className="text-xs opacity-70 mt-1"
                    onClick={() => {
                      if (isLocked) return;
                      if (isCurrent) {
                        onShowParagraphs(episode.id);
                      } else {
                        onEpisodeSelect(episode.id);
                      }
                    }}
                  >
                    {isLocked ? 'Заблокирован' : isFullyRead ? '✓ Прочитан' : `${episode.paragraphs.length} параграфов`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EpisodesSidebar;