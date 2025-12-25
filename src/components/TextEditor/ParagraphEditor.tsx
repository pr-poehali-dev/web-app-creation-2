import { Paragraph, TextParagraph, DialogueParagraph, ChoiceParagraph, ItemParagraph } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ParagraphEditorProps {
  paragraph: Paragraph;
  onUpdate: (updates: Partial<Paragraph>) => void;
}

export default function ParagraphEditor({ paragraph, onUpdate }: ParagraphEditorProps) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {paragraph.type === 'text' && 'Текстовый параграф'}
          {paragraph.type === 'dialogue' && 'Диалог'}
          {paragraph.type === 'choice' && 'Выбор'}
          {paragraph.type === 'item' && 'Предмет'}
        </h2>
      </div>

      {paragraph.type === 'text' && (
        <TextEditor paragraph={paragraph} onUpdate={onUpdate} />
      )}

      {paragraph.type === 'dialogue' && (
        <DialogueEditor paragraph={paragraph} onUpdate={onUpdate} />
      )}

      {paragraph.type === 'choice' && (
        <ChoiceEditor paragraph={paragraph} onUpdate={onUpdate} />
      )}

      {paragraph.type === 'item' && (
        <ItemEditor paragraph={paragraph} onUpdate={onUpdate} />
      )}
    </div>
  );
}

function TextEditor({ 
  paragraph, 
  onUpdate 
}: { 
  paragraph: TextParagraph; 
  onUpdate: (updates: Partial<Paragraph>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Текст</Label>
        <Textarea
          value={paragraph.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={10}
          className="mt-2 font-serif"
          placeholder="Введите текст..."
        />
      </div>
    </div>
  );
}

function DialogueEditor({
  paragraph,
  onUpdate
}: {
  paragraph: DialogueParagraph;
  onUpdate: (updates: Partial<Paragraph>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Имя персонажа</Label>
        <Input
          value={paragraph.characterName}
          onChange={(e) => onUpdate({ characterName: e.target.value })}
          className="mt-2"
          placeholder="Имя персонажа"
        />
      </div>

      <div>
        <Label>Изображение персонажа (URL)</Label>
        <Input
          value={paragraph.characterImage || ''}
          onChange={(e) => onUpdate({ characterImage: e.target.value })}
          className="mt-2"
          placeholder="https://example.com/character.jpg"
        />
      </div>

      <div>
        <Label>Текст диалога</Label>
        <Textarea
          value={paragraph.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          rows={6}
          className="mt-2"
          placeholder="Что говорит персонаж..."
        />
      </div>
    </div>
  );
}

function ChoiceEditor({
  paragraph,
  onUpdate
}: {
  paragraph: ChoiceParagraph;
  onUpdate: (updates: Partial<Paragraph>) => void;
}) {
  const addOption = () => {
    const newOption = {
      id: `option-${Date.now()}`,
      text: 'Новый вариант'
    };

    onUpdate({
      options: [...paragraph.options, newOption]
    });
  };

  const updateOption = (optionId: string, updates: Partial<typeof paragraph.options[0]>) => {
    onUpdate({
      options: paragraph.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const deleteOption = (optionId: string) => {
    onUpdate({
      options: paragraph.options.filter(opt => opt.id !== optionId)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Вопрос</Label>
        <Input
          value={paragraph.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          className="mt-2"
          placeholder="Что выбрать?"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Варианты ответа</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addOption}
          >
            <Icon name="Plus" size={14} className="mr-2" />
            Добавить
          </Button>
        </div>

        <div className="space-y-2">
          {paragraph.options.map((option, index) => (
            <div
              key={option.id}
              className="p-3 border rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Вариант {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteOption(option.id)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Icon name="Trash2" size={12} />
                </Button>
              </div>

              <Input
                value={option.text}
                onChange={(e) => updateOption(option.id, { text: e.target.value })}
                placeholder="Текст варианта"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemEditor({
  paragraph,
  onUpdate
}: {
  paragraph: ItemParagraph;
  onUpdate: (updates: Partial<Paragraph>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Название предмета</Label>
        <Input
          value={paragraph.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="mt-2"
          placeholder="Название"
        />
      </div>

      <div>
        <Label>Описание</Label>
        <Textarea
          value={paragraph.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={4}
          className="mt-2"
          placeholder="Описание предмета"
        />
      </div>

      <div>
        <Label>Изображение (URL)</Label>
        <Input
          value={paragraph.imageUrl || ''}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          className="mt-2"
          placeholder="https://example.com/item.jpg"
        />
      </div>
    </div>
  );
}
