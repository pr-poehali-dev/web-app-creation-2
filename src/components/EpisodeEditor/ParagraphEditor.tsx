import { Paragraph, Novel } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {paragraph.type}
                </span>
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
                  <div key={option.id} className="flex gap-2">
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
                    <Input
                      placeholder="ID эпизода"
                      value={option.nextEpisodeId || ''}
                      onChange={(e) => {
                        const newOptions = [...paragraph.options];
                        newOptions[optIndex] = { ...option, nextEpisodeId: e.target.value };
                        onUpdate(index, { ...paragraph, options: newOptions });
                      }}
                      className="w-32 text-foreground"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newOptions = paragraph.options.filter((_, i) => i !== optIndex);
                        onUpdate(index, { ...paragraph, options: newOptions });
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
