import { useState } from 'react';
import { Episode, Novel } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { selectAndConvertAudio } from '@/utils/fileHelpers';
import { parseMarkdownToEpisode, getMarkdownTemplate } from '@/utils/markdownImport';

interface EpisodeHeaderProps {
  episode: Episode;
  novel: Novel;
  onUpdate: (episode: Episode) => void;
}

function EpisodeHeader({ episode, novel, onUpdate }: EpisodeHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false);

  const handleTitleUpdate = (newTitle: string) => {
    onUpdate({ ...episode, title: newTitle });
    setEditingTitle(false);
  };

  const handleMusicUpload = async () => {
    const audioBase64 = await selectAndConvertAudio();
    if (audioBase64) {
      onUpdate({ ...episode, backgroundMusic: audioBase64 });
    }
  };

  const handleImportMarkdown = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const importedEpisode = parseMarkdownToEpisode(text, episode.id);
      onUpdate({
        ...episode,
        title: importedEpisode.title,
        paragraphs: importedEpisode.paragraphs,
        backgroundMusic: importedEpisode.backgroundMusic || episode.backgroundMusic
      });
    };
    input.click();
  };

  const handleExportTemplate = () => {
    const template = getMarkdownTemplate();
    const blob = new Blob([template], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'episode_template.md';
    a.click();
    URL.revokeObjectURL(url);
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
        <div>
          <Label className="text-foreground">Фоновая музыка</Label>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={handleMusicUpload}>
              <Icon name="Music" size={14} className="mr-1" />
              {episode.backgroundMusic ? 'Изменить музыку' : 'Добавить музыку'}
            </Button>
            {episode.backgroundMusic && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onUpdate({ ...episode, backgroundMusic: undefined })}
              >
                <Icon name="X" size={14} className="mr-1" />
                Удалить
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label className="text-foreground">Следующий эпизод</Label>
          <Select 
            value={episode.nextEpisodeId || 'none'} 
            onValueChange={(value) => onUpdate({ ...episode, nextEpisodeId: value === 'none' ? undefined : value })}
          >
            <SelectTrigger className="text-foreground mt-2">
              <SelectValue placeholder="Не выбран" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Не выбран</SelectItem>
              {novel.episodes.filter(ep => ep.id !== episode.id).map((ep) => (
                <SelectItem key={ep.id} value={ep.id}>{ep.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleImportMarkdown}>
            <Icon name="FileUp" size={14} className="mr-1" />
            Импорт из MD
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportTemplate}>
            <Icon name="FileDown" size={14} className="mr-1" />
            Скачать шаблон
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EpisodeHeader;