import { useState } from 'react';
import { Choice } from '@/types/scene';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChoicesEditorProps {
  choices: Choice[];
  scenes: { id: string; name: string }[];
  onUpdate: (choices: Choice[]) => void;
}

export default function ChoicesEditor({ choices, scenes, onUpdate }: ChoicesEditorProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    choices.length > 0 ? choices[0].id : null
  );

  const addChoice = () => {
    const newChoice: Choice = {
      id: `choice-${Date.now()}`,
      text: 'Новый выбор',
      variables: {}
    };

    onUpdate([...choices, newChoice]);
    setSelectedChoiceId(newChoice.id);
  };

  const updateChoice = (choiceId: string, updates: Partial<Choice>) => {
    onUpdate(
      choices.map(c => (c.id === choiceId ? { ...c, ...updates } : c))
    );
  };

  const deleteChoice = (choiceId: string) => {
    onUpdate(choices.filter(c => c.id !== choiceId));
    if (selectedChoiceId === choiceId) {
      setSelectedChoiceId(choices.length > 1 ? choices[0].id : null);
    }
  };

  const addVariable = (choiceId: string, key: string, value: any) => {
    const choice = choices.find(c => c.id === choiceId);
    if (!choice) return;

    updateChoice(choiceId, {
      variables: {
        ...choice.variables,
        [key]: value
      }
    });
  };

  const removeVariable = (choiceId: string, key: string) => {
    const choice = choices.find(c => c.id === choiceId);
    if (!choice) return;

    const newVars = { ...choice.variables };
    delete newVars[key];

    updateChoice(choiceId, { variables: newVars });
  };

  const selectedChoice = choices.find(c => c.id === selectedChoiceId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Выборы и ветвления</h3>
        <Button onClick={addChoice}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить выбор
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 col-span-1">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {choices.map(choice => (
                <div
                  key={choice.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    selectedChoiceId === choice.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedChoiceId(choice.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm flex-1 line-clamp-2">{choice.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChoice(choice.id);
                      }}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {selectedChoice && (
          <Card className="p-4 col-span-2">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Текст выбора</Label>
                  <Textarea
                    value={selectedChoice.text}
                    onChange={(e) => updateChoice(selectedChoice.id, { text: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-xs">Переход к сцене</Label>
                  <select
                    value={selectedChoice.targetSceneId || ''}
                    onChange={(e) =>
                      updateChoice(selectedChoice.id, {
                        targetSceneId: e.target.value || undefined
                      })
                    }
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Не выбрано</option>
                    {scenes.map(scene => (
                      <option key={scene.id} value={scene.id}>
                        {scene.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Условие (JavaScript)</Label>
                  <Input
                    value={selectedChoice.condition || ''}
                    onChange={(e) =>
                      updateChoice(selectedChoice.id, { condition: e.target.value || undefined })
                    }
                    placeholder="например: variables.score > 10"
                    className="mt-1 font-mono text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Изменение переменных</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const key = prompt('Имя переменной:');
                        if (key) {
                          const value = prompt('Значение:');
                          addVariable(selectedChoice.id, key, value);
                        }
                      }}
                    >
                      <Icon name="Plus" size={14} className="mr-1" />
                      Добавить
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(selectedChoice.variables || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Input
                          value={key}
                          disabled
                          className="flex-1 font-mono text-xs"
                        />
                        <span className="text-muted-foreground">=</span>
                        <Input
                          value={String(value)}
                          onChange={(e) => {
                            const newValue = isNaN(Number(e.target.value))
                              ? e.target.value
                              : Number(e.target.value);
                            addVariable(selectedChoice.id, key, newValue);
                          }}
                          className="flex-1 font-mono text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeVariable(selectedChoice.id, key)}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}
