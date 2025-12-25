import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePresentationStore } from '@/store/presentationStore';
import { episodeToPresentation, presentationToEpisode } from '@/utils/episodeConverter';
import type { Episode, Novel } from '@/types/novel';
import Icon from '@/components/ui/icon';

interface EpisodeSelectorProps {
  novel: Novel;
  onNovelUpdate: (novel: Novel) => void;
}

export function EpisodeSelector({ novel, onNovelUpdate }: EpisodeSelectorProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const presentation = usePresentationStore(s => s.presentation);
  const setPresentation = usePresentationStore(s => s.setPresentation);

  const handleLoadEpisode = () => {
    const episode = novel.episodes.find(ep => ep.id === selectedEpisodeId);
    if (episode) {
      const presentation = episodeToPresentation(episode);
      setPresentation(presentation);
    }
  };

  const handleSaveToEpisode = () => {
    if (!selectedEpisodeId) return;

    const originalEpisode = novel.episodes.find(ep => ep.id === selectedEpisodeId);
    if (!originalEpisode) return;

    const updatedEpisode = presentationToEpisode(presentation, originalEpisode);
    
    const updatedNovel = {
      ...novel,
      episodes: novel.episodes.map(ep => 
        ep.id === selectedEpisodeId ? updatedEpisode : ep
      )
    };

    onNovelUpdate(updatedNovel);
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-background">
      <Select value={selectedEpisodeId} onValueChange={setSelectedEpisodeId}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Выберите эпизод" />
        </SelectTrigger>
        <SelectContent>
          {novel.episodes.map(episode => (
            <SelectItem key={episode.id} value={episode.id}>
              {episode.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLoadEpisode}
        disabled={!selectedEpisodeId}
      >
        <Icon name="Download" size={16} className="mr-1" />
        Загрузить
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={handleSaveToEpisode}
        disabled={!selectedEpisodeId}
      >
        <Icon name="Save" size={16} className="mr-1" />
        Сохранить в эпизод
      </Button>
    </div>
  );
}
