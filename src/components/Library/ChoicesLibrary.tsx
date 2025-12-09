import { useState } from 'react';
import { Novel, LibraryChoice } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface ChoicesLibraryProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function ChoicesLibrary({ novel, onUpdate }: ChoicesLibraryProps) {
  const [newChoice, setNewChoice] = useState<Partial<LibraryChoice>>({});

  const handleAddChoice = () => {
    if (!newChoice.text) return;

    const choice: LibraryChoice = {
      id: `choice${Date.now()}`,
      text: newChoice.text,
      nextEpisodeId: newChoice.nextEpisodeId
    };

    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        choices: [...novel.library.choices, choice]
      }
    });

    setNewChoice({});
  };

  const handleDeleteChoice = (choiceId: string) => {
    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        choices: novel.library.choices.filter(c => c.id !== choiceId)
      }
    });
  };

  return (
    <div className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Добавить вариант выбора</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Текст варианта</Label>
            <Input
              placeholder="Текст варианта выбора"
              value={newChoice.text || ''}
              onChange={(e) => setNewChoice({ ...newChoice, text: e.target.value })}
              className="text-foreground mt-1"
            />
          </div>
          <div>
            <Label>Следующий эпизод (опционально)</Label>
            <Select
              value={newChoice.nextEpisodeId || 'none'}
              onValueChange={(value) => setNewChoice({ ...newChoice, nextEpisodeId: value === 'none' ? undefined : value })}
            >
              <SelectTrigger className="text-foreground mt-1">
                <SelectValue placeholder="Не выбран" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не выбран</SelectItem>
                {novel.episodes.map((ep) => (
                  <SelectItem key={ep.id} value={ep.id}>{ep.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddChoice} className="w-full">
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить вариант
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {novel.library.choices.map((choice) => (
          <Card key={choice.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-foreground font-medium">{choice.text}</p>
                  {choice.nextEpisodeId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      → {novel.episodes.find(ep => ep.id === choice.nextEpisodeId)?.title || 'Неизвестный эпизод'}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDeleteChoice(choice.id)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ChoicesLibrary;
