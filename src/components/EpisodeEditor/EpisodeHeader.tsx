import { useState } from 'react';
import { Episode, Novel } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { selectAndConvertAudio } from '@/utils/fileHelpers';
import { parseMarkdownToEpisode, getMarkdownTemplate } from '@/utils/markdownImport';

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

  const [showMusicDialog, setShowMusicDialog] = useState(false);
  const [musicUrl, setMusicUrl] = useState('');

  const handleMusicUpload = async () => {
    const audioBase64 = await selectAndConvertAudio();
    if (audioBase64) {
      onUpdate({ ...episode, backgroundMusic: audioBase64 });
      setShowMusicDialog(false);
    }
  };

  const handleMusicUrl = () => {
    if (musicUrl) {
      onUpdate({ ...episode, backgroundMusic: musicUrl });
      setMusicUrl('');
      setShowMusicDialog(false);
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
      
      // Автоматический импорт в библиотеку
      const newCharacters = [...novel.library.characters];
      const newItems = [...novel.library.items];
      const newChoices = [...novel.library.choices];

      // Сначала собираем уникальных персонажей для генерации изображений
      const charactersToGenerate: { name: string; needsImage: boolean }[] = [];
      
      importedEpisode.paragraphs.forEach(para => {
        // Импорт персонажей из диалогов
        if (para.type === 'dialogue' && para.characterName) {
          const exists = newCharacters.some(c => c.name === para.characterName);
          const shouldGenerate = !para.characterImage || (!para.characterImage.startsWith('data:') && 
                                 !para.characterImage.startsWith('http') && para.characterImage.length <= 2);
          
          console.log(`Персонаж "${para.characterName}": изображение="${para.characterImage}", генерировать=${shouldGenerate}`);
          
          if (!exists) {
            const charId = `char${Date.now()}_${para.characterName}`;
            newCharacters.push({
              id: charId,
              name: para.characterName,
              images: para.characterImage && !shouldGenerate ? [{ id: `img${Date.now()}`, url: para.characterImage }] : []
            });
          } else if (para.characterImage && !shouldGenerate) {
            // Добавляем изображение к существующему персонажу
            const char = newCharacters.find(c => c.name === para.characterName);
            if (char && !char.images?.some(img => img.url === para.characterImage)) {
              char.images = [...(char.images || []), { id: `img${Date.now()}`, url: para.characterImage }];
            }
          }
          
          // Добавляем в список для генерации, если нужно
          if (shouldGenerate && !charactersToGenerate.some(c => c.name === para.characterName)) {
            charactersToGenerate.push({ name: para.characterName, needsImage: true });
          }
        }

        // Импорт предметов
        if (para.type === 'item' && para.name) {
          const exists = newItems.some(i => i.name === para.name);
          if (!exists) {
            newItems.push({
              id: `item${Date.now()}_${para.name}`,
              name: para.name,
              description: para.description,
              imageUrl: para.imageUrl
            });
          }
        }

        // Импорт выборов
        if (para.type === 'choice' && para.options) {
          para.options.forEach(opt => {
            const exists = newChoices.some(c => c.text === opt.text);
            if (!exists) {
              newChoices.push({
                id: `choice${Date.now()}_${opt.id}`,
                text: opt.text,
                nextEpisodeId: opt.nextEpisodeId
              });
            }
          });
        }
      });
      
      // Обновляем без генерации - генерация будет позже через DialogueBox
      console.log('Персонажи добавлены в библиотеку. Генерация изображений будет при первом показе диалога.');

      // Обновляем novel с новой библиотекой И эпизод одновременно
      console.log('Импортировано в библиотеку:');
      console.log('Characters:', newCharacters);
      console.log('Items:', newItems);
      console.log('Choices:', newChoices);
      console.log('Всего параграфов для импорта:', importedEpisode.paragraphs.length);
      
      const updatedEpisode = {
        ...episode,
        title: importedEpisode.title,
        paragraphs: importedEpisode.paragraphs,
        backgroundMusic: importedEpisode.backgroundMusic || episode.backgroundMusic
      };
      
      onNovelUpdate({
        ...novel,
        library: {
          characters: newCharacters,
          items: newItems,
          choices: newChoices
        },
        episodes: novel.episodes.map(ep => 
          ep.id === episode.id ? updatedEpisode : ep
        )
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
            <Dialog open={showMusicDialog} onOpenChange={setShowMusicDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Icon name="Music" size={14} className="mr-1" />
                  {episode.backgroundMusic ? 'Изменить музыку' : 'Добавить музыку'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить музыку</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>URL аудио</Label>
                    <Input
                      placeholder="https://example.com/music.mp3"
                      value={musicUrl}
                      onChange={(e) => setMusicUrl(e.target.value)}
                      className="text-foreground mt-1"
                    />
                    <Button onClick={handleMusicUrl} className="w-full mt-2">
                      Добавить по URL
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">или</span>
                    </div>
                  </div>
                  <Button onClick={handleMusicUpload} variant="outline" className="w-full">
                    <Icon name="Upload" size={14} className="mr-2" />
                    Загрузить файл
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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

        <div className="space-y-3">
          <Label className="text-foreground">Следующий эпизод</Label>
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