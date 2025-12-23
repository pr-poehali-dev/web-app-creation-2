import { useState } from 'react';
import { Novel, Episode, Paragraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EpisodeEditorProps {
  novel: Novel;
  onSave: (novel: Novel) => void;
  onClose: () => void;
}

function EpisodeEditor({ novel, onSave, onClose }: EpisodeEditorProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(
    novel.episodes[0] || null
  );
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number>(0);

  const handleSave = () => {
    onSave(novel);
  };

  const selectedParagraph = selectedEpisode?.paragraphs[selectedParagraphIndex];

  const addNewEpisode = () => {
    const newEpisode: Episode = {
      id: `episode-${Date.now()}`,
      title: 'Новый эпизод',
      paragraphs: [],
      position: { x: 0, y: 0 },
    };
    novel.episodes.push(newEpisode);
    setSelectedEpisode(newEpisode);
  };

  const addParagraph = (type: Paragraph['type']) => {
    if (!selectedEpisode) return;

    const baseParagraph = {
      id: `paragraph-${Date.now()}`,
      order: selectedEpisode.paragraphs.length,
    };

    let newParagraph: Paragraph;

    switch (type) {
      case 'text':
        newParagraph = { ...baseParagraph, type: 'text', content: 'Новый текст' };
        break;
      case 'dialogue':
        newParagraph = {
          ...baseParagraph,
          type: 'dialogue',
          characterName: 'Персонаж',
          text: 'Текст диалога',
        };
        break;
      case 'background':
        newParagraph = {
          ...baseParagraph,
          type: 'background',
          url: '',
          objectFit: 'cover',
        };
        break;
      case 'choice':
        newParagraph = {
          ...baseParagraph,
          type: 'choice',
          question: 'Вопрос',
          options: [],
        };
        break;
      case 'item':
        newParagraph = {
          ...baseParagraph,
          type: 'item',
          name: 'Предмет',
          description: 'Описание',
          itemType: 'collectible',
        };
        break;
      case 'image':
        newParagraph = { ...baseParagraph, type: 'image', url: '' };
        break;
      default:
        return;
    }

    selectedEpisode.paragraphs.push(newParagraph);
    setSelectedParagraphIndex(selectedEpisode.paragraphs.length - 1);
  };

  const updateParagraph = (updates: Partial<Paragraph>) => {
    if (!selectedEpisode || selectedParagraphIndex === null) return;

    selectedEpisode.paragraphs[selectedParagraphIndex] = {
      ...selectedEpisode.paragraphs[selectedParagraphIndex],
      ...updates,
    };
  };

  const deleteParagraph = (index: number) => {
    if (!selectedEpisode) return;
    selectedEpisode.paragraphs.splice(index, 1);
    if (selectedParagraphIndex >= selectedEpisode.paragraphs.length) {
      setSelectedParagraphIndex(Math.max(0, selectedEpisode.paragraphs.length - 1));
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">Редактор эпизодов</h1>
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r flex flex-col">
          <div className="p-4 border-b">
            <Button onClick={addNewEpisode} className="w-full">
              <Icon name="Plus" size={16} className="mr-2" />
              Новый эпизод
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {novel.episodes.map((episode) => (
                <Button
                  key={episode.id}
                  variant={selectedEpisode?.id === episode.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedEpisode(episode);
                    setSelectedParagraphIndex(0);
                  }}
                >
                  <Icon name="FileText" size={16} className="mr-2" />
                  {episode.title}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addParagraph('text')}
                title="Текст"
              >
                <Icon name="Type" size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addParagraph('dialogue')}
                title="Диалог"
              >
                <Icon name="MessageSquare" size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addParagraph('background')}
                title="Фон"
              >
                <Icon name="Image" size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addParagraph('choice')}
                title="Выбор"
              >
                <Icon name="GitBranch" size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addParagraph('item')}
                title="Предмет"
              >
                <Icon name="Package" size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addParagraph('image')}
                title="Изображение"
              >
                <Icon name="FileImage" size={16} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {selectedEpisode?.paragraphs.map((paragraph, index) => (
                <div
                  key={paragraph.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                    selectedParagraphIndex === index ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedParagraphIndex(index)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={
                          paragraph.type === 'text'
                            ? 'Type'
                            : paragraph.type === 'dialogue'
                            ? 'MessageSquare'
                            : paragraph.type === 'background'
                            ? 'Image'
                            : paragraph.type === 'choice'
                            ? 'GitBranch'
                            : paragraph.type === 'item'
                            ? 'Package'
                            : 'FileImage'
                        }
                        size={14}
                      />
                      <span className="text-sm truncate">
                        {paragraph.type === 'text'
                          ? (paragraph as any).content?.slice(0, 30)
                          : paragraph.type === 'dialogue'
                          ? (paragraph as any).characterName
                          : paragraph.type === 'choice'
                          ? (paragraph as any).question
                          : paragraph.type === 'item'
                          ? (paragraph as any).name
                          : 'Слайд ' + (index + 1)}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteParagraph(index);
                    }}
                  >
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedParagraph && (
            <Tabs defaultValue="edit" className="flex-1 flex flex-col">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="edit">Редактирование</TabsTrigger>
                <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="flex-1 overflow-auto">
                <div className="p-6 space-y-4">
                  {selectedParagraph.type === 'text' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Текст</label>
                        <Textarea
                          value={(selectedParagraph as any).content}
                          onChange={(e) => updateParagraph({ content: e.target.value })}
                          rows={6}
                        />
                      </div>
                    </>
                  )}

                  {selectedParagraph.type === 'dialogue' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Имя персонажа
                        </label>
                        <Input
                          value={(selectedParagraph as any).characterName}
                          onChange={(e) =>
                            updateParagraph({ characterName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Текст</label>
                        <Textarea
                          value={(selectedParagraph as any).text}
                          onChange={(e) => updateParagraph({ text: e.target.value })}
                          rows={6}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          URL изображения персонажа
                        </label>
                        <Input
                          value={(selectedParagraph as any).characterImage || ''}
                          onChange={(e) =>
                            updateParagraph({ characterImage: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  )}

                  {selectedParagraph.type === 'background' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">URL фона</label>
                        <Input
                          value={(selectedParagraph as any).url}
                          onChange={(e) => updateParagraph({ url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Позиция (object-position)
                        </label>
                        <Input
                          value={(selectedParagraph as any).objectPosition || 'center'}
                          onChange={(e) =>
                            updateParagraph({ objectPosition: e.target.value })
                          }
                          placeholder="center, top, 50% 30%, etc."
                        />
                      </div>
                    </>
                  )}

                  {selectedParagraph.type === 'choice' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Вопрос</label>
                        <Input
                          value={(selectedParagraph as any).question}
                          onChange={(e) => updateParagraph({ question: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Варианты</label>
                        <div className="space-y-2">
                          {((selectedParagraph as any).options || []).map(
                            (option: any, idx: number) => (
                              <Card key={idx} className="p-3">
                                <Input
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [
                                      ...(selectedParagraph as any).options,
                                    ];
                                    newOptions[idx] = {
                                      ...newOptions[idx],
                                      text: e.target.value,
                                    };
                                    updateParagraph({ options: newOptions });
                                  }}
                                />
                              </Card>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [
                                ...(selectedParagraph as any).options,
                                { id: `opt-${Date.now()}`, text: 'Новый вариант' },
                              ];
                              updateParagraph({ options: newOptions });
                            }}
                          >
                            <Icon name="Plus" size={14} className="mr-2" />
                            Добавить вариант
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedParagraph.type === 'item' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Название</label>
                        <Input
                          value={(selectedParagraph as any).name}
                          onChange={(e) => updateParagraph({ name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Описание</label>
                        <Textarea
                          value={(selectedParagraph as any).description}
                          onChange={(e) =>
                            updateParagraph({ description: e.target.value })
                          }
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          URL изображения
                        </label>
                        <Input
                          value={(selectedParagraph as any).imageUrl || ''}
                          onChange={(e) => updateParagraph({ imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  )}

                  {selectedParagraph.type === 'image' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          URL изображения
                        </label>
                        <Input
                          value={(selectedParagraph as any).url}
                          onChange={(e) => updateParagraph({ url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-auto">
                <div className="h-full flex items-center justify-center bg-muted/20 p-6">
                  <Card className="max-w-2xl w-full p-8">
                    {selectedParagraph.type === 'text' && (
                      <p className="text-lg whitespace-pre-wrap">
                        {(selectedParagraph as any).content}
                      </p>
                    )}

                    {selectedParagraph.type === 'dialogue' && (
                      <div className="space-y-4">
                        {(selectedParagraph as any).characterImage && (
                          <img
                            src={(selectedParagraph as any).characterImage}
                            alt={(selectedParagraph as any).characterName}
                            className="w-24 h-24 rounded-full object-cover mx-auto"
                          />
                        )}
                        <div className="text-center">
                          <p className="font-bold text-lg">
                            {(selectedParagraph as any).characterName}
                          </p>
                          <p className="mt-2">{(selectedParagraph as any).text}</p>
                        </div>
                      </div>
                    )}

                    {selectedParagraph.type === 'background' && (
                      <div className="aspect-video relative rounded-lg overflow-hidden">
                        <img
                          src={(selectedParagraph as any).url}
                          alt="Background"
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition:
                              (selectedParagraph as any).objectPosition || 'center',
                          }}
                        />
                      </div>
                    )}

                    {selectedParagraph.type === 'choice' && (
                      <div className="space-y-4">
                        <p className="text-xl font-semibold text-center">
                          {(selectedParagraph as any).question}
                        </p>
                        <div className="space-y-2">
                          {((selectedParagraph as any).options || []).map(
                            (option: any) => (
                              <Button
                                key={option.id}
                                variant="outline"
                                className="w-full"
                              >
                                {option.text}
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedParagraph.type === 'item' && (
                      <div className="text-center space-y-4">
                        {(selectedParagraph as any).imageUrl && (
                          <img
                            src={(selectedParagraph as any).imageUrl}
                            alt={(selectedParagraph as any).name}
                            className="w-32 h-32 object-contain mx-auto"
                          />
                        )}
                        <h3 className="text-2xl font-bold">
                          {(selectedParagraph as any).name}
                        </h3>
                        <p>{(selectedParagraph as any).description}</p>
                      </div>
                    )}

                    {selectedParagraph.type === 'image' && (
                      <img
                        src={(selectedParagraph as any).url}
                        alt="Image"
                        className="w-full rounded-lg"
                      />
                    )}
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!selectedParagraph && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <Icon name="FileText" size={48} className="mx-auto opacity-20" />
                <p>Выберите слайд для редактирования</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EpisodeEditor;
