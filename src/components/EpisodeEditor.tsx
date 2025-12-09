import { useState } from 'react';
import { Episode, Paragraph, ParagraphType } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface EpisodeEditorProps {
  episode: Episode;
  onUpdate: (episode: Episode) => void;
}

function EpisodeEditor({ episode, onUpdate }: EpisodeEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false);

  const handleTitleUpdate = (newTitle: string) => {
    onUpdate({ ...episode, title: newTitle });
    setEditingTitle(false);
  };

  const handleAddParagraph = (type: ParagraphType) => {
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

    onUpdate({
      ...episode,
      paragraphs: [...episode.paragraphs, newParagraph]
    });
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
              />
            ) : (
              <div className="flex items-center gap-2">
                <span>{episode.title}</span>
                <Button variant="ghost" size="icon" onClick={() => setEditingTitle(true)}>
                  <Icon name="Edit" size={16} />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
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
          <Card key={paragraph.id} className="animate-fade-in">
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
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {paragraph.type}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteParagraph(index)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>

                  {paragraph.type === 'text' && (
                    <Textarea
                      value={paragraph.content}
                      onChange={(e) =>
                        handleUpdateParagraph(index, { ...paragraph, content: e.target.value })
                      }
                      rows={3}
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
                        />
                        <Input
                          placeholder="Эмодзи персонажа"
                          value={paragraph.characterImage || ''}
                          onChange={(e) =>
                            handleUpdateParagraph(index, { ...paragraph, characterImage: e.target.value })
                          }
                          className="w-24"
                        />
                      </div>
                      <Textarea
                        placeholder="Текст диалога"
                        value={paragraph.text}
                        onChange={(e) =>
                          handleUpdateParagraph(index, { ...paragraph, text: e.target.value })
                        }
                        rows={3}
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
                          />
                          <Input
                            placeholder="ID эпизода"
                            value={option.nextEpisodeId || ''}
                            onChange={(e) => {
                              const newOptions = [...paragraph.options];
                              newOptions[optIndex] = { ...option, nextEpisodeId: e.target.value };
                              handleUpdateParagraph(index, { ...paragraph, options: newOptions });
                            }}
                            className="w-32"
                          />
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
                        />
                        <Input
                          placeholder="Эмодзи"
                          value={paragraph.imageUrl || ''}
                          onChange={(e) =>
                            handleUpdateParagraph(index, { ...paragraph, imageUrl: e.target.value })
                          }
                          className="w-24"
                        />
                      </div>
                      <Textarea
                        placeholder="Описание"
                        value={paragraph.description}
                        onChange={(e) =>
                          handleUpdateParagraph(index, { ...paragraph, description: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  )}

                  {paragraph.type === 'image' && (
                    <Input
                      placeholder="URL изображения"
                      value={paragraph.url}
                      onChange={(e) =>
                        handleUpdateParagraph(index, { ...paragraph, url: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {episode.paragraphs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Добавьте параграфы к эпизоду
        </div>
      )}
    </div>
  );
}

export default EpisodeEditor;
