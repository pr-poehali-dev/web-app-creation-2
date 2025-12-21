import { Episode, Novel } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EpisodeNavigationSettingsProps {
  episode: Episode;
  novel: Novel;
  onUpdate: (episode: Episode) => void;
}

function EpisodeNavigationSettings({ episode, novel, onUpdate }: EpisodeNavigationSettingsProps) {
  return (
    <div className="space-y-3">
      <Label className="text-foreground">Следующий эпизод</Label>
      
      {!episode.requiredPaths || episode.requiredPaths.length === 0 ? (
        <>
          <Select 
            value={episode.nextEpisodeId || 'none'} 
            onValueChange={(value) => {
              if (value === 'none') {
                onUpdate({ ...episode, nextEpisodeId: undefined, nextParagraphIndex: undefined });
              } else {
                onUpdate({ ...episode, nextEpisodeId: value });
              }
            }}
          >
            <SelectTrigger className="text-foreground">
              <SelectValue placeholder="Не выбран" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Не выбран</SelectItem>
              {novel.episodes.filter(ep => ep.id !== episode.id).map((ep) => (
                <SelectItem key={ep.id} value={ep.id}>{ep.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {episode.nextEpisodeId && (
            <div>
              <Label className="text-foreground text-sm">Параграф в эпизоде</Label>
              <Select 
                value={episode.nextParagraphIndex?.toString() || '0'} 
                onValueChange={(value) => onUpdate({ ...episode, nextParagraphIndex: parseInt(value) })}
              >
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="С начала" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">С начала эпизода</SelectItem>
                  {novel.episodes.find(ep => ep.id === episode.nextEpisodeId)?.paragraphs.map((para, index) => (
                    <SelectItem key={para.id} value={(index).toString()}>
                      #{index + 1} - {para.type.toUpperCase()}
                      {para.type === 'text' && para.content ? ` - ${para.content.slice(0, 30)}...` : ''}
                      {para.type === 'dialogue' && para.characterName ? ` - ${para.characterName}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">
            Выберите следующий эпизод для каждого пути:
          </p>
          {episode.requiredPaths.map(pathId => {
            const path = novel.paths?.find(p => p.id === pathId);
            if (!path) return null;
            
            return (
              <div key={pathId} className="space-y-2">
                <Label className="text-foreground text-sm flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: path.color }}
                  />
                  {path.name}
                </Label>
                <Select 
                  value={episode.pathNextEpisodes?.[pathId] || 'none'} 
                  onValueChange={(value) => {
                    const updated = { ...episode.pathNextEpisodes };
                    if (value === 'none') {
                      delete updated[pathId];
                    } else {
                      updated[pathId] = value;
                    }
                    onUpdate({ ...episode, pathNextEpisodes: Object.keys(updated).length > 0 ? updated : undefined });
                  }}
                >
                  <SelectTrigger className="text-foreground">
                    <SelectValue placeholder="По умолчанию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">По умолчанию</SelectItem>
                    {novel.episodes.filter(ep => ep.id !== episode.id).map((ep) => (
                      <SelectItem key={ep.id} value={ep.id}>{ep.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        {episode.requiredPaths && episode.requiredPaths.length > 0 
          ? 'Для каждого пути можно задать свой следующий эпизод. Если не задан — автоматически следующий по порядку.'
          : 'Если следующий эпизод не выбран, автоматически перейдёт к следующему по порядку'}
      </p>
    </div>
  );
}

export default EpisodeNavigationSettings;
