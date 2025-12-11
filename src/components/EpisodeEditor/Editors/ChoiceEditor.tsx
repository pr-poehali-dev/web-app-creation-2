import { ChoiceParagraph, Novel, ChoiceParagraph as ChoiceType } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface ChoiceEditorProps {
  paragraph: ChoiceParagraph;
  index: number;
  novel: Novel;
  onUpdate: (index: number, updatedParagraph: ChoiceParagraph) => void;
  handleSelectChoice: (optIndex: number, choiceId: string) => void;
  addChoiceToLibrary: (optIndex: number) => void;
}

function ChoiceEditor({ 
  paragraph, 
  index, 
  novel, 
  onUpdate, 
  handleSelectChoice,
  addChoiceToLibrary
}: ChoiceEditorProps) {
  const getPathRelatedCount = (pathId: string) => {
    const relatedEpisodes = novel.episodes.filter(ep => ep.requiredPath === pathId);
    let relatedChoicesCount = 0;
    
    novel.episodes.forEach(ep => {
      ep.paragraphs.forEach(p => {
        if (p.type === 'choice') {
          const choicePara = p as ChoiceType;
          const opts = choicePara.options?.filter(opt => opt.requiredPath === pathId) || [];
          relatedChoicesCount += opts.length;
        }
      });
    });
    
    return relatedEpisodes.length + relatedChoicesCount;
  };
  return (
    <div className="space-y-2">
      <Input
        placeholder="Вопрос"
        value={paragraph.question}
        onChange={(e) =>
          onUpdate(index, { ...paragraph, question: e.target.value })
        }
        className="text-foreground"
      />
      <div className="flex gap-2 mb-3">
        <Select
          value="manual"
          onValueChange={(value) => {
            if (value !== 'manual') handleSelectChoice(0, value);
          }}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue placeholder="Загрузить из библиотеки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Ввести вручную</SelectItem>
            {novel.library.choices.map((choice) => (
              <SelectItem key={choice.id} value={choice.id}>{choice.question}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addChoiceToLibrary(0)}
          title="Сохранить в библиотеку"
        >
          <Icon name="BookmarkPlus" size={14} />
        </Button>
      </div>
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
          <div className="space-y-2 p-2 bg-muted/30 rounded">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Icon name="GitBranch" size={12} />
                  Активирует путь
                </Label>
                <Select
                  value={option.activatesPath || 'none'}
                  onValueChange={(value) => {
                    const newOptions = [...paragraph.options];
                    newOptions[optIndex] = { ...option, activatesPath: value === 'none' ? undefined : value };
                    onUpdate(index, { ...paragraph, options: newOptions });
                  }}
                >
                  <SelectTrigger className="text-foreground text-xs h-8">
                    <SelectValue placeholder="Нет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет</SelectItem>
                    {novel.paths?.map((path) => {
                      const relatedCount = getPathRelatedCount(path.id);
                      
                      return (
                        <SelectItem key={path.id} value={path.id}>
                          {path.name}
                          {relatedCount > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({relatedCount} связ.)
                            </span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {option.activatesPath && (() => {
                  const path = novel.paths?.find(p => p.id === option.activatesPath);
                  if (!path) return null;
                  
                  const relatedEpisodes = novel.episodes.filter(ep => ep.requiredPath === path.id);
                  let relatedChoicesCount = 0;
                  
                  novel.episodes.forEach(ep => {
                    ep.paragraphs.forEach(p => {
                      if (p.type === 'choice') {
                        const choicePara = p as ChoiceType;
                        const opts = choicePara.options?.filter(opt => opt.requiredPath === path.id) || [];
                        relatedChoicesCount += opts.length;
                      }
                    });
                  });
                  
                  if (relatedEpisodes.length === 0 && relatedChoicesCount === 0) return null;
                  
                  return (
                    <div className="mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="Link" size={10} />
                        <span>Связано:</span>
                      </div>
                      {relatedEpisodes.length > 0 && (
                        <div className="ml-3">• {relatedEpisodes.length} эпизод(ов)</div>
                      )}
                      {relatedChoicesCount > 0 && (
                        <div className="ml-3">• {relatedChoicesCount} вариант(ов)</div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Icon name="Lock" size={12} />
                  Требует путь
                </Label>
                <Select
                  value={option.requiredPath || 'none'}
                  onValueChange={(value) => {
                    const newOptions = [...paragraph.options];
                    newOptions[optIndex] = { ...option, requiredPath: value === 'none' ? undefined : value };
                    onUpdate(index, { ...paragraph, options: newOptions });
                  }}
                >
                  <SelectTrigger className="text-foreground text-xs h-8">
                    <SelectValue placeholder="Нет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет</SelectItem>
                    {novel.paths?.map((path) => (
                      <SelectItem key={path.id} value={path.id}>{path.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={option.oneTime || false}
                  onChange={(e) => {
                    const newOptions = [...paragraph.options];
                    newOptions[optIndex] = { ...option, oneTime: e.target.checked };
                    onUpdate(index, { ...paragraph, options: newOptions });
                  }}
                  className="rounded"
                />
                Одноразовый
              </label>
            </div>
          </div>

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
                          {para.type === 'choice' && para.question ? ` - ${para.question.slice(0, 20)}...` : ''}
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
        variant="outline"
        size="sm"
        onClick={() => {
          onUpdate(index, {
            ...paragraph,
            options: [...paragraph.options, { id: `opt${Date.now()}`, text: 'Новый вариант' }]
          });
        }}
        className="w-full"
      >
        <Icon name="Plus" size={14} className="mr-2" />
        Добавить вариант
      </Button>
    </div>
  );
}

export default ChoiceEditor;