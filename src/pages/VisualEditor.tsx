import { useState, useEffect, useRef } from 'react';
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

interface VisualEditorProps {
  novel: Novel;
  onSave: (novel: Novel) => void;
  onClose: () => void;
}

interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'comicFrame';
  panel: 'left' | 'right';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  imageUrl?: string;
  backgroundColor?: string;
  borderRadius?: number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  color?: string;
  shapeType?: 'rectangle' | 'circle' | 'rounded';
  zIndex?: number;
}

function VisualEditor({ novel, onSave, onClose }: VisualEditorProps) {
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState(0);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const leftCanvasRef = useRef<HTMLDivElement>(null);
  const rightCanvasRef = useRef<HTMLDivElement>(null);

  const selectedEpisode = novel.episodes[selectedEpisodeIndex];
  const selectedParagraph = selectedEpisode?.paragraphs[selectedParagraphIndex];
  const selectedElement = elements.find(el => el.id === selectedElementId);

  // Загрузка элементов из параграфа
  useEffect(() => {
    if (!selectedParagraph) return;
    
    const loadedElements: EditorElement[] = [];
    
    // Загружаем комикс-фреймы на левую панель
    if (selectedParagraph.comicFrames && selectedParagraph.comicFrames.length > 0) {
      selectedParagraph.comicFrames.forEach((frame, idx) => {
        if (frame.url) {
          loadedElements.push({
            id: frame.id,
            type: 'comicFrame',
            panel: 'left',
            x: 50 + idx * 220,
            y: 50,
            width: 200,
            height: 200,
            imageUrl: frame.url,
            borderRadius: 8,
            zIndex: idx
          });
        }
      });
    }
    
    // Загружаем текстовый контент на правую панель
    if (selectedParagraph.type === 'text' && (selectedParagraph as any).content) {
      loadedElements.push({
        id: `text-${selectedParagraph.id}`,
        type: 'text',
        panel: 'right',
        x: 50,
        y: 250,
        width: 600,
        height: 150,
        content: (selectedParagraph as any).content,
        fontSize: 18,
        textAlign: 'left',
        color: '#ffffff',
        zIndex: 100
      });
    }
    
    // Загружаем диалог на правую панель
    if (selectedParagraph.type === 'dialogue') {
      const dialogue = selectedParagraph as any;
      loadedElements.push({
        id: `dialogue-${selectedParagraph.id}`,
        type: 'text',
        panel: 'right',
        x: 50,
        y: 250,
        width: 600,
        height: 200,
        content: `${dialogue.characterName}\n\n${dialogue.text}`,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#ffffff',
        zIndex: 100
      });
      
      if (dialogue.characterImage) {
        loadedElements.push({
          id: `char-img-${selectedParagraph.id}`,
          type: 'image',
          panel: 'right',
          x: 250,
          y: 50,
          width: 150,
          height: 150,
          imageUrl: dialogue.characterImage,
          borderRadius: 75,
          zIndex: 101
        });
      }
    }
    
    setElements(loadedElements);
    setSelectedElementId(null);
  }, [selectedParagraphIndex, selectedEpisodeIndex]);

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

  const addElement = (type: EditorElement['type'], panel: 'left' | 'right' = 'right') => {
    const newElement: EditorElement = {
      id: `element-${Date.now()}`,
      type,
      panel,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : 200,
      height: type === 'text' ? 100 : 200,
      zIndex: elements.length,
    };

    if (type === 'text') {
      newElement.content = 'Новый текст';
      newElement.fontSize = 18;
      newElement.textAlign = 'left';
      newElement.color = '#ffffff';
    } else if (type === 'shape') {
      newElement.backgroundColor = '#3b82f6';
      newElement.shapeType = 'rectangle';
      newElement.borderRadius = 8;
    } else if (type === 'image' || type === 'comicFrame') {
      newElement.imageUrl = 'https://cdn.poehali.dev/files/How to create Picture wheel morph transition in PowerPoint.jpg';
      newElement.borderRadius = 8;
    }

    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string, isResize = false) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElementId(elementId);
    
    if (isResize) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialElementState({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    if (!selectedElementId || !initialElementState) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (isDragging) {
      updateElement(selectedElementId, {
        x: initialElementState.x + deltaX,
        y: initialElementState.y + deltaY,
      });
    } else if (isResizing) {
      updateElement(selectedElementId, {
        width: Math.max(50, initialElementState.width + deltaX),
        height: Math.max(50, initialElementState.height + deltaY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setInitialElementState(null);
  };

  const saveToNovel = () => {
    if (!selectedParagraph) return;

    // Сохраняем комикс-фреймы
    const comicFrameElements = elements.filter(el => el.type === 'comicFrame' || el.type === 'image');
    const comicFrames = comicFrameElements.map(el => ({
      id: el.id,
      type: 'image' as const,
      url: el.imageUrl || '',
      objectFit: 'cover' as const,
      objectPosition: 'center'
    }));

    // Сохраняем текстовый контент
    const textElements = elements.filter(el => el.type === 'text');
    let textContent = '';
    
    if (textElements.length > 0) {
      textContent = textElements.map(el => el.content).join('\n\n');
    }

    const updates: any = {};
    
    if (comicFrames.length > 0) {
      updates.comicFrames = comicFrames;
    }
    
    if (selectedParagraph.type === 'text') {
      updates.content = textContent;
    } else if (selectedParagraph.type === 'dialogue') {
      const lines = textContent.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        updates.characterName = lines[0];
        updates.text = lines.slice(1).join('\n');
      }
    }

    updateParagraph(updates);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextParagraph();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousParagraph();
      } else if (e.key === 'Delete' && selectedElementId) {
        deleteElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedParagraphIndex, selectedEpisode, selectedElementId]);

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
          <Button onClick={saveToNovel} size="sm" variant="default">
            <Icon name="Save" size={16} className="mr-2" />
            Применить
          </Button>
          <Button onClick={() => onSave(novel)} size="sm">
            <Icon name="Check" size={16} className="mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-20 bg-background border-r flex flex-col items-center py-4 gap-2">
          <div className="text-xs text-muted-foreground mb-2">Текст</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addElement('text', 'right')}
            title="Текст на правую панель"
          >
            <Icon name="Type" size={20} />
          </Button>
          
          <div className="h-px w-12 bg-border my-2" />
          <div className="text-xs text-muted-foreground mb-2">Фон</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addElement('comicFrame', 'left')}
            title="Фрейм на левую панель"
          >
            <Icon name="Image" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addElement('shape', 'left')}
            title="Фигура на левую панель"
          >
            <Icon name="Square" size={20} />
          </Button>
          
          <div className="h-px w-12 bg-border my-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addParagraph('text')}
            title="Новый слайд"
          >
            <Icon name="FilePlus" size={20} />
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-[#0a0f14]">
          <div className="max-w-7xl mx-auto">
            <div
              className="relative rounded-lg shadow-2xl overflow-hidden flex"
              style={{
                width: '1400px',
                height: '700px',
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Left Panel - Background */}
              <div
                ref={leftCanvasRef}
                className="relative flex-1 bg-cover bg-center"
                style={{
                  backgroundImage: currentBackground
                    ? `url(${(currentBackground as any).url})`
                    : 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)',
                  backgroundPosition: (currentBackground as any)?.objectPosition || 'center',
                }}
                onClick={() => setSelectedElementId(null)}
              >
                {elements
                  .filter(el => el.panel === 'left')
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map((element) => {
                  const isSelected = element.id === selectedElementId;
                  
                  return (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        zIndex: element.zIndex || 0,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                    >
                      {element.type === 'text' && (
                        <div
                          className="w-full h-full p-4 overflow-auto"
                          style={{
                            fontSize: element.fontSize,
                            textAlign: element.textAlign,
                            fontWeight: element.fontWeight,
                            color: element.color,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {element.content}
                        </div>
                      )}

                      {(element.type === 'image' || element.type === 'comicFrame') && (
                        <img
                          src={element.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{
                            borderRadius: element.borderRadius,
                          }}
                        />
                      )}

                      {element.type === 'shape' && (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: element.backgroundColor,
                            borderRadius:
                              element.shapeType === 'circle'
                                ? '50%'
                                : element.borderRadius,
                          }}
                        />
                      )}

                      {isSelected && (
                        <>
                          <div
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize"
                            onMouseDown={(e) => handleMouseDown(e, element.id, true)}
                          />
                          <div className="absolute -top-8 left-0 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  zIndex: Math.max(0, (element.zIndex || 0) - 1),
                                });
                              }}
                            >
                              <Icon name="ArrowDown" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  zIndex: (element.zIndex || 0) + 1,
                                });
                              }}
                            >
                              <Icon name="ArrowUp" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                            >
                              <Icon name="Trash2" size={12} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Panel - Text Content */}
              <div
                ref={rightCanvasRef}
                className="relative flex-1 bg-[#151d28]"
                onClick={() => setSelectedElementId(null)}
              >
                {elements
                  .filter(el => el.panel === 'right')
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map((element) => {
                  const isSelected = element.id === selectedElementId;
                  
                  return (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        zIndex: element.zIndex || 0,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                    >
                      {element.type === 'text' && (
                        <div
                          className="w-full h-full p-4 overflow-auto"
                          style={{
                            fontSize: element.fontSize,
                            textAlign: element.textAlign,
                            fontWeight: element.fontWeight,
                            color: element.color,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {element.content}
                        </div>
                      )}

                      {(element.type === 'image' || element.type === 'comicFrame') && (
                        <img
                          src={element.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{
                            borderRadius: element.borderRadius,
                          }}
                        />
                      )}

                      {element.type === 'shape' && (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: element.backgroundColor,
                            borderRadius:
                              element.shapeType === 'circle'
                                ? '50%'
                                : element.borderRadius,
                          }}
                        />
                      )}

                      {isSelected && (
                        <>
                          <div
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize"
                            onMouseDown={(e) => handleMouseDown(e, element.id, true)}
                          />
                          <div className="absolute -top-8 left-0 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  zIndex: Math.max(0, (element.zIndex || 0) - 1),
                                });
                              }}
                            >
                              <Icon name="ArrowDown" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  zIndex: (element.zIndex || 0) + 1,
                                });
                              }}
                            >
                              <Icon name="ArrowUp" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                            >
                              <Icon name="Trash2" size={12} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={goToPreviousParagraph}
                disabled={selectedParagraphIndex === 0}
              >
                <Icon name="ChevronLeft" size={20} className="mr-2" />
                Предыдущий
              </Button>

              <div className="text-sm text-muted-foreground">
                Слайд {selectedParagraphIndex + 1} из {selectedEpisode?.paragraphs.length || 0}
              </div>

              <Button
                variant="outline"
                onClick={goToNextParagraph}
                disabled={
                  !selectedEpisode ||
                  selectedParagraphIndex >= selectedEpisode.paragraphs.length - 1
                }
              >
                Следующий
                <Icon name="ChevronRight" size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {showPropertiesPanel && (
          <div className="w-80 bg-background border-l flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Свойства</h2>
            </div>

            <ScrollArea className="flex-1">
              {selectedElement ? (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип</label>
                    <div className="text-sm text-muted-foreground capitalize">
                      {selectedElement.type === 'comicFrame' ? 'Комикс-фрейм' : selectedElement.type}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">X</label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Y</label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Ширина</label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.width)}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            width: parseInt(e.target.value) || 50,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Высота</label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.height)}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            height: parseInt(e.target.value) || 50,
                          })
                        }
                      />
                    </div>
                  </div>

                  {selectedElement.type === 'text' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Текст</label>
                        <Textarea
                          value={selectedElement.content || ''}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { content: e.target.value })
                          }
                          rows={6}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Размер шрифта</label>
                        <Input
                          type="number"
                          value={selectedElement.fontSize || 18}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              fontSize: parseInt(e.target.value) || 18,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Выравнивание</label>
                        <Select
                          value={selectedElement.textAlign || 'left'}
                          onValueChange={(value: any) =>
                            updateElement(selectedElement.id, { textAlign: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Слева</SelectItem>
                            <SelectItem value="center">По центру</SelectItem>
                            <SelectItem value="right">Справа</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Цвет текста</label>
                        <Input
                          type="color"
                          value={selectedElement.color || '#ffffff'}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { color: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  {(selectedElement.type === 'image' || selectedElement.type === 'comicFrame') && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">URL изображения</label>
                        <Input
                          value={selectedElement.imageUrl || ''}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { imageUrl: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Скругление углов</label>
                        <Input
                          type="number"
                          value={selectedElement.borderRadius || 0}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              borderRadius: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  {selectedElement.type === 'shape' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Тип фигуры</label>
                        <Select
                          value={selectedElement.shapeType || 'rectangle'}
                          onValueChange={(value: any) =>
                            updateElement(selectedElement.id, { shapeType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rectangle">Прямоугольник</SelectItem>
                            <SelectItem value="rounded">Скругленный</SelectItem>
                            <SelectItem value="circle">Круг</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Цвет фона</label>
                        <Input
                          type="color"
                          value={selectedElement.backgroundColor || '#3b82f6'}
                          onChange={(e) =>
                            updateElement(selectedElement.id, { backgroundColor: e.target.value })
                          }
                        />
                      </div>

                      {selectedElement.shapeType !== 'circle' && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Скругление углов</label>
                          <Input
                            type="number"
                            value={selectedElement.borderRadius || 0}
                            onChange={(e) =>
                              updateElement(selectedElement.id, {
                                borderRadius: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => deleteElement(selectedElement.id)}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить элемент
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="text-center text-muted-foreground py-8">
                    <Icon name="MousePointerClick" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Выберите элемент для редактирования</p>
                    <p className="text-sm mt-2">или добавьте новый с панели слева</p>
                  </div>

                  {selectedParagraph && (
                    <div>
                      <h3 className="font-semibold mb-2">Слайд</h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={deleteParagraph}
                        >
                          <Icon name="Trash2" size={14} className="mr-2" />
                          Удалить слайд
                        </Button>
                      </div>
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