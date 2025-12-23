import { useState, useEffect } from 'react';
import { Novel, Episode, Paragraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MergedParagraphsLayout from '@/components/NovelReader/MergedParagraphsLayout';

interface VisualEditorProps {
  novel: Novel;
  onSave: (novel: Novel) => void;
  onClose: () => void;
}

function VisualEditor({ novel, onSave, onClose }: VisualEditorProps) {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState(0);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  const selectedEpisode = novel.episodes[selectedEpisodeIndex];
  const selectedParagraph = selectedEpisode?.paragraphs[selectedParagraphIndex];

  const goToNextParagraph = () => {
    if (!selectedEpisode) return;
    if (selectedParagraphIndex < selectedEpisode.paragraphs.length - 1) {
      setSelectedParagraphIndex(selectedParagraphIndex + 1);
    }
  };

  const goToPreviousParagraph = () => {
    if (selectedParagraphIndex > 0) {
      setSelectedParagraphIndex(selectedParagraphIndex - 1);
    }
  };

  const updateParagraph = (updates: Partial<Paragraph>) => {
    if (!selectedEpisode) return;
    const updatedEpisodes = [...novel.episodes];
    updatedEpisodes[selectedEpisodeIndex].paragraphs[selectedParagraphIndex] = {
      ...selectedEpisode.paragraphs[selectedParagraphIndex],
      ...updates,
    };
    onSave({ ...novel, episodes: updatedEpisodes });
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
          url: 'https://cdn.poehali.dev/files/How to create Picture wheel morph transition in PowerPoint.jpg',
          objectFit: 'cover',
        };
        break;
      case 'choice':
        newParagraph = {
          ...baseParagraph,
          type: 'choice',
          question: 'Вопрос',
          options: [
            { id: 'opt1', text: 'Вариант 1' },
            { id: 'opt2', text: 'Вариант 2' },
          ],
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

    const updatedEpisodes = [...novel.episodes];
    updatedEpisodes[selectedEpisodeIndex].paragraphs.push(newParagraph);
    onSave({ ...novel, episodes: updatedEpisodes });
    setSelectedParagraphIndex(selectedEpisode.paragraphs.length);
  };

  const deleteParagraph = () => {
    if (!selectedEpisode || selectedEpisode.paragraphs.length <= 1) {
      alert('Нельзя удалить единственный параграф');
      return;
    }

    const updatedEpisodes = [...novel.episodes];
    updatedEpisodes[selectedEpisodeIndex].paragraphs.splice(
      selectedParagraphIndex,
      1
    );
    onSave({ ...novel, episodes: updatedEpisodes });
    setSelectedParagraphIndex(Math.max(0, selectedParagraphIndex - 1));
  };

  const currentBackground = (() => {
    if (!selectedEpisode) return null;
    for (let i = selectedParagraphIndex; i >= 0; i--) {
      const para = selectedEpisode.paragraphs[i];
      if (para.type === 'background') {
        return para;
      }
    }
    return null;
  })();

  const hasComicFrames = selectedParagraph?.comicFrames && selectedParagraph.comicFrames.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextParagraph();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousParagraph();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedParagraphIndex, selectedEpisode]);

  return (
    <div className="fixed inset-0 bg-[#151d28] z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
          <h1 className="text-xl font-bold">Визуальный редактор</h1>
          <Select
            value={selectedEpisodeIndex.toString()}
            onValueChange={(v) => {
              setSelectedEpisodeIndex(parseInt(v));
              setSelectedParagraphIndex(0);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {novel.episodes.map((ep, idx) => (
                <SelectItem key={ep.id} value={idx.toString()}>
                  {ep.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
          >
            <Icon
              name={showPropertiesPanel ? 'PanelRightClose' : 'PanelRightOpen'}
              size={16}
            />
          </Button>
          <Button onClick={() => onSave(novel)} size="sm">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 lg:flex-row">
          <div
            className="flex-1 relative bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: !hasComicFrames && currentBackground
                ? `url(${(currentBackground as any).url})`
                : !hasComicFrames 
                  ? 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)'
                  : 'none',
              backgroundPosition:
                (currentBackground as any)?.objectPosition || 'center',
            }}
          >
            {hasComicFrames && selectedParagraph.comicFrames && selectedParagraph.comicFrames.length > 0 && (
              <div className="absolute inset-0">
                <MergedParagraphsLayout
                  layout={selectedParagraph.frameLayout || 'single'}
                >
                  {selectedParagraph.comicFrames.filter(f => f.url).map((frame) => (
                    <div key={frame.id} className="w-full h-full">
                      <img
                        src={frame.url}
                        alt={frame.alt || ''}
                        className="w-full h-full object-cover"
                        style={{
                          objectFit: frame.objectFit || 'cover',
                          objectPosition: frame.objectPosition || 'center',
                        }}
                      />
                    </div>
                  ))}
                </MergedParagraphsLayout>
              </div>
            )}

            {!hasComicFrames && selectedParagraph?.type === 'background' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 inline-block">
                    <Icon name="Image" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Фоновое изображение</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Откройте панель справа для редактирования
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative overflow-y-auto" style={{ backgroundColor: '#151d28' }}>
            <div className="min-h-full flex items-center justify-center p-8">
              {selectedParagraph && selectedParagraph.type !== 'background' && (
                <Card 
                  className="max-w-2xl w-full p-8 bg-card/90 backdrop-blur-sm shadow-2xl cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => setShowPropertiesPanel(true)}
                >
                  {selectedParagraph.type === 'text' && (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-lg whitespace-pre-wrap">
                        {(selectedParagraph as any).content}
                      </p>
                    </div>
                  )}

                  {selectedParagraph.type === 'dialogue' && (
                    <div className="space-y-4">
                      {(selectedParagraph as any).characterImage && (
                        <img
                          src={(selectedParagraph as any).characterImage}
                          alt={(selectedParagraph as any).characterName}
                          className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary"
                        />
                      )}
                      <div className="text-center">
                        <p className="font-bold text-xl text-primary">
                          {(selectedParagraph as any).characterName}
                        </p>
                        <p className="mt-3 text-lg">
                          {(selectedParagraph as any).text}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedParagraph.type === 'choice' && (
                    <div className="space-y-4">
                      <p className="text-xl font-semibold text-center">
                        {(selectedParagraph as any).question}
                      </p>
                      <div className="space-y-2 mt-4">
                        {((selectedParagraph as any).options || []).map(
                          (option: any) => (
                            <Button
                              key={option.id}
                              variant="outline"
                              className="w-full text-left justify-start"
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
                      <p className="text-muted-foreground">
                        {(selectedParagraph as any).description}
                      </p>
                    </div>
                  )}

                  {selectedParagraph.type === 'image' && (
                    <div>
                      <img
                        src={(selectedParagraph as any).url}
                        alt="Image"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </Card>
              )}

              {selectedParagraph?.type === 'background' && (
                <div className="text-center text-muted-foreground">
                  <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Это фоновый слайд</p>
                  <p className="text-sm mt-2">Текст появится на следующих слайдах</p>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousParagraph}
              disabled={selectedParagraphIndex === 0}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>

            <div className="flex items-center gap-2 min-w-[120px] justify-center">
              <span className="text-sm font-medium">
                {selectedParagraphIndex + 1} / {selectedEpisode?.paragraphs.length || 0}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextParagraph}
              disabled={
                !selectedEpisode ||
                selectedParagraphIndex >= selectedEpisode.paragraphs.length - 1
              }
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </div>

        {showPropertiesPanel && (
          <div className="w-96 bg-background border-l flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold mb-3">Добавить элемент</h2>
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
              {selectedParagraph && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Свойства</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deleteParagraph}
                      className="text-destructive"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>

                  {(selectedParagraph.type === 'text' || selectedParagraph.type === 'dialogue') && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Комикс-фреймы
                        </label>
                        <div className="space-y-2">
                          {(selectedParagraph.comicFrames || []).map((frame, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                value={frame.url}
                                onChange={(e) => {
                                  const newFrames = [...(selectedParagraph.comicFrames || [])];
                                  newFrames[idx] = { ...newFrames[idx], url: e.target.value };
                                  updateParagraph({ comicFrames: newFrames });
                                }}
                                placeholder="URL изображения"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newFrames = [...(selectedParagraph.comicFrames || [])];
                                  newFrames.splice(idx, 1);
                                  updateParagraph({ comicFrames: newFrames });
                                }}
                              >
                                <Icon name="X" size={14} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              const newFrames = [
                                ...(selectedParagraph.comicFrames || []),
                                {
                                  id: `frame-${Date.now()}`,
                                  type: 'image' as const,
                                  url: '',
                                },
                              ];
                              updateParagraph({ comicFrames: newFrames });
                            }}
                          >
                            <Icon name="Plus" size={14} className="mr-2" />
                            Добавить фрейм
                          </Button>
                        </div>
                      </div>

                      {hasComicFrames && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Раскладка фреймов
                          </label>
                          <Select
                            value={selectedParagraph.frameLayout || 'single'}
                            onValueChange={(value) =>
                              updateParagraph({ frameLayout: value as any })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">1 фрейм</SelectItem>
                              <SelectItem value="horizontal-2">2 в ряд</SelectItem>
                              <SelectItem value="horizontal-3">3 в ряд</SelectItem>
                              <SelectItem value="vertical-2">2 вертикально</SelectItem>
                              <SelectItem value="grid-2x2">Сетка 2x2</SelectItem>
                              <SelectItem value="grid-3x3">Сетка 3x3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {selectedParagraph.type === 'text' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Текст</label>
                      <Textarea
                        value={(selectedParagraph as any).content}
                        onChange={(e) => updateParagraph({ content: e.target.value })}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
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
                          URL изображения
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
                          placeholder="center, top, 50% 30%"
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
                              <div key={idx} className="flex gap-2">
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newOptions = [
                                      ...(selectedParagraph as any).options,
                                    ];
                                    newOptions.splice(idx, 1);
                                    updateParagraph({ options: newOptions });
                                  }}
                                >
                                  <Icon name="X" size={14} />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
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
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualEditor;