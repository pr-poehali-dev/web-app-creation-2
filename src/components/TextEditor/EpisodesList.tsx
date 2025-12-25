import { Episode } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface EpisodesListProps {
  episodes: Episode[];
  selectedEpisodeId: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Episode>) => void;
}

export default function EpisodesList({ 
  episodes, 
  selectedEpisodeId, 
  onSelect, 
  onUpdate 
}: EpisodesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (episode: Episode) => {
    setEditingId(episode.id);
    setEditTitle(episode.title);
  };

  const saveEdit = (id: string) => {
    onUpdate(id, { title: editTitle });
    setEditingId(null);
  };

  return (
    <div className="space-y-1">
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className={`
            p-3 rounded-lg cursor-pointer transition-colors
            ${selectedEpisodeId === episode.id 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
            }
          `}
          onClick={() => onSelect(episode.id)}
        >
          {editingId === episode.id ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(episode.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => saveEdit(episode.id)}
                  className="h-6 px-2 text-xs"
                >
                  <Icon name="Check" size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  className="h-6 px-2 text-xs"
                >
                  <Icon name="X" size={12} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {episode.title}
                </div>
                <div className="text-xs opacity-70">
                  {episode.paragraphs.length} параграфов
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(episode);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <Icon name="Edit2" size={12} />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
