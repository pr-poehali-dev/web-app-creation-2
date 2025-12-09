import { useState } from 'react';
import { Episode, Paragraph, ParagraphType, Novel } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage, selectAndConvertAudio } from '@/utils/fileHelpers';
import { parseMarkdownToEpisode, getMarkdownTemplate } from '@/utils/markdownImport';
import { getParagraphNumber } from '@/utils/paragraphNumbers';

interface EpisodeEditorProps {
  episode: Episode;
  novel: Novel;
  onUpdate: (episode: Episode) => void;
}

function EpisodeEditor({ episode, novel, onUpdate }: EpisodeEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [insertingAt, setInsertingAt] = useState<number | null>(null);

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

  const handleAddParagraph = (type: ParagraphType, insertIndex?: number) => {
    let newParagraph: Paragraph;
    const id = `p${Date.now()}`;

    switch (type) {
      case 'text':
        newParagraph = { id, type: 'text', content: 'Новый текст' };
        break;
      case 'dialogue':
        newParagraph = { id, type: 'dialogue', characterName: 'Персонаж', text: 'Текст диалога' };
        break;
      case 'choice':
        newParagraph = { 
          id, 
          type: 'choice', 
          question: 'Ваш выбор?',
          options: [
            { id: `opt${Date.now()}1`, text: 'Вариант 1' },
            { id: `opt${Date.now()}2`, text: 'Вариант 2' }
          ]
        };
        break;
      case 'item':
        newParagraph = { id, type: 'item', name: 'Предмет', description: 'Описание предмета' };
        break;
      case 'image':
        newParagraph = { id, type: 'image', url: 'https://via.placeholder.com/800x600' };
        break;
      default:
        return;
    }

    const newParagraphs = [...episode.paragraphs];
    if (insertIndex !== undefined) {
      newParagraphs.splice(insertIndex + 1, 0, newParagraph);
    } else {
      newParagraphs.push(newParagraph);
    }

    onUpdate({
      ...episode,
      paragraphs: newParagraphs
    });
    
    setInsertingAt(null);
  };

  const handleUpdateParagraph = (index: number, updatedParagraph: Paragraph) => {
    const newParagraphs = [...episode.paragraphs];
    newParagraphs[index] = updatedParagraph;
    onUpdate({ ...episode, paragraphs: newParagraphs });
  };

  const handleDeleteParagraph = (index: number) => {
    onUpdate({
      ...episode,
      paragraphs: episode.paragraphs.filter((_, i) => i !== index)
    });
  };

  const handleMoveParagraph = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= episode.paragraphs.length) return;

    const newParagraphs = [...episode.paragraphs];
    [newParagraphs[index], newParagraphs[newIndex]] = [newParagraphs[newIndex], newParagraphs[index]];
    onUpdate({ ...episode, paragraphs: newParagraphs });
  };

  const handleImageUpload = async (index: number, paragraph: Paragraph) => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      if (paragraph.type === 'dialogue') {
        handleUpdateParagraph(index, { ...paragraph, characterImage: imageBase64 });
      } else if (paragraph.type === 'item') {
        handleUpdateParagraph(index, { ...paragraph, imageUrl: imageBase64 });
      } else if (paragraph.type === 'image') {
        handleUpdateParagraph(index, { ...paragraph, url: imageBase64 });
      }
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => handleAddParagraph('text')}>
          <Icon name="FileText" size={14} className="mr-1" />
          Текст
        </Button>
        <Button size="sm" onClick={() => handleAddParagraph('dialogue')}>
          <Icon name="MessageSquare" size={14} className="mr-1" />
          Диалог
        </Button>
        <Button size="sm" onClick={() => handleAddParagraph('choice')}>
          <Icon name="GitBranch" size={14} className="mr-1" />
          Выбор
        </Button>
        <Button size="sm" onClick={() => handleAddParagraph('item')}>
          <Icon name="Package" size={14} className="mr-1" />
          Предмет
        </Button>
        <Button size="sm" onClick={() => handleAddParagraph('image')}>
          <Icon name="Image" size={14} className="mr-1" />
          Картинка
        </Button>
      </div>

      <div className="space-y-3">
        {episode.paragraphs.map((paragraph, index) => (
          <div key={paragraph.id}>
            <Card className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveParagraph(index, 'up')}
                      disabled={index === 0}
                    >
                      <Icon name="ChevronUp" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveParagraph(index, 'down')}
                      disabled={index === episode.paragraphs.length - 1}
                    >
                      <Icon name="ChevronDown" size={16} />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          {getParagraphNumber(novel, episode.id, index)}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {paragraph.type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setInsertingAt(insertingAt === index ? null : index)}
                        >
                          <Icon name="Plus" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteParagraph(index)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>

                  {paragraph.type === 'text' && (
                    <Textarea
                      value={paragraph.content}
                      onChange={(e) =>
                        handleUpdateParagraph(index, { ...paragraph, content: e.target.value })
                      }
                      rows={3}
                      className="text-foreground"
                    />
                  )}

                  {paragraph.type === 'dialogue' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Имя персонажа"
                          value={paragraph.characterName}
                          onChange={(e) =>
                            handleUpdateParagraph(index, { ...paragraph, characterName: e.target.value })
                          }
                          className="text-foreground"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImageUpload(index, paragraph)}
                        >
                          <Icon name="Upload" size={14} />
                        </Button>
                      </div>
                      {paragraph.characterImage && (
                        <div className="flex items-center gap-2">
                          {paragraph.characterImage.startsWith('data:') ? (
                            <img src={paragraph.characterImage} alt="Character" className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <span className="text-3xl">{paragraph.characterImage}</span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateParagraph(index, { ...paragraph, characterImage: undefined })}
                          >
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                      )}
                      <Textarea
                        placeholder="Текст диалога"
                        value={paragraph.text}
                        onChange={(e) =>
                          handleUpdateParagraph(index, { ...paragraph, text: e.target.value })
                        }
                        rows={3}
                        className="text-foreground"
                      />
                    </div>
                  )}

                  {paragraph.type === 'choice' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Вопрос"
                        value={paragraph.question}
                        onChange={(e) =>
                          handleUpdateParagraph(index, { ...paragraph, question: e.target.value })
                        }
                        className="text-foreground"
                      />
                      {paragraph.options.map((option, optIndex) => (
                        <div key={option.id} className="flex gap-2">
                          <Input
                            placeholder="Текст варианта"
                            value={option.text}
                            onChange={(e) => {
                              const newOptions = [...paragraph.options];
                              newOptions[optIndex] = { ...option, text: e.target.value };
                              handleUpdateParagraph(index, { ...paragraph, options: newOptions });
                            }}
                            className="text-foreground"
                          />
                          <Input
                            placeholder="ID эпизода"
                            value={option.nextEpisodeId || ''}
                            onChange={(e) => {
                              const newOptions = [...paragraph.options];
                              newOptions[optIndex] = { ...option, nextEpisodeId: e.target.value };
                              handleUpdateParagraph(index, { ...paragraph, options: newOptions });
                            }}
                            className="w-32 text-foreground"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newOptions = paragraph.options.filter((_, i) => i !== optIndex);
                              handleUpdateParagraph(index, { ...paragraph, options: newOptions });
                            }}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newOptions = [
                            ...paragraph.options,
                            { id: `opt${Date.now()}`, text: 'Новый вариант' }
                          ];
                          handleUpdateParagraph(index, { ...paragraph, options: newOptions });
                        }}
                      >
                        <Icon name="Plus" size={14} className="mr-1" />
                        Добавить вариант
                      </Button>
                    </div>
                  )}

                  {paragraph.type === 'item' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Название предмета"
                          value={paragraph.name}
                          onChange={(e) =>
                            handleUpdateParagraph(index, { ...paragraph, name: e.target.value })
                          }
                          className="text-foreground"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImageUpload(index, paragraph)}
                        >
                          <Icon name="Upload" size={14} />
                        </Button>
                      </div>
                      {paragraph.imageUrl && (
                        <div className="flex items-center gap-2">
                          {paragraph.imageUrl.startsWith('data:') ? (
                            <img src={paragraph.imageUrl} alt="Item" className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <span className="text-3xl">{paragraph.imageUrl}</span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateParagraph(index, { ...paragraph, imageUrl: undefined })}
                          >
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                      )}
                      <Textarea
                        placeholder="Описание"
                        value={paragraph.description}
                        onChange={(e) =>
                          handleUpdateParagraph(index, { ...paragraph, description: e.target.value })
                        }
                        rows={2}
                        className="text-foreground"
                      />
                    </div>
                  )}

                  {paragraph.type === 'image' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="URL изображения"
                          value={paragraph.url}
                          onChange={(e) =>
                            handleUpdateParagraph(index, { ...paragraph, url: e.target.value })
                          }
                          className="text-foreground"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImageUpload(index, paragraph)}
                        >
                          <Icon name="Upload" size={14} />
                        </Button>
                      </div>
                      {paragraph.url && (
                        <img src={paragraph.url} alt="Preview" className="w-full max-h-48 object-contain rounded" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {insertingAt === index && (
            <div className="flex gap-2 justify-center my-2 p-2 bg-secondary/20 rounded-lg">
              <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('text', index)}>
                <Icon name="FileText" size={14} className="mr-1" />
                Текст
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('dialogue', index)}>
                <Icon name="MessageSquare" size={14} className="mr-1" />
                Диалог
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('choice', index)}>
                <Icon name="GitBranch" size={14} className="mr-1" />
                Выбор
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('item', index)}>
                <Icon name="Package" size={14} className="mr-1" />
                Предмет
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('image', index)}>
                <Icon name="Image" size={14} className="mr-1" />
                Картинка
              </Button>
            </div>
          )}
        </div>
        ))}
      </div>

      {episode.paragraphs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Добавьте параграфы к эпизоду или импортируйте из MD файла
        </div>
      )}
    </div>
  );
}

export default EpisodeEditor;