import { useState } from 'react';
import { Episode, Novel } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import EpisodeBasicSettings from './EpisodeBasicSettings';
import EpisodeTimeframeSettings from './EpisodeTimeframeSettings';
import EpisodeMusicSettings from './EpisodeMusicSettings';
import EpisodeNavigationSettings from './EpisodeNavigationSettings';
import EpisodeImportExport from './EpisodeImportExport';

interface EpisodeHeaderProps {
  episode: Episode;
  novel: Novel;
  onUpdate: (episode: Episode) => void;
  onNovelUpdate: (novel: Novel) => void;
}

function EpisodeHeader({ episode, novel, onUpdate, onNovelUpdate }: EpisodeHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false);

  const handleTitleUpdate = (newTitle: string) => {
    onUpdate({ ...episode, title: newTitle });
    setEditingTitle(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {editingTitle ? (
            <Input
              defaultValue={episode.title}
              onBlur={(e) => handleTitleUpdate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleUpdate(e.currentTarget.value);
              }}
              autoFocus
              className="text-foreground"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-foreground">{episode.title}</span>
              <Button variant="ghost" size="icon" onClick={() => setEditingTitle(true)}>
                <Icon name="Edit" size={16} />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <EpisodeBasicSettings 
          episode={episode}
          novel={novel}
          onUpdate={onUpdate}
        />

        <EpisodeTimeframeSettings 
          episode={episode}
          onUpdate={onUpdate}
        />

        <EpisodeMusicSettings 
          episode={episode}
          onUpdate={onUpdate}
        />

        <EpisodeNavigationSettings 
          episode={episode}
          novel={novel}
          onUpdate={onUpdate}
        />
        
        <EpisodeImportExport 
          episode={episode}
          novel={novel}
          onNovelUpdate={onNovelUpdate}
        />
      </CardContent>
    </Card>
  );
}

export default EpisodeHeader;
