import { Layer, Animation } from '@/types/scene';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertiesPanelProps {
  layer: Layer;
  onUpdate: (updates: Partial<Layer>) => void;
  animations: Animation[];
}

export default function PropertiesPanel({ layer, onUpdate, animations }: PropertiesPanelProps) {
  return (
    <div className="w-80 border-l flex flex-col">
      <div className="h-12 border-b flex items-center justify-between px-4">
        <span className="text-sm font-semibold">Свойства</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="transform">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transform">
                <Icon name="Move" size={14} />
              </TabsTrigger>
              <TabsTrigger value="style">
                <Icon name="Palette" size={14} />
              </TabsTrigger>
              <TabsTrigger value="animation">
                <Icon name="Sparkles" size={14} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-4 mt-4">
              <div>
                <Label className="text-xs">Имя слоя</Label>
                <Input
                  value={layer.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={Math.round(layer.x)}
                    onChange={(e) => onUpdate({ x: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={Math.round(layer.y)}
                    onChange={(e) => onUpdate({ y: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Ширина</Label>
                  <Input
                    type="number"
                    value={Math.round(layer.width)}
                    onChange={(e) => onUpdate({ width: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Высота</Label>
                  <Input
                    type="number"
                    value={Math.round(layer.height)}
                    onChange={(e) => onUpdate({ height: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Поворот: {layer.rotation}°</Label>
                <Slider
                  value={[layer.rotation]}
                  onValueChange={([v]) => onUpdate({ rotation: v })}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs">Масштаб: {layer.scale.toFixed(2)}</Label>
                <Slider
                  value={[layer.scale]}
                  onValueChange={([v]) => onUpdate({ scale: v })}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs">Прозрачность: {Math.round(layer.opacity * 100)}%</Label>
                <Slider
                  value={[layer.opacity]}
                  onValueChange={([v]) => onUpdate({ opacity: v })}
                  min={0}
                  max={1}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs">Размытие: {layer.blur || 0}px</Label>
                <Slider
                  value={[layer.blur || 0]}
                  onValueChange={([v]) => onUpdate({ blur: v })}
                  min={0}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-4">
              {layer.type === 'text' && (
                <>
                  <div>
                    <Label className="text-xs">Текст</Label>
                    <Textarea
                      value={layer.textContent || ''}
                      onChange={(e) => onUpdate({ textContent: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Размер шрифта</Label>
                    <Input
                      type="number"
                      value={layer.fontSize}
                      onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Выравнивание</Label>
                    <Select
                      value={layer.textAlign}
                      onValueChange={(v: any) => onUpdate({ textAlign: v })}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-xs">Цвет текста</Label>
                    <Input
                      type="color"
                      value={layer.color}
                      onChange={(e) => onUpdate({ color: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>
                </>
              )}

              {layer.type === 'shape' && (
                <div>
                  <Label className="text-xs">Цвет фона</Label>
                  <Input
                    type="color"
                    value={layer.backgroundColor}
                    onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                    className="mt-1 h-10"
                  />
                </div>
              )}

              {layer.type === 'image' && (
                <div>
                  <Label className="text-xs">URL изображения</Label>
                  <Input
                    value={layer.imageUrl || ''}
                    onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                    className="mt-1"
                    placeholder="https://..."
                  />
                </div>
              )}

              {layer.type === 'video' && (
                <div>
                  <Label className="text-xs">URL видео</Label>
                  <Input
                    value={layer.videoUrl || ''}
                    onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                    className="mt-1"
                    placeholder="https://..."
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="animation" className="space-y-4 mt-4">
              {animations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Нет анимаций. Используйте Timeline для добавления.
                </p>
              ) : (
                <div className="space-y-2">
                  {animations.map(anim => (
                    <div key={anim.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{anim.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {anim.duration}s, {anim.keyframes.length} keyframes
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
