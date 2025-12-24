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
                <div className="space-y-4">
                  <div className="space-y-2 pb-4 border-b">
                    <Label>Раскладка фреймов</Label>
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
                      <SelectTrigger>
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
                  </div>

                  {(paragraph.type === 'image' && paragraph.imageFrames ? paragraph.imageFrames : paragraph.comicFrames || []).map((frame, index) => (
                    <div
                      key={frame.id}
                      className="border rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">
                          Фрейм #{index + 1}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteFrame(frame.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>URL изображения</Label>
                        <Input
                          value={frame.url}
                          onChange={(e) =>
                            updateFrame(frame.id, { url: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Вписывание</Label>
                        <Select
                          value={frame.objectFit || 'cover'}
                          onValueChange={(value: 'cover' | 'contain' | 'fill') =>
                            updateFrame(frame.id, { objectFit: value })
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
                        <Label>Позиция</Label>
                        <Input
                          value={frame.objectPosition || 'center'}
                          onChange={(e) =>
                            updateFrame(frame.id, {
                              objectPosition: e.target.value
                            })
                          }
                          placeholder="center, top, bottom"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Анимация появления</Label>
                        <Select
                          value={frame.animation || 'fade'}
                          onValueChange={(value: FrameAnimationType) =>
                            updateFrame(frame.id, { animation: value })
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет фреймов
                  </p>
                  
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
                      className="w-full"
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить фрейм изображения
                    </Button>
                  )}
                </div>
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