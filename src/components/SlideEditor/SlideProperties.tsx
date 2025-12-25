import { Paragraph, FrameAnimationType, ComicFrame, MergeLayoutType } from '@/types/novel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SlidePropertiesProps {
  paragraph: Paragraph;
  onUpdate: (updates: Partial<Paragraph>) => void;
}

export default function SlideProperties({ paragraph, onUpdate }: SlidePropertiesProps) {
  const animations: { value: FrameAnimationType; label: string }[] = [
    { value: 'none', label: 'Без анимации' },
    { value: 'fade', label: 'Появление' },
    { value: 'slide-up', label: 'Снизу вверх' },
    { value: 'slide-down', label: 'Сверху вниз' },
    { value: 'slide-left', label: 'Справа налево' },
    { value: 'slide-right', label: 'Слева направо' },
    { value: 'zoom', label: 'Увеличение' },
    { value: 'zoom-out', label: 'Уменьшение' },
    { value: 'flip', label: 'Переворот' },
    { value: 'rotate-in', label: 'Вращение' },
    { value: 'bounce', label: 'Прыжок' },
    { value: 'shake', label: 'Тряска' },
    { value: 'blur-in', label: 'Размытие' },
    { value: 'glitch', label: 'Глитч' }
  ];

  const layouts: { value: MergeLayoutType; label: string }[] = [
    { value: 'single', label: '1 кадр на весь экран' },
    { value: 'horizontal-2', label: '2 кадра в ряд' },
    { value: 'horizontal-3', label: '3 кадра в ряд' },
    { value: 'horizontal-4', label: '4 кадра в ряд' },
    { value: 'vertical-2', label: '2 кадра вертикально' },
    { value: 'vertical-3', label: '3 кадра вертикально' },
    { value: 'grid-2x2', label: 'Сетка 2×2' },
    { value: 'grid-3x3', label: 'Сетка 3×3' },
    { value: 'mosaic-left', label: 'Мозаика слева' },
    { value: 'mosaic-right', label: 'Мозаика справа' }
  ];

  const updateFrame = (frameId: string, updates: Partial<ComicFrame>) => {
    if (paragraph.comicFrames) {
      onUpdate({
        comicFrames: paragraph.comicFrames.map(f =>
          f.id === frameId ? { ...f, ...updates } : f
        )
      });
    } else if (paragraph.type === 'image' && paragraph.imageFrames) {
      onUpdate({
        imageFrames: paragraph.imageFrames.map(f =>
          f.id === frameId ? { ...f, ...updates } : f
        )
      });
    }
  };

  const deleteFrame = (frameId: string) => {
    if (paragraph.comicFrames) {
      onUpdate({
        comicFrames: paragraph.comicFrames.filter(f => f.id !== frameId)
      });
    } else if (paragraph.type === 'image' && paragraph.imageFrames) {
      onUpdate({
        imageFrames: paragraph.imageFrames.filter(f => f.id !== frameId)
      });
    }
  };

  return (
    <div className="w-80 border-l flex flex-col">
      <div className="h-12 border-b flex items-center px-4">
        <span className="text-sm font-semibold">Свойства</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Контент</TabsTrigger>
              <TabsTrigger value="frames">Фреймы</TabsTrigger>
              <TabsTrigger value="animation">Анимация</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              {paragraph.type === 'text' && (
                <div className="space-y-2">
                  <Label>Текст</Label>
                  <Textarea
                    value={paragraph.content || ''}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    rows={8}
                    placeholder="Введите текст параграфа..."
                  />
                </div>
              )}

              {paragraph.type === 'dialogue' && (
                <>
                  <div className="space-y-2">
                    <Label>Имя персонажа</Label>
                    <Input
                      value={paragraph.characterName || ''}
                      onChange={(e) =>
                        onUpdate({ characterName: e.target.value })
                      }
                      placeholder="Имя"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Текст диалога</Label>
                    <Textarea
                      value={paragraph.text || ''}
                      onChange={(e) => onUpdate({ text: e.target.value })}
                      rows={6}
                      placeholder="Введите диалог..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Изображение персонажа</Label>
                    <Input
                      value={paragraph.characterImage || ''}
                      onChange={(e) =>
                        onUpdate({ characterImage: e.target.value })
                      }
                      placeholder="URL изображения"
                    />
                  </div>
                </>
              )}

              {paragraph.type === 'background' && (
                <>
                  <div className="space-y-2">
                    <Label>URL фона</Label>
                    <Input
                      value={paragraph.url || ''}
                      onChange={(e) => onUpdate({ url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Вписывание (Object Fit)</Label>
                    <Select
                      value={paragraph.objectFit || 'cover'}
                      onValueChange={(value: 'cover' | 'contain' | 'fill') =>
                        onUpdate({ objectFit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="fill">Fill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Позиция (Object Position)</Label>
                    <Input
                      value={paragraph.objectPosition || 'center'}
                      onChange={(e) =>
                        onUpdate({ objectPosition: e.target.value })
                      }
                      placeholder="center, top, 50% 30%"
                    />
                  </div>
                </>
              )}

              {paragraph.type === 'image' && (
                <>
                  <div className="space-y-2">
                    <Label>URL изображения</Label>
                    <Input
                      value={paragraph.url || ''}
                      onChange={(e) => onUpdate({ url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Описание (alt)</Label>
                    <Input
                      value={paragraph.alt || ''}
                      onChange={(e) => onUpdate({ alt: e.target.value })}
                      placeholder="Описание изображения"
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label>ID группы изображений</Label>
                    <Input
                      value={paragraph.imageGroupId || ''}
                      onChange={(e) => onUpdate({ imageGroupId: e.target.value })}
                      placeholder="Оставьте пустым для одиночного изображения"
                    />
                  </div>

                  {paragraph.imageGroupId && (
                    <div className="space-y-2">
                      <Label>Индекс в группе</Label>
                      <Input
                        type="number"
                        value={paragraph.imageGroupIndex ?? 0}
                        onChange={(e) => onUpdate({ imageGroupIndex: parseInt(e.target.value) || 0 })}
                        placeholder="0, 1, 2..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Порядковый номер параграфа в группе (начинается с 0)
                      </p>
                    </div>
                  )}
                </>
              )}

              {paragraph.type === 'choice' && (
                <>
                  <div className="space-y-2">
                    <Label>Вопрос</Label>
                    <Textarea
                      value={paragraph.question || ''}
                      onChange={(e) => onUpdate({ question: e.target.value })}
                      rows={3}
                      placeholder="Введите вопрос..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Варианты ответов</Label>
                    <p className="text-xs text-muted-foreground">
                      Редактируйте через основную панель администратора
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="frames" className="space-y-4 mt-4">
              {((paragraph.comicFrames && paragraph.comicFrames.length > 0) || 
                (paragraph.type === 'image' && paragraph.imageFrames && paragraph.imageFrames.length > 0)) ? (
                <div className="space-y-3">
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <Label className="text-xs font-medium">Раскладка галереи</Label>
                    <Select
                      value={(paragraph.type === 'image' ? paragraph.imageLayout : paragraph.frameLayout) || 'horizontal-3'}
                      onValueChange={(value: MergeLayoutType) => {
                        if (paragraph.type === 'image') {
                          onUpdate({ imageLayout: value });
                        } else {
                          onUpdate({ frameLayout: value });
                        }
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {layouts.map((layout) => (
                          <SelectItem key={layout.value} value={layout.value}>
                            {layout.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Как будут расположены {(paragraph.type === 'image' && paragraph.imageFrames ? paragraph.imageFrames : paragraph.comicFrames || []).length} изображ.
                    </p>
                  </div>

                  {(paragraph.type === 'image' && paragraph.imageFrames ? paragraph.imageFrames : paragraph.comicFrames || []).map((frame, index) => (
                    <div
                      key={frame.id}
                      className="group relative border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-colors"
                    >
                      {/* Превью изображения */}
                      {frame.url && (
                        <div className="relative h-32 bg-muted">
                          <img
                            src={frame.url}
                            alt={frame.alt || `Фрейм ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs font-medium">
                            Фрейм {index + 1}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteFrame(frame.id)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      )}
                      
                      <div className="p-3 space-y-3">
                        {!frame.url && (
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Icon name="Image" size={20} className="text-muted-foreground" />
                              </div>
                              <div className="text-sm font-medium">
                                Фрейм {index + 1}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFrame(frame.id)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label className="text-xs">URL изображения</Label>
                          <Input
                            value={frame.url}
                            onChange={(e) =>
                              updateFrame(frame.id, { url: e.target.value })
                            }
                            placeholder="https://example.com/image.jpg"
                            className="text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Вписывание</Label>
                            <Select
                              value={frame.objectFit || 'cover'}
                              onValueChange={(value: 'cover' | 'contain' | 'fill') =>
                                updateFrame(frame.id, { objectFit: value })
                              }
                            >
                              <SelectTrigger className="text-sm h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cover">Cover</SelectItem>
                                <SelectItem value="contain">Contain</SelectItem>
                                <SelectItem value="fill">Fill</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs">Позиция</Label>
                            <Input
                              value={frame.objectPosition || 'center'}
                              onChange={(e) =>
                                updateFrame(frame.id, {
                                  objectPosition: e.target.value
                                })
                              }
                              placeholder="center"
                              className="text-sm h-9"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Анимация появления</Label>
                          <Select
                            value={frame.animation || 'fade'}
                            onValueChange={(value: FrameAnimationType) =>
                              updateFrame(frame.id, { animation: value })
                            }
                          >
                            <SelectTrigger className="text-sm h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {animations.map((anim) => (
                                <SelectItem key={anim.value} value={anim.value}>
                                  {anim.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Icon name="Images" size={28} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Нет фреймов</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paragraph.type === 'image' && paragraph.imageGroupId
                          ? 'Добавьте изображения в галерею'
                          : 'Создайте группу изображений'}
                      </p>
                    </div>
                    
                    {paragraph.type === 'image' && paragraph.imageGroupId && (
                      <Button
                        onClick={() => {
                          const newFrame: ComicFrame = {
                            id: `frame-${Date.now()}`,
                            type: 'image',
                            url: '',
                            alt: `Изображение ${(paragraph.imageFrames?.length || 0) + 1}`,
                            paragraphTrigger: paragraph.imageFrames?.length || 0,
                            animation: 'fade',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          };
                          
                          onUpdate({
                            imageFrames: [...(paragraph.imageFrames || []), newFrame]
                          });
                        }}
                        className="mt-2"
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить изображение
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Кнопка добавления нового фрейма внизу списка */}
              {((paragraph.comicFrames?.length || 0) > 0 || (paragraph.type === 'image' && paragraph.imageFrames?.length)) && (
                <Button
                  onClick={() => {
                    const existingFrames = paragraph.comicFrames || paragraph.imageFrames || [];
                    const newFrame: ComicFrame = {
                      id: `frame-${Date.now()}`,
                      type: 'image',
                      url: '',
                      alt: `Изображение ${existingFrames.length + 1}`,
                      paragraphTrigger: existingFrames.length,
                      animation: 'fade',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    };
                    
                    if (paragraph.comicFrames) {
                      onUpdate({
                        comicFrames: [...paragraph.comicFrames, newFrame]
                      });
                    } else if (paragraph.type === 'image' && paragraph.imageGroupId) {
                      onUpdate({
                        imageFrames: [...(paragraph.imageFrames || []), newFrame]
                      });
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить еще изображение
                </Button>
              )}
            </TabsContent>

            <TabsContent value="animation" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Анимация перехода</Label>
                <Select
                  value={paragraph.frameAnimation || 'fade'}
                  onValueChange={(value: FrameAnimationType) =>
                    onUpdate({ frameAnimation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animations.map((anim) => (
                      <SelectItem key={anim.value} value={anim.value}>
                        {anim.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  • <strong>Без анимации</strong> - мгновенное появление
                </p>
                <p>
                  • <strong>Появление</strong> - плавное проявление через
                  прозрачность
                </p>
                <p>
                  • <strong>Слайды</strong> - появление с движением от края
                </p>
                <p>
                  • <strong>Zoom</strong> - масштабирование при появлении
                </p>
                <p>
                  • <strong>Эффекты</strong> - специальные анимации (глитч,
                  тряска)
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}