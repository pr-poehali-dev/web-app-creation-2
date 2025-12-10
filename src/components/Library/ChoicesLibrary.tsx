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

interface NewOption {
  id: string;
  text: string;
  nextEpisodeId?: string;
  nextParagraphIndex?: number;
}

function ChoicesLibrary({ novel, onUpdate }: ChoicesLibraryProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState<NewOption[]>([]);
  const [currentOptionText, setCurrentOptionText] = useState('');
  const [currentOptionEpisode, setCurrentOptionEpisode] = useState<string>('none');
  const [currentOptionParagraph, setCurrentOptionParagraph] = useState<number | undefined>(undefined);

  const handleAddOption = () => {
    if (!currentOptionText) return;

    const option: NewOption = {
      id: `opt${Date.now()}`,
      text: currentOptionText,
      nextEpisodeId: currentOptionEpisode !== 'none' ? currentOptionEpisode : undefined,
      nextParagraphIndex: currentOptionParagraph
    };

    setNewOptions([...newOptions, option]);
    setCurrentOptionText('');
    setCurrentOptionEpisode('none');
    setCurrentOptionParagraph(undefined);
  };

  const handleRemoveOption = (optionId: string) => {
    setNewOptions(newOptions.filter(opt => opt.id !== optionId));
  };

  const handleAddChoice = () => {
    if (!newQuestion || newOptions.length === 0) return;

    const choice: LibraryChoice = {
      id: `choice${Date.now()}`,
      question: newQuestion,
      options: newOptions
    };

    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        choices: [...novel.library.choices, choice]
      }
    });

    setNewQuestion('');
    setNewOptions([]);
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

  const selectedEpisode = currentOptionEpisode !== 'none' 
    ? novel.episodes.find(ep => ep.id === currentOptionEpisode)
    : null;

  return (
    <div className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Добавить вариант выбора</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Вопрос</Label>
            <Input
              placeholder="Куда ты направишься?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="text-foreground mt-1"
            />
          </div>

          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-semibold">Варианты ответа</Label>
            
            <div className="space-y-2">
              <Input
                placeholder="Текст варианта"
                value={currentOptionText}
                onChange={(e) => setCurrentOptionText(e.target.value)}
                className="text-foreground"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Эпизод</Label>
                  <Select
                    value={currentOptionEpisode}
                    onValueChange={(value) => {
                      setCurrentOptionEpisode(value);
                      setCurrentOptionParagraph(undefined);
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
                </div>

                <div>
                  <Label className="text-xs">Параграф</Label>
                  <Select
                    value={currentOptionParagraph?.toString() || 'none'}
                    onValueChange={(value) => setCurrentOptionParagraph(value === 'none' ? undefined : parseInt(value))}
                    disabled={!selectedEpisode}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Не выбран</SelectItem>
                      {selectedEpisode?.paragraphs.map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Параграф {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAddOption} variant="outline" className="w-full" size="sm">
                <Icon name="Plus" size={14} className="mr-2" />
                Добавить вариант
              </Button>
            </div>

            {newOptions.length > 0 && (
              <div className="space-y-2 border-t pt-2">
                {newOptions.map((option) => {
                  const episode = option.nextEpisodeId 
                    ? novel.episodes.find(ep => ep.id === option.nextEpisodeId)
                    : null;
                  
                  return (
                    <div key={option.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{option.text}</p>
                        {episode && (
                          <p className="text-xs text-muted-foreground">
                            → {episode.title}
                            {option.nextParagraphIndex !== undefined && ` (параграф ${option.nextParagraphIndex + 1})`}
                          </p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveOption(option.id)}
                      >
                        <Icon name="X" size={12} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button 
            onClick={handleAddChoice} 
            className="w-full"
            disabled={!newQuestion || newOptions.length === 0}
          >
            <Icon name="Check" size={16} className="mr-2" />
            Создать выбор
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {novel.library.choices.map((choice) => {
          if (!choice.options || !Array.isArray(choice.options)) {
            return null;
          }
          
          return (
            <Card key={choice.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-foreground font-bold mb-2">{choice.question}</p>
                    <div className="space-y-1">
                      {choice.options.map((option) => {
                      const episode = option.nextEpisodeId 
                        ? novel.episodes.find(ep => ep.id === option.nextEpisodeId)
                        : null;
                      
                      return (
                        <div key={option.id} className="text-sm">
                          <span className="text-foreground">• {option.text}</span>
                          {episode && (
                            <span className="text-xs text-muted-foreground ml-2">
                              → {episode.title}
                              {option.nextParagraphIndex !== undefined && ` (¶${option.nextParagraphIndex + 1})`}
                            </span>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive flex-shrink-0"
                    onClick={() => handleDeleteChoice(choice.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ChoicesLibrary;