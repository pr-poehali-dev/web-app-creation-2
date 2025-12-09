import { ChoiceParagraph, Novel } from '@/types/novel';
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
      {paragraph.options.map((option, optIndex) => (
        <div key={option.id} className="space-y-2 p-3 border border-border rounded-lg">
          <div className="flex gap-2">
            <Select
              value="manual"
              onValueChange={(value) => {
                if (value !== 'manual') handleSelectChoice(optIndex, value);
              }}
            >
              <SelectTrigger className="text-foreground">
                <SelectValue placeholder="Из библиотеки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Ввести вручную</SelectItem>
                {novel.library.choices.map((choice) => (
                  <SelectItem key={choice.id} value={choice.id}>{choice.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addChoiceToLibrary(optIndex)}
              title="Добавить в библиотеку"
            >
              <Icon name="BookmarkPlus" size={14} />
            </Button>
          </div>
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
