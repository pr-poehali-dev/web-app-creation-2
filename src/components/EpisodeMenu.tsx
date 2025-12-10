import { useState } from 'react';
import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface EpisodeMenuProps {
  novel: Novel;
  profile: UserProfile;
  onEpisodeSelect: (episodeId: string, paragraphIndex?: number) => void;
  onBack: () => void;
}

function EpisodeMenu({ novel, profile, onEpisodeSelect, onBack }: EpisodeMenuProps) {
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

  const getEpisodeProgress = (episodeId: string) => {
    return profile.completedEpisodes.includes(episodeId) ? 100 : 
           novel.currentEpisodeId === episodeId ? 50 : 0;
  };

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

  const isEpisodeUnlocked = (index: number) => {
    if (index === 0) return true;
    const episode = novel.episodes[index];
    if (episode.unlockedForAll) return true;
    const prevEpisode = novel.episodes[index - 1];
    return isEpisodeFullyRead(prevEpisode.id);
  };

  return (
    <div className="min-h-screen bg-background p-4 dark">
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
            const isCurrent = novel.currentEpisodeId === episode.id;
            const isLocked = !isEpisodeUnlocked(index) && !isCurrent;
            
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
                        <div className="flex gap-2">
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
                          {!isLocked && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id);
                              }}
                            >
                              <Icon name={expandedEpisode === episode.id ? "ChevronUp" : "ChevronDown"} size={16} />
                            </Button>
                          )}
                        </div>
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

                      {expandedEpisode === episode.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-foreground">Перейти к параграфу:</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEpisodeSelect(episode.id, 0);
                              }}
                            >
                              <Icon name="Play" size={14} className="mr-1" />
                              С начала
                            </Button>
                          </div>
                          <Select onValueChange={(value) => onEpisodeSelect(episode.id, parseInt(value))}>
                            <SelectTrigger className="text-foreground">
                              <SelectValue placeholder="Выберите конкретный параграф" />
                            </SelectTrigger>
                            <SelectContent>
                              {episode.paragraphs.map((para, pIndex) => (
                                <SelectItem key={para.id} value={pIndex.toString()}>
                                  <span className="font-mono text-xs mr-2">#{pIndex + 1}</span>
                                  <span className="font-bold mr-2">{para.type.toUpperCase()}</span>
                                  {para.type === 'text' && para.content && (
                                    <span className="text-muted-foreground">- {para.content.slice(0, 40)}...</span>
                                  )}
                                  {para.type === 'dialogue' && para.characterName && (
                                    <span className="text-muted-foreground">- {para.characterName}</span>
                                  )}
                                  {para.type === 'choice' && para.question && (
                                    <span className="text-muted-foreground">- {para.question.slice(0, 30)}...</span>
                                  )}
                                  {para.type === 'item' && para.name && (
                                    <span className="text-muted-foreground">- {para.name}</span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Или выберите конкретный параграф из списка выше</p>
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