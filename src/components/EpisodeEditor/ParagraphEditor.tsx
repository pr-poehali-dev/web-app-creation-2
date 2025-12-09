import { useState } from 'react';
import { Paragraph, Novel, ParagraphType } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';
import { getParagraphNumber } from '@/utils/paragraphNumbers';

interface ParagraphEditorProps {
  paragraph: Paragraph;
  index: number;
  episodeId: string;
  novel: Novel;
  totalParagraphs: number;
  onUpdate: (index: number, updatedParagraph: Paragraph) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleInsert: (index: number) => void;
}

function ParagraphEditor({
  paragraph,
  index,
  episodeId,
  novel,
  totalParagraphs,
  onUpdate,
  onDelete,
  onMove,
  onToggleInsert
}: ParagraphEditorProps) {
  const [isChangingType, setIsChangingType] = useState(false);

  const handleTypeChange = (newType: ParagraphType) => {
    let newParagraph: Paragraph;
    const id = paragraph.id;

    switch (newType) {
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
      case 'fade':
        newParagraph = { id, type: 'fade' };
        break;
      default:
        return;
    }

    onUpdate(index, newParagraph);
    setIsChangingType(false);
  };

  const handleImageUpload = async () => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      if (paragraph.type === 'dialogue') {
        onUpdate(index, { ...paragraph, characterImage: imageBase64 });
      } else if (paragraph.type === 'item') {
        onUpdate(index, { ...paragraph, imageUrl: imageBase64 });
      } else if (paragraph.type === 'image') {
        onUpdate(index, { ...paragraph, url: imageBase64 });
      }
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMove(index, 'up')}
              disabled={index === 0}
            >
              <Icon name="ChevronUp" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMove(index, 'down')}
              disabled={index === totalParagraphs - 1}
            >
              <Icon name="ChevronDown" size={16} />
            </Button>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">
                  {getParagraphNumber(novel, episodeId, index)}
                </span>
                {isChangingType ? (
                  <Select value={paragraph.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">TEXT</SelectItem>
                      <SelectItem value="dialogue">DIALOGUE</SelectItem>
                      <SelectItem value="choice">CHOICE</SelectItem>
                      <SelectItem value="item">ITEM</SelectItem>
                      <SelectItem value="image">IMAGE</SelectItem>
                      <SelectItem value="fade">FADE</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <button
                    onClick={() => setIsChangingType(true)}
                    className="text-xs font-medium text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer"
                  >
                    {paragraph.type}
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleInsert(index)}
                >
                  <Icon name="Plus" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete(index)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>

            {paragraph.type === 'fade' && (
              <div className="text-center py-4 text-muted-foreground">
                <Icon name="Minus" size={24} className="mx-auto mb-2" />
                <p className="text-sm">Затухание (пустая строка в MD)</p>
              </div>
            )}

            {paragraph.type === 'text' && (
              <Textarea
                value={paragraph.content}
                onChange={(e) =>
                  onUpdate(index, { ...paragraph, content: e.target.value })
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
                      onUpdate(index, { ...paragraph, characterName: e.target.value })
                    }
                    className="text-foreground"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImageUpload}
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
                      onClick={() => onUpdate(index, { ...paragraph, characterImage: undefined })}
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                )}
                <Textarea
                  placeholder="Текст диалога"
                  value={paragraph.text}
                  onChange={(e) =>
                    onUpdate(index, { ...paragraph, text: e.target.value })
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
                    onUpdate(index, { ...paragraph, question: e.target.value })
                  }
                  className="text-foreground"
                />
                {paragraph.options.map((option, optIndex) => (
                  <div key={option.id} className="space-y-2 p-3 border border-border rounded-lg">
                    <Input
                      placeholder="Текст варианта"
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...paragraph.options];
                        newOptions[optIndex] = { ...option, text: e.target.value };
                        onUpdate(index, { ...paragraph, options: newOptions });
                      }}
                      className="text-foreground"
                    />
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Следующий эпизод</Label>
                        <Select
                          value={option.nextEpisodeId || 'none'}
                          onValueChange={(value) => {
                            const newOptions = [...paragraph.options];
                            if (value === 'none') {
                              newOptions[optIndex] = { ...option, nextEpisodeId: undefined, nextParagraphIndex: undefined };
                            } else {
                              newOptions[optIndex] = { ...option, nextEpisodeId: value };
                            }
                            onUpdate(index, { ...paragraph, options: newOptions });
                          }}
                        >
                          <SelectTrigger className="text-foreground">
                            <SelectValue placeholder="Не выбран" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Не выбран</SelectItem>
                            {novel.episodes.map((ep) => (
                              <SelectItem key={ep.id} value={ep.id}>{ep.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {option.nextEpisodeId && (
                          <div>
                            <Label className="text-xs">Параграф</Label>
                            <Select
                              value={option.nextParagraphIndex?.toString() || '0'}
                              onValueChange={(value) => {
                                const newOptions = [...paragraph.options];
                                newOptions[optIndex] = { ...option, nextParagraphIndex: parseInt(value) };
                                onUpdate(index, { ...paragraph, options: newOptions });
                              }}
                            >
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="С начала" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">С начала</SelectItem>
                                {novel.episodes.find(ep => ep.id === option.nextEpisodeId)?.paragraphs.map((para, pIndex) => (
                                  <SelectItem key={para.id} value={(pIndex).toString()}>
                                    #{pIndex + 1} - {para.type.toUpperCase()}
                                    {para.type === 'text' && para.content ? ` - ${para.content.slice(0, 20)}...` : ''}
                                    {para.type === 'dialogue' && para.characterName ? ` - ${para.characterName}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive mt-5"
                        onClick={() => {
                          const newOptions = paragraph.options.filter((_, i) => i !== optIndex);
                          onUpdate(index, { ...paragraph, options: newOptions });
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
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
                    onUpdate(index, { ...paragraph, options: newOptions });
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
                      onUpdate(index, { ...paragraph, name: e.target.value })
                    }
                    className="text-foreground"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImageUpload}
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
                      onClick={() => onUpdate(index, { ...paragraph, imageUrl: undefined })}
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                )}
                <Textarea
                  placeholder="Описание"
                  value={paragraph.description}
                  onChange={(e) =>
                    onUpdate(index, { ...paragraph, description: e.target.value })
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
                      onUpdate(index, { ...paragraph, url: e.target.value })
                    }
                    className="text-foreground"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImageUpload}
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
  );
}

export default ParagraphEditor;