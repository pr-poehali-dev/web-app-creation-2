import { useMemo } from 'react';
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
  isAdmin?: boolean;
  onClose?: () => void;
}

function EpisodesSidebar({ novel, currentEpisodeId, profile, onEpisodeSelect, onShowParagraphs, isAdmin, onClose }: EpisodesSidebarProps) {
  // Создаем Set для быстрого поиска прочитанных параграфов
  const readParagraphsSet = useMemo(() => {
    return new Set(profile.readParagraphs || []);
  }, [profile.readParagraphs]);

  // Кэшируем статус эпизодов
  const episodesStatus = useMemo(() => {
    return novel.episodes.map((episode, index) => {
      // Проверяем полностью ли прочитан эпизод
      let isFullyRead = true;
      for (let i = 0; i < episode.paragraphs.length; i++) {
        const paragraphId = `${episode.id}-${i}`;
        if (!readParagraphsSet.has(paragraphId)) {
          isFullyRead = false;
          break;
        }
      }

      // Находим последний прочитанный параграф
      let lastReadIndex = 0;
      for (let i = episode.paragraphs.length - 1; i >= 0; i--) {
        const paragraphId = `${episode.id}-${i}`;
        if (readParagraphsSet.has(paragraphId)) {
          lastReadIndex = i;
          break;
        }
      }

      // Проверяем доступность эпизода
      let isAccessible = false;
      if (isAdmin) {
        // Для админа открыты все эпизоды
        isAccessible = true;
      } else if (index === 0 || episode.unlockedForAll) {
        // Первый эпизод или эпизод разблокирован для всех
        isAccessible = true;
      } else if (index > 0) {
        const prevEpisodeStatus = index > 0 ? novel.episodes[index - 1] : null;
        if (prevEpisodeStatus) {
          let prevFullyRead = true;
          for (let i = 0; i < prevEpisodeStatus.paragraphs.length; i++) {
            const paragraphId = `${prevEpisodeStatus.id}-${i}`;
            if (!readParagraphsSet.has(paragraphId)) {
              prevFullyRead = false;
              break;
            }
          }
          isAccessible = prevFullyRead;
        }
      }

      return {
        isFullyRead,
        lastReadIndex,
        isAccessible
      };
    });
  }, [novel.episodes, readParagraphsSet]);
  return (
    <div className="w-80 h-full bg-card border-r border-border overflow-y-auto flex-shrink-0 relative">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Эпизоды</h2>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <Icon name="X" size={20} />
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {novel.episodes.map((episode, index) => {
            const isCurrent = currentEpisodeId === episode.id;
            const status = episodesStatus[index];
            const isAccessible = status.isAccessible || isCurrent;
            const isLocked = !isAccessible;
            const isFullyRead = status.isFullyRead;
            
            return (
              <div key={episode.id} className="space-y-1">
                <div
                  className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                    isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  } ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground shadow-lg border-transparent' 
                      : isLocked
                      ? 'bg-muted/50 text-muted-foreground border-border'
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-md border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-2 flex-1"
                      onClick={() => {
                        if (isLocked) return;
                        onEpisodeSelect(episode.id, status.lastReadIndex);
                      }}
                    >
                      {isLocked && <Icon name="Lock" size={14} className="flex-shrink-0" />}
                      <span className="font-bold text-sm">{index + 1}.</span>
                      <span className="text-sm font-medium">{episode.title}</span>
                    </div>
                    {!isLocked && (
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
                  <div className="text-xs opacity-70 mt-1">
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