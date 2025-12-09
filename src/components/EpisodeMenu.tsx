import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface EpisodeMenuProps {
  novel: Novel;
  profile: UserProfile;
  onEpisodeSelect: (episodeId: string) => void;
  onBack: () => void;
}

function EpisodeMenu({ novel, profile, onEpisodeSelect, onBack }: EpisodeMenuProps) {
  const getEpisodeProgress = (episodeId: string) => {
    return profile.completedEpisodes.includes(episodeId) ? 100 : 
           novel.currentEpisodeId === episodeId ? 50 : 0;
  };

  const isEpisodeUnlocked = (index: number) => {
    if (index === 0) return true;
    return profile.completedEpisodes.includes(novel.episodes[index - 1].id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 dark">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Эпизоды</h1>
          <div className="w-10" />
        </header>

        <div className="space-y-4">
          {novel.episodes.map((episode, index) => {
            const progress = getEpisodeProgress(episode.id);
            const isLocked = !isEpisodeUnlocked(index);
            const isCurrent = novel.currentEpisodeId === episode.id;
            
            return (
              <Card 
                key={episode.id}
                className={`overflow-hidden transition-all ${
                  isCurrent 
                    ? 'border-primary border-2 shadow-lg shadow-primary/20' 
                    : isLocked
                    ? 'opacity-50'
                    : 'hover:shadow-lg hover:scale-102'
                } ${!isLocked ? 'cursor-pointer' : 'cursor-not-allowed'} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => !isLocked && onEpisodeSelect(episode.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                        progress === 100 
                          ? 'bg-green-500/20 text-green-500' 
                          : isCurrent
                          ? 'bg-primary/20 text-primary'
                          : isLocked
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary/20 text-secondary'
                      }`}>
                        {isLocked ? (
                          <Icon name="Lock" size={20} />
                        ) : progress === 100 ? (
                          <Icon name="Check" size={20} />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {episode.title}
                        </h3>
                        {isCurrent && (
                          <Badge variant="default">
                            Текущий
                          </Badge>
                        )}
                        {progress === 100 && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                            Пройден
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {episode.paragraphs.length} параграфов
                      </p>

                      {!isLocked && progress > 0 && progress < 100 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Прогресс</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {episode.backgroundMusic && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon name="Music" size={14} />
                          <span>С музыкой</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Завершите эпизоды по порядку, чтобы открыть следующие</p>
        </div>
      </div>
    </div>
  );
}

export default EpisodeMenu;